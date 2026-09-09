import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const users = await dbConnect("users");
    const workspaces = await dbConnect("workspaces");
    const teamMembers = await dbConnect("team_members");

    const [user, workspace, membership] = await Promise.all([
      users.findOne(
        { _id: new ObjectId(session.userId) },
        { projection: { passwordHash: 0 } },
      ),
      workspaces.findOne({ _id: new ObjectId(session.workspaceId) }),
      teamMembers.findOne({
        userId: new ObjectId(session.userId),
        workspaceId: new ObjectId(session.workspaceId),
      }),
    ]);

    if (!user || !workspace) {
      return Response.json({ message: "Session no longer valid" }, { status: 401 });
    }

    return Response.json({
      user: { id: user._id.toString(), name: user.name, email: user.email },
      workspace: { id: workspace._id.toString(), name: workspace.name, plan: workspace.plan },
      role: membership?.role || "member",
    });
  } catch (error) {
    console.error("Fetching session failed:", error);

    return Response.json({ message: "Failed to load session" }, { status: 500 });
  }
}
