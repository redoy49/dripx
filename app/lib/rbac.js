import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";

const ROLE_RANK = { member: 0, admin: 1, owner: 2 };

// Loads the current user's role in their session workspace, then checks it against the
// allowed roles. Returns { ok: true, role } or { ok: false, forbidden: Response }.
// Enforcement is server-side only — the UI just hides actions for lower roles as a courtesy.
export async function requireRole(session, allowedRoles) {
  const teamMembers = await dbConnect("team_members");
  const membership = await teamMembers.findOne({
    userId: new ObjectId(session.userId),
    workspaceId: new ObjectId(session.workspaceId),
    status: "active",
  });

  const role = membership?.role || "member";
  const minRank = Math.min(...allowedRoles.map((r) => ROLE_RANK[r] ?? 99));

  if ((ROLE_RANK[role] ?? -1) < minRank) {
    return {
      ok: false,
      role,
      forbidden: Response.json(
        { message: "You don't have permission to perform this action" },
        { status: 403 },
      ),
    };
  }

  return { ok: true, role };
}
