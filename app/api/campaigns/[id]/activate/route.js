import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { requireRole } from "@/app/lib/rbac";
import { resolveFirstExecutableStep } from "@/app/lib/sequenceEngine";
import { serializeCampaign } from "@/app/api/campaigns/route";

// Finds the lead's "replied" state for condition steps at activation time (mirrors the
// same check jobProcessor uses once the campaign is running).
async function evaluateHasReplied(leadId, enrolledAt) {
  const conversations = await dbConnect("conversations");
  const messages = await dbConnect("messages");

  const leadConversations = await conversations.find({ leadId }).project({ _id: 1 }).toArray();
  if (leadConversations.length === 0) return false;

  const count = await messages.countDocuments({
    conversationId: { $in: leadConversations.map((c) => c._id) },
    direction: "inbound",
    sentAt: { $gte: enrolledAt },
  });

  return count > 0;
}

// Flips a campaign to "active" and creates the first queued job for every pending lead.
// Only the FIRST job is created here — as each job completes, jobProcessor enqueues the
// next one — because branching means later steps aren't knowable until earlier ones resolve.
export async function POST(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { ok, forbidden } = await requireRole(session, ["owner", "admin"]);
    if (!ok) return forbidden;

    const { id } = await params;
    const campaigns = await dbConnect("campaigns");
    const campaign = await campaigns.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });
    if (!campaign) return Response.json({ message: "Campaign not found" }, { status: 404 });

    const sequenceSteps = await dbConnect("sequence_steps");
    const steps = await sequenceSteps.find({ campaignId: campaign._id }).sort({ order: 1 }).toArray();

    if (steps.length === 0) {
      return Response.json(
        { message: "Add at least one step to the sequence before activating" },
        { status: 400 },
      );
    }

    const campaignLeadsCol = await dbConnect("campaign_leads");
    const pendingLeads = await campaignLeadsCol
      .find({ campaignId: campaign._id, status: "pending" })
      .toArray();

    const jobsCol = await dbConnect("jobs");
    let queuedCount = 0;

    for (const campaignLead of pendingLeads) {
      const { nextStep, delayMs } = await resolveFirstExecutableStep(steps, (conditionStep) =>
        evaluateHasReplied(campaignLead.leadId, campaignLead.enrolledAt),
      );

      if (!nextStep) continue;

      await jobsCol.insertOne({
        workspaceId: campaign.workspaceId,
        campaignId: campaign._id,
        campaignLeadId: campaignLead._id,
        stepId: nextStep._id,
        type: nextStep.type,
        runAfter: new Date(Date.now() + delayMs),
        status: "queued",
        attempts: 0,
        lastError: null,
        createdAt: new Date(),
      });
      await campaignLeadsCol.updateOne(
        { _id: campaignLead._id },
        { $set: { currentStepId: nextStep._id, status: "in_progress" } },
      );
      queuedCount++;
    }

    const updated = await campaigns.findOneAndUpdate(
      { _id: campaign._id },
      { $set: { status: "active" } },
      { returnDocument: "after" },
    );

    return Response.json({
      campaign: await serializeCampaign(updated, campaignLeadsCol),
      queuedLeads: queuedCount,
    });
  } catch (error) {
    console.error("Activating campaign failed:", error);

    return Response.json({ message: "Failed to activate campaign" }, { status: 500 });
  }
}
