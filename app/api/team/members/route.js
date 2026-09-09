import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { requireRole } from "@/app/lib/rbac";
import { signToken } from "@/app/lib/auth";
import { sendEmail } from "@/app/lib/email/resend";

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const teamMembers = await dbConnect("team_members");
    const users = await dbConnect("users");

    const members = await teamMembers
      .find({ workspaceId: new ObjectId(session.workspaceId) })
      .sort({ joinedAt: 1 })
      .toArray();

    const userDocs = await users
      .find({ _id: { $in: members.filter((m) => m.userId).map((m) => m.userId) } })
      .toArray();
    const userById = new Map(userDocs.map((u) => [u._id.toString(), u]));

    return Response.json({
      items: members.map((m) => ({
        id: m._id.toString(),
        role: m.role,
        status: m.status,
        invitedEmail: m.invitedEmail,
        invitedAt: m.invitedAt,
        joinedAt: m.joinedAt,
        user: m.userId && userById.has(m.userId.toString())
          ? {
              id: m.userId.toString(),
              name: userById.get(m.userId.toString()).name,
              email: userById.get(m.userId.toString()).email,
            }
          : null,
      })),
    });
  } catch (error) {
    console.error("Fetching team members failed:", error);

    return Response.json({ message: "Failed to fetch team members" }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const role = ["admin", "member"].includes(body.role) ? body.role : "member";

    if (!email) return Response.json({ message: "Email is required" }, { status: 400 });

    const teamMembers = await dbConnect("team_members");
    const existing = await teamMembers.findOne({
      workspaceId: new ObjectId(session.workspaceId),
      invitedEmail: email,
    });
    if (existing) {
      return Response.json({ message: "This person has already been invited" }, { status: 409 });
    }

    const doc = {
      workspaceId: new ObjectId(session.workspaceId),
      userId: null,
      role,
      status: "invited",
      invitedEmail: email,
      invitedByUserId: new ObjectId(session.userId),
      invitedAt: new Date(),
      joinedAt: null,
    };
    const result = await teamMembers.insertOne(doc);

    const inviteToken = await signToken(
      { workspaceId: session.workspaceId, invitedEmail: email, role },
      "7d",
    );
    const origin = new URL(req.url).origin;
    const inviteUrl = `${origin}/register?invite=${inviteToken}`;

    await sendEmail({
      to: email,
      subject: "You've been invited to a DripX workspace",
      body: `You've been invited to join a DripX workspace as ${role}. Accept your invite: ${inviteUrl}`,
    });

    return Response.json(
      { id: result.insertedId.toString(), role, status: "invited", invitedEmail: email, inviteUrl },
      { status: 201 },
    );
  } catch (error) {
    console.error("Inviting team member failed:", error);

    return Response.json({ message: "Failed to invite team member" }, { status: 500 });
  }
}
