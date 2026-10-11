import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { runDueJobs } from "@/app/lib/jobProcessor";

// Triggers on-demand execution of due (or queued) jobs specifically for this campaign.
export async function POST(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const campaignObjectId = new ObjectId(id);
    const workspaceObjectId = new ObjectId(session.workspaceId);

    const campaigns = await dbConnect("campaigns");
    const campaign = await campaigns.findOne({
      _id: campaignObjectId,
      workspaceId: workspaceObjectId,
    });

    if (!campaign) {
      return Response.json({ message: "Campaign not found" }, { status: 404 });
    }

    if (campaign.status !== "active") {
      return Response.json(
        { message: "Campaign must be active to dispatch jobs. Please resume the campaign first." },
        { status: 400 },
      );
    }

    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const maxJobs = typeof body.maxJobs === "number" ? Math.min(100, Math.max(1, body.maxJobs)) : 25;
    const forceDue = Boolean(body.forceDue);

    const summary = await runDueJobs(maxJobs, campaignObjectId, forceDue, "manual_dispatch");

    return Response.json({
      ok: true,
      campaignId: id,
      ...summary,
    });
  } catch (error) {
    console.error("Manual campaign dispatch failed:", error);
    return Response.json({ message: "Failed to dispatch campaign jobs" }, { status: 500 });
  }
}
