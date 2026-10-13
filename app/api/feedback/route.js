import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const body = await req.json().catch(() => ({}));
    const { title, category = "General", description = "" } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return Response.json(
        { message: "Feature title is required." },
        { status: 400 }
      );
    }

    const featureRequests = await dbConnect("feature_requests");
    const newDoc = {
      userId: session.userId,
      workspaceId: session.workspaceId,
      title: title.trim(),
      category: category.trim(),
      description: description.trim(),
      status: "pending_review",
      createdAt: new Date(),
    };

    const result = await featureRequests.insertOne(newDoc);

    return Response.json({
      ok: true,
      id: result.insertedId.toString(),
      message: "Thank you! Your feature request has been received.",
    });
  } catch (error) {
    console.error("Failed to submit feature request:", error);
    return Response.json(
      { message: "Failed to submit feature request. Please try again." },
      { status: 500 }
    );
  }
}
