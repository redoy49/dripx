import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { getLinkedInConnector } from "@/app/lib/connectors";
import { sendEmail } from "@/app/lib/email";

export async function GET(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const conversations = await dbConnect("conversations");
    const conversation = await conversations.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });
    if (!conversation) return Response.json({ message: "Conversation not found" }, { status: 404 });

    const messages = await dbConnect("messages");
    const items = await messages.find({ conversationId: conversation._id }).sort({ sentAt: 1 }).toArray();

    return Response.json({
      items: items.map((m) => ({
        id: m._id.toString(),
        direction: m.direction,
        channel: m.channel,
        body: m.body,
        sentAt: m.sentAt,
      })),
    });
  } catch (error) {
    console.error("Fetching messages failed:", error);

    return Response.json({ message: "Failed to fetch messages" }, { status: 500 });
  }
}

// Sends a reply from the current user to the lead, through the modular EmailConnector
// or LinkedIn connector, and logs it into the conversation thread.
export async function POST(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const { body: text } = await req.json();

    if (!text || !text.trim()) {
      return Response.json({ message: "Message body is required" }, { status: 400 });
    }

    const conversations = await dbConnect("conversations");
    const conversation = await conversations.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });
    if (!conversation) return Response.json({ message: "Conversation not found" }, { status: 404 });

    const leads = await dbConnect("leads");
    const lead = await leads.findOne({ _id: conversation.leadId });
    if (!lead) return Response.json({ message: "Lead not found" }, { status: 404 });

    let result;
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
          if (campaign?.senderEmailAccountId) {
            accountId = campaign.senderEmailAccountId;
          }
        }
      }

      if (!accountId) {
        const emailAccounts = await dbConnect("email_accounts");
        const defaultAcc = await emailAccounts.findOne({
          workspaceId: new ObjectId(session.workspaceId),
          status: "connected",
        });
        if (defaultAcc) {
          accountId = defaultAcc._id.toString();
        }
      }

      const subject = conversation.subject?.startsWith("Re:")
        ? conversation.subject
        : `Re: ${conversation.subject || "Outreach"}`;

      const messagesCol = await dbConnect("messages");
      const lastInbound = await messagesCol.findOne(
        { conversationId: conversation._id, direction: "inbound" },
        { sort: { sentAt: -1 } }
      );

      result = await sendEmail({
        to: lead.email,
        subject,
        body: text,
        accountId,
        workspaceId: session.workspaceId,
        inReplyTo: lastInbound?.providerMessageId || null,
        purpose: "campaign",
      });
    } else {
      const connector = getLinkedInConnector();
      result = await connector.sendMessage(lead, text);
    }

    if (!result.success && !result.skipped) {
      return Response.json({ message: result.error || "Failed to send message" }, { status: 502 });
    }

    const messages = await dbConnect("messages");
    const messageDoc = {
      conversationId: conversation._id,
      direction: "outbound",
      channel: conversation.channel,
      body: text,
      sentByUserId: new ObjectId(session.userId),
      sentAt: new Date(),
      providerMessageId: result.providerMessageId || null,
      threadId: result.threadId || conversation.threadId || null,
    };
    await messages.insertOne(messageDoc);

    const convoUpdate = { lastMessageAt: new Date() };
    if (result.threadId && !conversation.threadId) {
      convoUpdate.threadId = result.threadId;
    }
    if (conversation.channel === "email" && !conversation.senderEmailAccountId) {
      convoUpdate.senderEmailAccountId = conversation.senderEmailAccountId || null;
    }
    await conversations.updateOne({ _id: conversation._id }, { $set: convoUpdate });

    return Response.json(
      { ...messageDoc, id: messageDoc._id?.toString(), sentByUserId: session.userId, emailSkipped: !!result.skipped },
      { status: 201 },
    );
  } catch (error) {
    console.error("Sending message failed:", error);

    return Response.json({ message: "Failed to send message" }, { status: 500 });
  }
}
