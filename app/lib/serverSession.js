import { cache } from "react";
import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { getSession } from "@/app/lib/session";

/**
 * Request-memoized server auth & layout snapshot loader.
 * Ensures layout.jsx and page.jsx share one parallel DB round-trip per SSR request
 * and avoids client-side Judy Jackson placeholder flashes.
 */
export const getLayoutAuthData = cache(async () => {
  const session = await getSession();
  if (!session?.userId || !session?.workspaceId) {
    return null;
  }

  let userObjId;
  let workspaceObjId;
  try {
    userObjId = new ObjectId(session.userId);
    workspaceObjId = new ObjectId(session.workspaceId);
  } catch {
    return null;
  }

  const [users, workspaces, teamMembers, conversations] = await Promise.all([
    dbConnect("users"),
    dbConnect("workspaces"),
    dbConnect("team_members"),
    dbConnect("conversations"),
  ]);

  const [user, workspace, membership, unreadAgg] = await Promise.all([
    users.findOne(
      { _id: userObjId },
      { projection: { name: 1, email: 1, avatarUrl: 1, image: 1 } },
    ),
    workspaces.findOne(
      { _id: workspaceObjId },
      { projection: { name: 1, plan: 1, createdAt: 1 } },
    ),
    teamMembers.findOne(
      { userId: userObjId, workspaceId: workspaceObjId },
      { projection: { role: 1 } },
    ),
    conversations
      .aggregate([
        {
          $match: {
            workspaceId: workspaceObjId,
            unreadCount: { $gt: 0 },
            status: { $ne: "archived" },
          },
        },
        {
          $group: {
            _id: null,
            totalUnread: { $sum: "$unreadCount" },
          },
        },
      ])
      .toArray(),
  ]);

  if (!user || !workspace) {
    return null;
  }

  const fallbackName = user.email ? user.email.split("@")[0] : "Account";
  const createdAt =
    workspace.createdAt instanceof Date
      ? workspace.createdAt.toISOString()
      : workspace.createdAt || null;

  return {
    session,
    user: {
      id: user._id.toString(),
      name: user.name || fallbackName,
      email: user.email || "",
      avatarUrl: user.avatarUrl || user.image || null,
    },
    workspace: {
      id: workspace._id.toString(),
      name: workspace.name || "My Workspace",
      plan: workspace.plan || "trial",
      createdAt,
    },
    role: membership?.role || "member",
    unreadCount: unreadAgg[0]?.totalUnread || 0,
  };
});
