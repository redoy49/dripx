import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";

    const query = { workspaceId: new ObjectId(session.workspaceId) };
    if (filter === "unread") query.unreadCount = { $gt: 0 };
    else if (filter === "important") query.status = "important";
    else if (filter === "archived") query.status = "archived";
    else query.status = { $ne: "archived" };

    const conversations = await dbConnect("conversations");
    const leads = await dbConnect("leads");
    const messages = await dbConnect("messages");

    const convos = await conversations.find(query).sort({ lastMessageAt: -1 }).toArray();
    const leadDocs = await leads.find({ _id: { $in: convos.map((c) => c.leadId) } }).toArray();
    const leadById = new Map(leadDocs.map((l) => [l._id.toString(), l]));

    const items = await Promise.all(
      convos.map(async (c) => {
        const lastMessage = await messages.find({ conversationId: c._id }).sort({ sentAt: -1 }).limit(1).next();
        const lead = leadById.get(c.leadId.toString());

        return {
          id: c._id.toString(),
          channel: c.channel,
          status: c.status,
          unreadCount: c.unreadCount || 0,
          lastMessageAt: c.lastMessageAt,
          lastMessagePreview: lastMessage?.body?.slice(0, 60) || "",
          lastMessageDirection: lastMessage?.direction || null,
          lead: lead
            ? {
                id: lead._id.toString(),
                firstName: lead.firstName,
                lastName: lead.lastName,
                company: lead.company,
              }
            : null,
        };
      }),
    );

    return Response.json({ items });
  } catch (error) {
    console.error("Fetching conversations failed:", error);

    return Response.json({ message: "Failed to fetch conversations" }, { status: 500 });
  }
}
