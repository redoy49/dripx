import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { requireAiAgentAccess } from "@/app/lib/rbac";

export async function GET(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireAiAgentAccess(session);
    if (!ok) return forbidden;

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return Response.json({ message: "Invalid thread ID" }, { status: 400 });
    }

    const col = await dbConnect("agent_threads");
    const doc = await col.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
      userId: new ObjectId(session.userId),
    });
    if (!doc) return Response.json({ message: "Thread not found" }, { status: 404 });

    return Response.json({
      id: doc._id.toString(),
      title: doc.title,
      modelId: doc.modelId,
      mode: doc.mode,
      messages: doc.messages || [],
    });
  } catch (error) {
    console.error("[AgentThread] GET error:", error);
    return Response.json({ message: "Failed to load thread" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireAiAgentAccess(session);
    if (!ok) return forbidden;

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return Response.json({ message: "Invalid thread ID" }, { status: 400 });
    }

    const col = await dbConnect("agent_threads");
    await col.deleteOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
      userId: new ObjectId(session.userId),
    });
    return Response.json({ deleted: true });
  } catch (error) {
    console.error("[AgentThread] DELETE error:", error);
    return Response.json({ message: "Failed to delete thread" }, { status: 500 });
  }
}
