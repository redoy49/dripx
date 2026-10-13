import { ObjectId } from "mongodb";
import { dbConnect } from "../mongoDb.js";
import { getEmailConnector } from "./index.js";
import { handleLeadReplied } from "../leadReplied.js";
import { dispatchWebhookEvent } from "../webhooks.js";

function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Synchronizes incoming email replies for a specific connected email account.
 * Idempotently ingests incoming messages, matches to existing leads/conversations,
 * updates conversation threads, pauses active sequence outreach, and advances the Gmail historyId cursor.
 *
 * @param {Object} account - email_accounts document
 * @returns {Promise<{ count: number, error?: string, newHistoryId?: string }>}
 */
export async function syncAccountReplies(account) {
  if (!account || account.status !== "connected") {
    return { count: 0, skipped: true };
  }

  // Only Google accounts support inbound Gmail API sync currently
  if (account.provider !== "google") {
    return { count: 0, skipped: true };
  }

  try {
    const connector = await getEmailConnector({
      accountId: account._id.toString(),
      workspaceId: account.workspaceId?.toString(),
    });

    if (!connector || typeof connector.fetchRecentMessages !== "function") {
      return { count: 0, skipped: true };
    }

    const emailAccountsCol = await dbConnect("email_accounts");
    const leadsCol = await dbConnect("leads");
    const conversationsCol = await dbConnect("conversations");
    const messagesCol = await dbConnect("messages");
    const campaignLeadsCol = await dbConnect("campaign_leads");

    const fetchRes = await connector.fetchRecentMessages({
      historyId: account.historyId || null,
      maxResults: 25,
    });

    if (!fetchRes.success) {
      await emailAccountsCol.updateOne(
        { _id: account._id },
        { $set: { lastSyncError: fetchRes.error, lastSyncAttemptAt: new Date() } }
      );
      return { count: 0, error: fetchRes.error };
    }

    let ingestedCount = 0;
    const workspaceId = typeof account.workspaceId === "string"
      ? new ObjectId(account.workspaceId)
      : account.workspaceId;

    for (const msg of fetchRes.messages || []) {
      if (!msg.id || !msg.fromEmail) continue;

      // 1. Idempotency Check: Skip if message already ingested
      const existingMsg = await messagesCol.findOne({ providerMessageId: msg.id });
      if (existingMsg) {
        continue;
      }

      // 2. Match Conversation & Lead
      let conversation = null;
      let lead = null;

      // 2a. Match by threadId if available
      if (msg.threadId) {
        conversation = await conversationsCol.findOne({
          workspaceId,
          threadId: msg.threadId,
        });

        if (!conversation) {
          const priorMsgInThread = await messagesCol.findOne({ threadId: msg.threadId });
          if (priorMsgInThread) {
            conversation = await conversationsCol.findOne({ _id: priorMsgInThread.conversationId });
          }
        }
      }

      // 2b. If conversation matched, resolve lead from conversation
      if (conversation?.leadId) {
        lead = await leadsCol.findOne({ _id: conversation.leadId });
      }

      // 2c. Fallback: Match lead by sender email address within the workspace
      if (!lead) {
        const regex = new RegExp(`^${escapeRegex(msg.fromEmail)}$`, "i");
        lead = await leadsCol.findOne({
          workspaceId,
          email: { $regex: regex },
        });
      }

      // If sender does not match any lead in this workspace, skip (ignore newsletters/external noise)
      if (!lead) {
        continue;
      }

      // 2d. Find or create conversation for this lead
      if (!conversation) {
        conversation = await conversationsCol.findOne({
          workspaceId,
          leadId: lead._id,
          channel: "email",
        });
      }

      if (!conversation) {
        const cleanSubject = (msg.subject || "").replace(/^re:\s*/i, "").trim() || "Outreach";
        const newConvo = await conversationsCol.insertOne({
          workspaceId,
          leadId: lead._id,
          channel: "email",
          subject: cleanSubject,
          threadId: msg.threadId || null,
          senderEmailAccountId: account._id,
          lastMessageAt: msg.date,
          unreadCount: 0,
          status: "open",
          createdAt: new Date(),
        });
        conversation = { _id: newConvo.insertedId };
      }

      // 3. Persist Inbound Message
      await messagesCol.insertOne({
        conversationId: conversation._id,
        direction: "inbound",
        channel: "email",
        body: msg.text || msg.snippet || "",
        rawBody: msg.rawText || msg.text || null,
        quotedText: msg.quotedText || null,
        html: msg.html || null,
        subject: msg.subject || null,
        from: msg.from,
        to: msg.to,
        sentByUserId: null,
        sentAt: msg.date,
        providerMessageId: msg.id,
        threadId: msg.threadId || null,
        inReplyTo: msg.inReplyTo || null,
        createdAt: new Date(),
      });

      // 4. Update Conversation Metadata
      const convoUpdates = {
        lastMessageAt: msg.date,
        senderEmailAccountId: account._id,
      };
      if (msg.threadId) convoUpdates.threadId = msg.threadId;

      await conversationsCol.updateOne(
        { _id: conversation._id },
        {
          $set: convoUpdates,
          $inc: { unreadCount: 1 },
        }
      );

      // 5. Trigger Sequence Pause on Lead Reply
      const enrollment = await campaignLeadsCol.findOne(
        { leadId: lead._id },
        { sort: { lastActionAt: -1 } }
      );
      const campaignId = enrollment?.campaignId || null;

      await handleLeadReplied(workspaceId, lead._id, campaignId).catch((err) =>
        console.error(`[EmailSync] handleLeadReplied failed for lead ${lead._id}:`, err.message)
      );

      await dispatchWebhookEvent(workspaceId, "lead.replied", {
        campaignId: campaignId ? campaignId.toString() : null,
        leadId: lead._id.toString(),
        channel: "email",
        messageId: msg.id,
        snippet: msg.snippet,
      }).catch(() => {});

      ingestedCount++;
    }

    // 6. Update Account Sync Cursor
    const accountUpdates = {
      lastSyncAt: new Date(),
      lastSyncError: null,
    };
    if (fetchRes.newHistoryId) {
      accountUpdates.historyId = fetchRes.newHistoryId;
    }

    await emailAccountsCol.updateOne(
      { _id: account._id },
      { $set: accountUpdates }
    );

    return {
      count: ingestedCount,
      newHistoryId: fetchRes.newHistoryId,
    };
  } catch (error) {
    console.error(`[EmailSync] syncAccountReplies failed for ${account.email}:`, error);
    return { count: 0, error: error.message };
  }
}

/**
 * Synchronizes email replies across all active connected email accounts.
 *
 * @param {string|ObjectId|null} [workspaceId=null] - Optional workspace filter
 * @returns {Promise<{ syncedAccounts: number, totalNewReplies: number, results: Array }>}
 */
export async function syncAllConnectedEmailAccounts(workspaceId = null) {
  const emailAccountsCol = await dbConnect("email_accounts");
  const query = {
    status: "connected",
    provider: "google",
  };

  if (workspaceId) {
    query.workspaceId = typeof workspaceId === "string" ? new ObjectId(workspaceId) : workspaceId;
  }

  const accounts = await emailAccountsCol.find(query).toArray();
  let totalNewReplies = 0;
  const results = [];

  for (const account of accounts) {
    const outcome = await syncAccountReplies(account);
    totalNewReplies += outcome.count || 0;
    results.push({
      accountId: account._id.toString(),
      email: account.email,
      newReplies: outcome.count || 0,
      error: outcome.error || null,
    });
  }

  return {
    syncedAccounts: accounts.length,
    totalNewReplies,
    results,
  };
}
