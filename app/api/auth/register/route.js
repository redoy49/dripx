import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { hashPassword, signToken, verifyToken } from "@/app/lib/auth";
import { setSessionCookie } from "@/app/lib/session";
import { DEFAULT_DAILY_LIMITS } from "@/app/lib/limits";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req) {
  try {
    const body = await req.json();
    const name = (body.name || "").trim();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const inviteToken = body.invite || null;

    if (!name || !email || !password) {
      return Response.json(
        { message: "Name, email and password are required" },
        { status: 400 },
      );
    }

    if (!EMAIL_RE.test(email)) {
      return Response.json({ message: "Invalid email address" }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json(
        { message: "Password must be at least 6 characters" },
        { status: 400 },
      );
    }

    // If an invite token is present, join the inviting workspace instead of creating a new
    // one. Falls back to a normal signup (new workspace) if the token is missing/invalid/expired.
    let invitePayload = null;
    if (inviteToken) {
      const payload = await verifyToken(inviteToken);
      if (payload?.invitedEmail === email && payload?.workspaceId) {
        invitePayload = payload;
      }
    }

    const users = await dbConnect("users");
    const existing = await users.findOne({ email });

    if (existing) {
      return Response.json(
        { message: "An account with this email already exists" },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const userResult = await users.insertOne({
      name,
      email,
      passwordHash,
      avatarUrl: null,
      createdAt: new Date(),
    });
    const userId = userResult.insertedId;

    let workspaceId;
    const teamMembers = await dbConnect("team_members");

    if (invitePayload) {
      workspaceId = new ObjectId(invitePayload.workspaceId);

      const invitedRow = await teamMembers.findOne({
        workspaceId,
        invitedEmail: email,
        status: "invited",
      });

      if (invitedRow) {
        await teamMembers.updateOne(
          { _id: invitedRow._id },
          { $set: { userId, status: "active", joinedAt: new Date() } },
        );
      } else {
        // Invite row missing (edge case) — create it directly with the token's role.
        await teamMembers.insertOne({
          workspaceId,
          userId,
          role: invitePayload.role || "member",
          status: "active",
          invitedEmail: email,
          invitedByUserId: null,
          invitedAt: new Date(),
          joinedAt: new Date(),
        });
      }
    } else {
      const workspaces = await dbConnect("workspaces");
      const workspaceResult = await workspaces.insertOne({
        name: `${name}'s Workspace`,
        ownerUserId: userId,
        plan: "trial",
        createdAt: new Date(),
        warmupStartedAt: new Date(),
      });
      workspaceId = workspaceResult.insertedId;

      await teamMembers.insertOne({
        workspaceId,
        userId,
        role: "owner",
        status: "active",
        invitedEmail: email,
        invitedByUserId: userId,
        invitedAt: new Date(),
        joinedAt: new Date(),
      });

      const dailyLimits = await dbConnect("daily_limits");
      await dailyLimits.insertOne({
        workspaceId,
        ...DEFAULT_DAILY_LIMITS,
        updatedAt: new Date(),
      });
    }

    const token = await signToken({
      userId: userId.toString(),
      workspaceId: workspaceId.toString(),
    });
    await setSessionCookie(token);

    return Response.json({
      user: { id: userId.toString(), name, email },
      workspaceId: workspaceId.toString(),
    });
  } catch (error) {
    console.error("Register failed:", error);

    return Response.json({ message: "Failed to create account" }, { status: 500 });
  }
}
