import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

// Removes a lead's enrollment from a campaign (the lead itself stays in the workspace pool).
export async function DELETE(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id, leadId } = await params;

    const campaigns = await dbConnect("campaigns");
    const campaign = await campaigns.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });
    if (!campaign) return Response.json({ message: "Campaign not found" }, { status: 404 });

    const campaignLeads = await dbConnect("campaign_leads");
    const removed = await campaignLeads.findOneAndDelete({
      campaignId: campaign._id,
      leadId: new ObjectId(leadId),
    });

    if (!removed) {
      return Response.json({ message: "Enrollment not found" }, { status: 404 });
    }

    // Also clear any still-queued jobs for this lead in this campaign.
    const jobs = await dbConnect("jobs");
    await jobs.deleteMany({ campaignLeadId: removed._id, status: "queued" });

    return Response.json({ message: "Lead removed from campaign" });
  } catch (error) {
    console.error("Deleting campaign lead enrollment failed:", error);
    return Response.json({ message: "Failed to remove lead" }, { status: 500 });
  }
}

// Updates a lead's enrollment status (e.g. pausing or resuming outreach for this specific lead).
export async function PATCH(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id, leadId } = await params;
    const body = await req.json();

    if (!body.status || !["in_progress", "paused", "replied"].includes(body.status)) {
      return Response.json({ message: "Valid status required" }, { status: 400 });
    }

    const campaigns = await dbConnect("campaigns");
    const campaign = await campaigns.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });
    if (!campaign) return Response.json({ message: "Campaign not found" }, { status: 404 });

    const campaignLeads = await dbConnect("campaign_leads");
    const jobs = await dbConnect("jobs");

    const updated = await campaignLeads.findOneAndUpdate(
      { campaignId: campaign._id, leadId: new ObjectId(leadId) },
      { $set: { status: body.status, lastActionAt: new Date() } },
      { returnDocument: "after" },
    );

    if (!updated) {
      return Response.json({ message: "Enrollment not found" }, { status: 404 });
    }

    if (body.status === "paused") {
      await jobs.updateMany(
        { campaignLeadId: updated._id, status: "queued" },
        { $set: { status: "skipped", lastError: "Lead manually paused" } },
      );
    }

    return Response.json({
      leadId: updated.leadId.toString(),
      status: updated.status,
      lastActionAt: updated.lastActionAt,
    });
  } catch (error) {
    console.error("Updating campaign lead status failed:", error);

    return Response.json({ message: "Failed to update lead status" }, { status: 500 });
  }
}
