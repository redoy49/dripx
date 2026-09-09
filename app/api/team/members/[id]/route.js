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

    if (!["admin", "member"].includes(body.role)) {
      return Response.json({ message: "Invalid role" }, { status: 400 });
    }

    const teamMembers = await dbConnect("team_members");
    const target = await teamMembers.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });
    if (!target) return Response.json({ message: "Member not found" }, { status: 404 });
    if (target.role === "owner") {
      return Response.json({ message: "The workspace owner's role can't be changed" }, { status: 400 });
    }

    const result = await teamMembers.findOneAndUpdate(
      { _id: target._id },
      { $set: { role: body.role } },
      { returnDocument: "after" },
    );

    return Response.json({ id: result._id.toString(), role: result.role });
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
