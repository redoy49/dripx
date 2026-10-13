import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { simulateLeadJourney } from "@/app/lib/sequenceSimulator";

// Simulates sequence execution for a lead with zero database mutations or external network calls.
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

    let body = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    let targetLeadId = body.leadId;

    if (!targetLeadId) {
      // Pick first enrolled lead in this campaign
      const campaignLeads = await dbConnect("campaign_leads");
      const firstEnrollment = await campaignLeads.findOne({ campaignId: campaignObjectId });
      if (firstEnrollment) {
        targetLeadId = firstEnrollment.leadId.toString();
      } else {
        // Fallback to any lead in the workspace
        const leads = await dbConnect("leads");
        const sampleLead = await leads.findOne({ workspaceId: workspaceObjectId });
        if (sampleLead) {
          targetLeadId = sampleLead._id.toString();
        }
      }
    }

    if (!targetLeadId) {
      return Response.json(
        { message: "No leads found in this campaign or workspace to simulate with. Please enroll a lead first." },
        { status: 400 },
      );
    }

    const simulation = await simulateLeadJourney(campaignObjectId, targetLeadId, {
      simulateReplied: body.simulateReplied,
    });

    return Response.json({
      ok: true,
      simulation,
    });
  } catch (error) {
    console.error("Sequence simulation failed:", error);
    return Response.json({ message: error.message || "Failed to simulate sequence" }, { status: 500 });
  }
}
