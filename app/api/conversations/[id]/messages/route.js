import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { getLinkedInConnector } from "@/app/lib/connectors";
import { sendEmail } from "@/app/lib/email/resend";

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

// Sends a reply from the current user to the lead, through the same connector/email
// wrapper the automated sequence engine uses, and logs it into the same thread.
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
      result = await sendEmail({ to: lead.email, subject: conversation.subject || "Re:", body: text });
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
    };
    await messages.insertOne(messageDoc);
    await conversations.updateOne({ _id: conversation._id }, { $set: { lastMessageAt: new Date() } });

    return Response.json(
      { ...messageDoc, id: messageDoc._id?.toString(), sentByUserId: session.userId, emailSkipped: !!result.skipped },
      { status: 201 },
    );
  } catch (error) {
    console.error("Sending message failed:", error);

    return Response.json({ message: "Failed to send message" }, { status: 500 });
  }
}
