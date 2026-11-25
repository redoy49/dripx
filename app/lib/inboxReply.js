import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { getLinkedInConnector } from "@/app/lib/connectors";
import { sendEmail } from "@/app/lib/email";

/**
 * Dispatches an outbound reply to a conversation via Email (preserving RFC 2822
 * threading headers) or LinkedIn Unipile connector and persists the message.
 * Shared by POST /api/conversations/[id]/messages and AI Agent reply tool.
 */
export async function sendConversationReply({ conversationId, workspaceId, userId, text }) {
  if (!text || !text.trim()) {
    return { ok: false, status: 400, message: "Message body is required" };
  }

  const conversations = await dbConnect("conversations");
  const conversation = await conversations.findOne({
    _id: new ObjectId(conversationId),
    workspaceId: new ObjectId(workspaceId),
  });
  if (!conversation) return { ok: false, status: 404, message: "Conversation not found" };

  const leads = await dbConnect("leads");
  const lead = await leads.findOne({ _id: conversation.leadId });
  if (!lead) return { ok: false, status: 404, message: "Lead not found" };

  let result;
  let inReplyTo = null;
  let references = null;
  let resolvedThreadId = conversation.threadId || null;

  if (conversation.channel === "email") {
    let accountId = conversation.senderEmailAccountId || null;
    if (!accountId && conversation.leadId) {
      const campaignLeads = await dbConnect("campaign_leads");
      const enrollment = await campaignLeads.findOne({
        leadId: typeof conversation.leadId === "string" ? new ObjectId(conversation.leadId) : conversation.leadId,
      });
      if (enrollment?.campaignId) {
        const campaigns = await dbConnect("campaigns");
        const campaign = await campaigns.findOne({ _id: enrollment.campaignId });
        if (campaign?.senderEmailAccountId) accountId = campaign.senderEmailAccountId;
      }
    }

    if (!accountId) {
      const emailAccounts = await dbConnect("email_accounts");
      const defaultAcc = await emailAccounts.findOne({
        workspaceId: new ObjectId(workspaceId),
        status: "connected",
      });
      if (defaultAcc) accountId = defaultAcc._id.toString();
    }

    const messagesCol = await dbConnect("messages");
    const lastInbound = await messagesCol.findOne(
      { conversationId: conversation._id, direction: "inbound" },
      { sort: { sentAt: -1 } }
    );

    resolvedThreadId = conversation.threadId || lastInbound?.threadId || null;
    const baseSubject = (conversation.subject || lastInbound?.subject || "Outreach")
      .replace(/^(?:re:\s*)+/i, "")
      .trim();
    const subject = `Re: ${baseSubject}`;

    inReplyTo = lastInbound?.messageIdHeader || null;
    references = lastInbound?.references || null;

    if (!inReplyTo && lastInbound?.providerMessageId && accountId) {
      try {
        const { getEmailConnector } = await import("@/app/lib/email");
        const connector = await getEmailConnector({ accountId, workspaceId });
        if (connector && typeof connector.fetchMessage === "function") {
          const fetched = await connector.fetchMessage(lastInbound.providerMessageId);
          if (fetched?.messageIdHeader) {
            inReplyTo = fetched.messageIdHeader;
            references = fetched.references || inReplyTo;
            await messagesCol.updateOne(
              { _id: lastInbound._id },
              { $set: { messageIdHeader: inReplyTo, references } }
            );
          }
        }
      } catch (fetchErr) {
        console.warn("[InboxReply] Failed to fetch message headers:", fetchErr.message);
      }
    }

    if (!inReplyTo && lastInbound?.providerMessageId) {
      inReplyTo = `<${lastInbound.providerMessageId}@mail.gmail.com>`;
      if (!references) references = inReplyTo;
    }

    result = await sendEmail({
      to: lead.email,
      subject,
      body: text,
      accountId,
      workspaceId,
      inReplyTo,
      references,
      threadId: resolvedThreadId,
      purpose: "campaign",
    });
  } else {
    const connector = getLinkedInConnector();
    result = await connector.sendMessage(lead, text);
  }

  if (!result.success && !result.skipped) {
    return { ok: false, status: 502, message: result.error || "Failed to send message" };
  }

  if (result.threadId) resolvedThreadId = result.threadId;

  const messages = await dbConnect("messages");
  const messageDoc = {
    conversationId: conversation._id,
    direction: "outbound",
    channel: conversation.channel,
    body: text,
    sentByUserId: new ObjectId(userId),
    sentAt: new Date(),
    providerMessageId: result.providerMessageId || null,
    messageIdHeader: result.messageIdHeader || null,
    threadId: resolvedThreadId,
    inReplyTo: inReplyTo || null,
    references: references || null,
  };
  await messages.insertOne(messageDoc);

  const convoUpdate = { lastMessageAt: new Date() };
  if (resolvedThreadId && !conversation.threadId) convoUpdate.threadId = resolvedThreadId;
  await conversations.updateOne({ _id: conversation._id }, { $set: convoUpdate });

  return {
    ok: true,
    status: 201,
    data: { ...messageDoc, id: messageDoc._id?.toString(), sentByUserId: userId, emailSkipped: !!result.skipped },
  };
}
