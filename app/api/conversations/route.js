import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all";
    const channel = searchParams.get("channel");

    const query = { workspaceId: new ObjectId(session.workspaceId) };
    if (filter === "unread") query.unreadCount = { $gt: 0 };
    else if (filter === "important") query.status = "important";
    else if (filter === "archived") query.status = "archived";
    else query.status = { $ne: "archived" };

    if (channel && channel !== "all") {
      query.channel = channel;
    }

    const conversations = await dbConnect("conversations");
    const leads = await dbConnect("leads");
    const messages = await dbConnect("messages");

    const convos = await conversations.find(query).sort({ lastMessageAt: -1 }).toArray();

    if (convos.length === 0) {
      return Response.json({ items: [] });
    }

    const convoIds = convos.map((c) => c._id);
    const validLeadIds = convos.map((c) => c.leadId).filter(Boolean);

    const [leadDocs, latestMessages] = await Promise.all([
      validLeadIds.length > 0 ? leads.find({ _id: { $in: validLeadIds } }).toArray() : [],
      messages
        .aggregate([
          { $match: { conversationId: { $in: convoIds } } },
          { $sort: { sentAt: -1 } },
          {
            $group: {
              _id: "$conversationId",
              body: { $first: "$body" },
              direction: { $first: "$direction" },
              sentAt: { $first: "$sentAt" },
            },
          },
        ])
        .toArray(),
    ]);

    const leadById = new Map(leadDocs.map((l) => [l._id.toString(), l]));
    const messageByConvoId = new Map(latestMessages.map((m) => [m._id.toString(), m]));

    const items = convos.map((c) => {
      const lastMessage = messageByConvoId.get(c._id.toString());
      const lead = c.leadId ? leadById.get(c.leadId.toString()) : null;

      return {
        id: c._id.toString(),
        channel: c.channel,
        status: c.status,
        unreadCount: c.unreadCount || 0,
        lastMessageAt: c.lastMessageAt || lastMessage?.sentAt || null,
        lastMessagePreview: lastMessage?.body?.slice(0, 80) || "",
        lastMessageDirection: lastMessage?.direction || null,
        lead: lead
          ? {
              id: lead._id.toString(),
              firstName: lead.firstName || "",
              lastName: lead.lastName || "",
              email: lead.email || "",
              company: lead.company || "",
              jobTitle: lead.jobTitle || "",
            }
          : null,
      };
    });

    return Response.json({ items });
  } catch (error) {
    console.error("Fetching conversations failed:", error);

    return Response.json({ message: "Failed to fetch conversations" }, { status: 500 });
  }
}
