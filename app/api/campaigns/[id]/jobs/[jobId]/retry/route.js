import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

// Manually resets a failed, skipped, or rate-limited job back to 'queued' so it can be retried immediately.
export async function POST(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id, jobId } = await params;
    const campaignObjectId = new ObjectId(id);
    const workspaceObjectId = new ObjectId(session.workspaceId);
    const jobObjectId = new ObjectId(jobId);

    const campaigns = await dbConnect("campaigns");
    const campaign = await campaigns.findOne({
      _id: campaignObjectId,
      workspaceId: workspaceObjectId,
    });

    if (!campaign) {
      return Response.json({ message: "Campaign not found" }, { status: 404 });
    }

    const jobsCol = await dbConnect("jobs");
    const updated = await jobsCol.findOneAndUpdate(
      { _id: jobObjectId, campaignId: campaignObjectId },
      {
        $set: {
          status: "queued",
          runAfter: new Date(),
          attempts: 0,
          lastError: null,
          lockedAt: null,
          lockedBy: null,
        },
      },
      { returnDocument: "after" },
    );

    if (!updated) {
      return Response.json({ message: "Job not found" }, { status: 404 });
    }

    return Response.json({
      ok: true,
      jobId,
      status: updated.status,
      message: "Job reset to queued for immediate retry",
    });
  } catch (error) {
    console.error("Retrying campaign job failed:", error);
    return Response.json({ message: "Failed to retry job" }, { status: 500 });
  }
}
