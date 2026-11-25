import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { requireRole } from "@/app/lib/rbac";

export async function PATCH(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const { id } = await params;
    const body = await req.json();

    const update = {};
    if (body.role !== undefined) {
      if (!["admin", "member"].includes(body.role)) {
        return Response.json({ message: "Invalid role" }, { status: 400 });
      }
      update.role = body.role;
    }
    if (typeof body.aiAgentAccess === "boolean") {
      update.aiAgentAccess = body.aiAgentAccess;
    }
    if (Object.keys(update).length === 0) {
      return Response.json({ message: "No valid fields to update" }, { status: 400 });
    }

    const teamMembers = await dbConnect("team_members");
    const target = await teamMembers.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });
    if (!target) return Response.json({ message: "Member not found" }, { status: 404 });
    if (target.role === "owner" && update.role) {
      return Response.json({ message: "The workspace owner's role can't be changed" }, { status: 400 });
    }

    const result = await teamMembers.findOneAndUpdate(
      { _id: target._id },
      { $set: update },
      { returnDocument: "after" },
    );

    return Response.json({
      id: result._id.toString(),
      role: result.role,
      aiAgentAccess: result.role === "owner" || result.role === "admin" || Boolean(result.aiAgentAccess),
    });
  } catch (error) {
    console.error("Updating team member failed:", error);

    return Response.json({ message: "Failed to update team member" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const { id } = await params;
    const teamMembers = await dbConnect("team_members");
    const target = await teamMembers.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });
    if (!target) return Response.json({ message: "Member not found" }, { status: 404 });
    if (target.role === "owner") {
      return Response.json({ message: "The workspace owner can't be removed" }, { status: 400 });
    }

    await teamMembers.deleteOne({ _id: target._id });

    return Response.json({ message: "Member removed" });
  } catch (error) {
    console.error("Removing team member failed:", error);

    return Response.json({ message: "Failed to remove team member" }, { status: 500 });
  }
}
