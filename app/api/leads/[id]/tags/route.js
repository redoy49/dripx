import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { serializeLead } from "@/app/api/leads/route";

export async function POST(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const { tag } = await req.json();

    if (!tag || typeof tag !== "string") {
      return Response.json({ message: "Tag is required" }, { status: 400 });
    }

    const leads = await dbConnect("leads");
    const result = await leads.findOneAndUpdate(
      { _id: new ObjectId(id), workspaceId: new ObjectId(session.workspaceId) },
      { $addToSet: { tags: tag.trim() } },
      { returnDocument: "after" },
    );

    if (!result) return Response.json({ message: "Lead not found" }, { status: 404 });

    return Response.json(serializeLead(result));
  } catch (error) {
    console.error("Adding tag failed:", error);

    return Response.json({ message: "Failed to add tag" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const tag = searchParams.get("tag");

    if (!tag) return Response.json({ message: "Tag is required" }, { status: 400 });

    const leads = await dbConnect("leads");
    const result = await leads.findOneAndUpdate(
      { _id: new ObjectId(id), workspaceId: new ObjectId(session.workspaceId) },
      { $pull: { tags: tag } },
      { returnDocument: "after" },
    );

    if (!result) return Response.json({ message: "Lead not found" }, { status: 404 });

    return Response.json(serializeLead(result));
  } catch (error) {
    console.error("Removing tag failed:", error);

    return Response.json({ message: "Failed to remove tag" }, { status: 500 });
  }
}
