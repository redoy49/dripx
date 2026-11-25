import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { resolveFirstExecutableStep } from "@/app/lib/sequenceEngine";
import { serializeCampaign } from "@/app/api/campaigns/route";
import { runDueJobs } from "@/app/lib/jobProcessor";
import {
  calculateStaggeredRunTime,
  calculateScheduledRunTime,
  resolveEffectiveSchedule,
  isWithinSendingWindow,
  getNextWindowStart,
} from "@/app/lib/scheduleEngine";

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

/**
 * Validates a campaign's sequence and sender account, queues first jobs for all
 * pending leads, activates the campaign, and triggers initial dispatch.
 * Shared by POST /api/campaigns/[id]/activate and AI Agent activation tool.
 */
export async function activateCampaignForWorkspace(campaignId, workspaceId) {
  const campaigns = await dbConnect("campaigns");
  const campaign = await campaigns.findOne({
    _id: new ObjectId(campaignId),
    workspaceId: new ObjectId(workspaceId),
  });
  if (!campaign) return { ok: false, status: 404, message: "Campaign not found" };

  const sequenceSteps = await dbConnect("sequence_steps");
  const steps = await sequenceSteps.find({ campaignId: campaign._id }).sort({ order: 1 }).toArray();
  if (steps.length === 0) {
    return { ok: false, status: 400, message: "Add at least one step to the sequence before activating" };
  }

  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    if (step.type === "email_followup" && !step.config?.template?.trim()) {
      return { ok: false, status: 400, message: "Configure the message body for your Email Follow-up step before activating" };
    }
    if (step.type === "email") {
      const isFollowUp = steps.slice(0, i).some((s) => s.type === "email" || s.type === "email_followup");
      if (!step.config?.template?.trim()) {
        return { ok: false, status: 400, message: "Configure the message body for your email step before activating" };
      }
      if (!isFollowUp && !step.config?.subject?.trim()) {
        return { ok: false, status: 400, message: "Configure the subject line for your initial email step before activating" };
      }
    } else if (step.type === "inmail" && (!step.config?.template?.trim() || !step.config?.subject?.trim())) {
      return { ok: false, status: 400, message: "Configure the subject line and message body for your inmail step before activating" };
    } else if ((step.type === "message" || step.type === "follow_up") && !step.config?.template?.trim()) {
      return { ok: false, status: 400, message: `Configure the message template for your ${step.type} step before activating` };
    }
  }

  const hasEmailSteps = steps.some((s) => s.type === "email" || s.type === "email_followup");
  if (hasEmailSteps) {
    const emailAccountsCol = await dbConnect("email_accounts");
    const senderAccount = campaign.senderEmailAccountId
      ? await emailAccountsCol.findOne({
          _id: new ObjectId(campaign.senderEmailAccountId),
          workspaceId: new ObjectId(workspaceId),
        })
      : await emailAccountsCol.findOne({
          workspaceId: new ObjectId(workspaceId),
          status: "connected",
        });

    if (!senderAccount && !process.env.RESEND_API_KEY) {
      return {
        ok: false,
        status: 400,
        message: "Connect and select an active email sender account in Campaign Settings before activating email steps.",
      };
    }
    if (senderAccount && senderAccount.status !== "connected") {
      return {
        ok: false,
        status: 400,
        message: `Selected sender account (${senderAccount.email}) requires reconnection. Check Settings > Email Accounts.`,
      };
    }
  }

  const campaignLeadsCol = await dbConnect("campaign_leads");
  const pendingLeads = await campaignLeadsCol.find({ campaignId: campaign._id, status: "pending" }).toArray();
  const sendingSchedulesCol = await dbConnect("sending_schedules");
  const workspaceScheduleDoc = await sendingSchedulesCol.findOne({ workspaceId: campaign.workspaceId });
  const effectiveSchedule = resolveEffectiveSchedule(workspaceScheduleDoc, campaign.scheduleOverride);

  let cursor = new Date();
  if (!isWithinSendingWindow(effectiveSchedule, cursor)) {
    cursor = getNextWindowStart(effectiveSchedule, cursor);
  }

  const jobsCol = await dbConnect("jobs");
  let queuedCount = 0;

  for (let i = 0; i < pendingLeads.length; i++) {
    const campaignLead = pendingLeads[i];
    const { nextStep, delayMs } = await resolveFirstExecutableStep(steps, () =>
      evaluateHasReplied(campaignLead.leadId, campaignLead.enrolledAt)
    );
    if (!nextStep) continue;

    const runAfter =
      i === 0
        ? calculateScheduledRunTime(cursor, delayMs, effectiveSchedule, null)
        : calculateStaggeredRunTime(cursor, delayMs, effectiveSchedule, null, 4, 8);
    cursor = runAfter;

    await jobsCol.insertOne({
      workspaceId: campaign.workspaceId,
      campaignId: campaign._id,
      campaignLeadId: campaignLead._id,
      stepId: nextStep._id,
      type: nextStep.type,
      runAfter,
      status: "queued",
      attempts: 0,
      lastError: null,
      createdAt: new Date(),
    });
    await campaignLeadsCol.updateOne(
      { _id: campaignLead._id },
      { $set: { currentStepId: nextStep._id, status: "in_progress" } }
    );
    queuedCount++;
  }

  const updated = await campaigns.findOneAndUpdate(
    { _id: campaign._id },
    { $set: { status: "active" } },
    { returnDocument: "after" }
  );

  runDueJobs(25, campaign._id, false, "activation_dispatch").catch((err) =>
    console.error("[Activation] Background dispatch error:", err)
  );

  return {
    ok: true,
    status: 200,
    campaign: await serializeCampaign(updated, campaignLeadsCol),
    queuedLeads: queuedCount,
  };
}
