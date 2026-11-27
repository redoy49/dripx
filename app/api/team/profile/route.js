import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { getTeamProfileData } from "@/app/lib/teamProfile";

export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const url = new URL(req.url);
    const range = url.searchParams.get("range") || "7";

    const profile = await getTeamProfileData({
      userId: session.userId,
      workspaceId: session.workspaceId,
      range,
    });

    if (!profile) {
      return Response.json({ message: "Session no longer valid" }, { status: 401 });
    }

    return Response.json(profile);
  } catch (error) {
    console.error("Failed to load team profile:", error);
    return Response.json({ message: "Failed to load team profile" }, { status: 500 });
  }
}

export async function PATCH(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const update = {};

    if (typeof body.name === "string" && body.name.trim()) update.name = body.name.trim();
    if (typeof body.linkedinUrl === "string") update.linkedinUrl = body.linkedinUrl.trim();
    if (typeof body.headline === "string") update.headline = body.headline.trim();
    if (typeof body.avatarUrl === "string" && body.avatarUrl.trim()) {
      update.avatarUrl = body.avatarUrl.trim();
    }
    if (body.connectionsCount !== undefined) {
      update.connectionsCount = Number(body.connectionsCount) || 0;
    }

    if (Object.keys(update).length === 0) {
      return Response.json({ message: "No valid fields to update" }, { status: 400 });
    }

    const usersCol = await dbConnect("users");
    await usersCol.updateOne(
      { _id: new ObjectId(session.userId) },
      { $set: { ...update, updatedAt: new Date() } },
    );

    return Response.json({ ok: true, updated: update });
  } catch (error) {
    console.error("Updating team profile failed:", error);
    return Response.json({ message: "Failed to update profile" }, { status: 500 });
  }
}
