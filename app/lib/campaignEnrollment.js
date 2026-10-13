import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";

// Enrolls a set of leads into a campaign as campaign_leads rows, skipping leads already
// enrolled in that campaign. currentStepId starts null — set once the campaign is activated
// and the first job for each lead is created (see campaigns/[id]/activate).
export async function enrollLeads(campaignId, leadIds) {
  if (!leadIds.length) return { enrolled: 0, skipped: 0 };

  const campaignLeads = await dbConnect("campaign_leads");
  const campaignObjectId = new ObjectId(campaignId);
  const leadObjectIds = leadIds.map((id) => new ObjectId(id));

  const existing = await campaignLeads
    .find({ campaignId: campaignObjectId, leadId: { $in: leadObjectIds } })
    .project({ leadId: 1 })
    .toArray();
  const existingSet = new Set(existing.map((e) => e.leadId.toString()));

  const toInsert = leadObjectIds
    .filter((id) => !existingSet.has(id.toString()))
    .map((leadId) => ({
      campaignId: campaignObjectId,
      leadId,
      currentStepId: null,
      status: "pending",
      enrolledAt: new Date(),
      lastActionAt: null,
    }));

  let queuedJobsCount = 0;
  if (toInsert.length > 0) {
    const insertResult = await campaignLeads.insertMany(toInsert);

    // If campaign is already active, immediately queue first jobs for new enrollments
    const campaigns = await dbConnect("campaigns");
    const campaign = await campaigns.findOne({ _id: campaignObjectId });

    if (campaign && campaign.status === "active") {
      const sequenceSteps = await dbConnect("sequence_steps");
      const steps = await sequenceSteps.find({ campaignId: campaignObjectId }).sort({ order: 1 }).toArray();

      if (steps.length > 0) {
        const { resolveFirstExecutableStep } = await import("@/app/lib/sequenceEngine");
        const jobsCol = await dbConnect("jobs");

        const insertedIds = Object.values(insertResult.insertedIds);
        const newEnrollments = await campaignLeads.find({ _id: { $in: insertedIds } }).toArray();

        for (const cl of newEnrollments) {
          const { nextStep, delayMs } = await resolveFirstExecutableStep(steps, () => false);
          if (nextStep) {
            await jobsCol.insertOne({
              workspaceId: campaign.workspaceId,
              campaignId: campaignObjectId,
              campaignLeadId: cl._id,
              stepId: nextStep._id,
              type: nextStep.type,
              runAfter: new Date(Date.now() + delayMs),
              status: "queued",
              attempts: 0,
              lastError: null,
              createdAt: new Date(),
            });
            await campaignLeads.updateOne(
              { _id: cl._id },
              { $set: { currentStepId: nextStep._id, status: "in_progress" } },
            );
            queuedJobsCount++;
          }
        }
      }
    }
  }

  return {
    enrolled: toInsert.length,
    skipped: leadObjectIds.length - toInsert.length,
    queuedJobs: queuedJobsCount,
  };
}
