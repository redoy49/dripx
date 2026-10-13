import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const conversations = await dbConnect("conversations");
    const result = await conversations
      .aggregate([
        {
          $match: {
            workspaceId: new ObjectId(session.workspaceId),
            unreadCount: { $gt: 0 },
            status: { $ne: "archived" },
          },
        },
        {
          $group: {
            _id: null,
            totalUnread: { $sum: "$unreadCount" },
            unreadConversations: { $sum: 1 },
          },
        },
      ])
      .toArray();

    const data = result[0] || { totalUnread: 0, unreadConversations: 0 };

    return Response.json({
      totalUnread: data.totalUnread || 0,
      unreadConversations: data.unreadConversations || 0,
    });
  } catch (error) {
    console.error("Failed to fetch unread count:", error);
    return Response.json({ message: "Failed to fetch unread count" }, { status: 500 });
  }
}
