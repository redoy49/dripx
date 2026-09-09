import { dbConnect } from "@/app/lib/mongoDb";
import { verifyPassword, signToken } from "@/app/lib/auth";
import { setSessionCookie } from "@/app/lib/session";

export async function POST(req) {
  try {
    const body = await req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return Response.json(
        { message: "Email and password are required" },
        { status: 400 },
      );
    }

    const users = await dbConnect("users");
    const user = await users.findOne({ email });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      return Response.json({ message: "Invalid email or password" }, { status: 401 });
    }

    const teamMembers = await dbConnect("team_members");
    const membership = await teamMembers.findOne({
      userId: user._id,
      status: "active",
    });

    if (!membership) {
      return Response.json(
        { message: "No active workspace found for this account" },
        { status: 403 },
      );
    }

    const token = await signToken({
      userId: user._id.toString(),
      workspaceId: membership.workspaceId.toString(),
    });
    await setSessionCookie(token);

    return Response.json({
      user: { id: user._id.toString(), name: user.name, email: user.email },
      workspaceId: membership.workspaceId.toString(),
    });
  } catch (error) {
    console.error("Login failed:", error);

    return Response.json({ message: "Failed to log in" }, { status: 500 });
  }
}
