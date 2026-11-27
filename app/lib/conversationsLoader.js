import { cache } from "react";
import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";

function toIso(val) {
  if (!val) return null;
  return val instanceof Date ? val.toISOString() : String(val);
}

/**
 * Shared server-side conversations loader used by Inbox SSR streaming
 * and `GET /api/conversations`.
 */
export const getConversationsList = cache(async ({ workspaceId, filter = "all", channel = "all" }) => {
  const query = { workspaceId: new ObjectId(workspaceId) };
  if (filter === "unread") query.unreadCount = { $gt: 0 };
  else if (filter === "important") query.status = "important";
  else if (filter === "archived") query.status = "archived";
  else query.status = { $ne: "archived" };

  if (channel && channel !== "all") {
    query.channel = channel;
  }

  const [conversations, leads, messages] = await Promise.all([
    dbConnect("conversations"),
    dbConnect("leads"),
    dbConnect("messages"),
  ]);

  const convos = await conversations.find(query).sort({ lastMessageAt: -1 }).toArray();
  if (convos.length === 0) return [];

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

  return convos.map((c) => {
    const lastMessage = messageByConvoId.get(c._id.toString());
    const lead = c.leadId ? leadById.get(c.leadId.toString()) : null;

    return {
      id: c._id.toString(),
      channel: c.channel,
      status: c.status,
      unreadCount: c.unreadCount || 0,
      lastMessageAt: toIso(c.lastMessageAt || lastMessage?.sentAt),
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
});
