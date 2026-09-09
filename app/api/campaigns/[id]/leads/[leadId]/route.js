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
    console.error("Removing lead from campaign failed:", error);

    return Response.json({ message: "Failed to remove lead from campaign" }, { status: 500 });
  }
}
