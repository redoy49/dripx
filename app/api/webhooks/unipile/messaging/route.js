import { dbConnect } from "@/app/lib/mongoDb";
import { unipileWebhookSecret, slugFromLinkedinUrl } from "@/app/lib/integrations/unipile";
import { dispatchWebhookEvent } from "@/app/lib/webhooks";

// Tries the cached unipile.providerId first, falling back to matching the sender's
// profile URL against the lead's linkedinUrl (covers a reply arriving before we ever
// resolved their provider_id) and backfilling it for next time.
async function findLead(workspaceId, sender) {
  const leads = await dbConnect("leads");

  if (sender.attendee_provider_id) {
    const byProviderId = await leads.findOne({ workspaceId, "unipile.providerId": sender.attendee_provider_id });
    if (byProviderId) return byProviderId;
  }

  const slug = slugFromLinkedinUrl(sender.attendee_profile_url);
  if (!slug) return null;

  const candidates = await leads.find({ workspaceId, linkedinUrl: { $exists: true, $ne: "" } }).toArray();
  const match = candidates.find((l) => slugFromLinkedinUrl(l.linkedinUrl) === slug);

  if (match && sender.attendee_provider_id) {
    await leads.updateOne({ _id: match._id }, { $set: { "unipile.providerId": sender.attendee_provider_id } });
  }

  return match || null;
}

async function findRecentCampaignId(leadId) {
  const campaignLeads = await dbConnect("campaign_leads");
  const row = await campaignLeads.findOne({ leadId }, { sort: { lastActionAt: -1 } });
  return row?.campaignId || null;
}

export async function POST(req) {
  try {
    const secret = req.headers.get("x-unipile-secret");
    if (secret !== unipileWebhookSecret()) {
      return Response.json({ message: "Invalid signature" }, { status: 401 });
    }

    const body = await req.json();
    if (body.event && body.event !== "message_received") {
      return Response.json({ ok: true }); // Subscribed to message_received only, but be defensive.
    }

    // Unipile echoes our own outbound sends back through this event too — skip those,
    // jobProcessor.js already records them at send time.
    const isSelf = body.sender?.attendee_provider_id && body.sender.attendee_provider_id === body.account_info?.user_id;
    if (isSelf) return Response.json({ ok: true });

    const integrations = await dbConnect("integrations");
    const integration = await integrations.findOne({ type: "unipile", accountId: body.account_id });
    if (!integration) return Response.json({ ok: true }); // Unknown account, nothing to attribute this to.

    const lead = await findLead(integration.workspaceId, body.sender || {});
    if (!lead) {
      console.warn(`Unipile message_received from an unrecognized profile (account ${body.account_id})`);
      return Response.json({ ok: true });
    }

    const leads = await dbConnect("leads");
    if (body.chat_id && lead.unipile?.chatId !== body.chat_id) {
      await leads.updateOne({ _id: lead._id }, { $set: { "unipile.chatId": body.chat_id } });
    }

    const conversations = await dbConnect("conversations");
    const messages = await dbConnect("messages");

    let conversation = await conversations.findOne({ leadId: lead._id, channel: "linkedin" });
    if (!conversation) {
      const result = await conversations.insertOne({
        workspaceId: integration.workspaceId,
        leadId: lead._id,
        channel: "linkedin",
        subject: null,
        lastMessageAt: new Date(),
        unreadCount: 0,
        status: "open",
      });
      conversation = { _id: result.insertedId };
    }

    await messages.insertOne({
      conversationId: conversation._id,
      direction: "inbound",
      channel: "linkedin",
      body: body.message || "",
      sentByUserId: null,
      sentAt: body.timestamp ? new Date(body.timestamp) : new Date(),
      providerMessageId: body.message_id || null,
    });

    await conversations.updateOne(
      { _id: conversation._id },
      { $set: { lastMessageAt: new Date() }, $inc: { unreadCount: 1 } },
    );

    const campaignId = await findRecentCampaignId(lead._id);
    await dispatchWebhookEvent(integration.workspaceId, "lead.replied", {
      campaignId: campaignId ? campaignId.toString() : null,
      leadId: lead._id.toString(),
    });

    return Response.json({ ok: true });
  } catch (error) {
    console.error("Unipile messaging webhook failed:", error);
    return Response.json({ message: "Webhook processing failed" }, { status: 500 });
  }
}
