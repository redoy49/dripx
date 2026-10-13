import { ObjectId } from "mongodb";
import { dbConnect } from "./mongoDb.js";

/**
 * Automatically pauses sequence outreach for a lead when they reply.
 * Updates campaign_leads status to 'replied' and cancels any pending queued jobs.
 *
 * @param {string|ObjectId} workspaceId
 * @param {string|ObjectId} leadId
 * @param {string|ObjectId|null} [campaignId=null]
 */
export async function handleLeadReplied(workspaceId, leadId, campaignId = null) {
  const campaignLeadsCol = await dbConnect("campaign_leads");
  const jobsCol = await dbConnect("jobs");
  const activityLogsCol = await dbConnect("activity_logs");

  const safeLeadId = typeof leadId === "string" ? new ObjectId(leadId) : leadId;
  const safeWorkspaceId = typeof workspaceId === "string" ? new ObjectId(workspaceId) : workspaceId;
  const safeCampaignId = campaignId ? (typeof campaignId === "string" ? new ObjectId(campaignId) : campaignId) : null;

  const query = { leadId: safeLeadId };
  if (safeCampaignId) query.campaignId = safeCampaignId;

  // 1. Mark campaign enrollments as replied
  await campaignLeadsCol.updateMany(query, {
    $set: {
      status: "replied",
      currentStepId: null,
      lastActionAt: new Date(),
    },
  });

  // 2. Cancel any pending queued jobs for this lead
  await jobsCol.updateMany(
    { leadId: safeLeadId, status: "queued" },
    { $set: { status: "skipped", lastError: "Sequence paused: Lead replied to outreach" } },
  );

  // 3. Log audit event
  await activityLogsCol.insertOne({
    workspaceId: safeWorkspaceId,
    actionType: "sequence_paused_reply",
    leadId: safeLeadId,
    campaignId: safeCampaignId,
    occurredAt: new Date(),
  });
}
