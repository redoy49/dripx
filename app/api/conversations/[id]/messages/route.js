import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { sendConversationReply } from "@/app/lib/inboxReply";

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

export async function POST(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const { body: text } = await req.json();

    const result = await sendConversationReply({
      conversationId: id,
      workspaceId: session.workspaceId,
      userId: session.userId,
      text,
    });

    if (!result.ok) {
      return Response.json({ message: result.message }, { status: result.status });
    }

    return Response.json(result.data, { status: result.status });
  } catch (error) {
    console.error("Sending message failed:", error);
    return Response.json({ message: "Failed to send message" }, { status: 500 });
  }
}
