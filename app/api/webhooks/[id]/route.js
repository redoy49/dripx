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
    if (body.status && ["active", "disabled"].includes(body.status)) update.status = body.status;
    if (Array.isArray(body.events)) update.events = body.events;

    const webhooks = await dbConnect("webhooks");
    const result = await webhooks.findOneAndUpdate(
      { _id: new ObjectId(id), workspaceId: new ObjectId(session.workspaceId) },
      { $set: update },
      { returnDocument: "after" },
    );

    if (!result) return Response.json({ message: "Webhook not found" }, { status: 404 });

    return Response.json({
      id: result._id.toString(),
      url: result.url,
      events: result.events,
      status: result.status,
    });
  } catch (error) {
    console.error("Updating webhook failed:", error);

    return Response.json({ message: "Failed to update webhook" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const { id } = await params;
    const webhooks = await dbConnect("webhooks");
    const result = await webhooks.deleteOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });

    if (result.deletedCount === 0) {
      return Response.json({ message: "Webhook not found" }, { status: 404 });
    }

    return Response.json({ message: "Webhook deleted" });
  } catch (error) {
    console.error("Deleting webhook failed:", error);

    return Response.json({ message: "Failed to delete webhook" }, { status: 500 });
  }
}
