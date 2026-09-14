import { dbConnect } from "@/app/lib/mongoDb";
import { getLinkedInConnector } from "@/app/lib/connectors";
import { sendEmail } from "@/app/lib/email/resend";
import { renderTemplate } from "@/app/lib/personalization";
import { isUnderLimit } from "@/app/lib/limits";
import { resolveStepAfter } from "@/app/lib/sequenceEngine";
import { dispatchWebhookEvent } from "@/app/lib/webhooks";

// Finds/creates the unified-inbox conversation for a lead+channel and appends a message to it.
async function recordOutboundMessage(workspaceId, leadId, channel, body, subject) {
  const conversations = await dbConnect("conversations");
  const messages = await dbConnect("messages");

  let conversation = await conversations.findOne({ leadId, channel });
  if (!conversation) {
    const result = await conversations.insertOne({
      workspaceId,
      leadId,
      channel,
      subject: subject || null,
      lastMessageAt: new Date(),
      unreadCount: 0,
      status: "open",
    });
    conversation = { _id: result.insertedId };
  } else {
    await conversations.updateOne(
      { _id: conversation._id },
      { $set: { lastMessageAt: new Date() } },
    );
  }

  await messages.insertOne({
    conversationId: conversation._id,
    direction: "outbound",
    channel,
    body,
    sentByUserId: null,
    sentAt: new Date(),
    providerMessageId: null,
  });
}

const SIMULATED_REPLIES = [
  "Thanks for reaching out! Tell me more.",
  "Appreciate the message — can we set up a quick call?",
  "Interesting, I'd like to learn more about this.",
  "Thanks, I'll take a look and get back to you.",
];

// Demo-mode only: when running against the mock LinkedIn connector, occasionally simulate
// the lead replying so the unified inbox and "has replied" condition steps have real data
// to react to, instead of being permanently unreachable dead code with no real provider
// wired up yet. Never runs against a real (non-mock) provider.
async function maybeSimulateReply(workspaceId, campaignId, leadId, channel) {
  if (process.env.LINKEDIN_PROVIDER && process.env.LINKEDIN_PROVIDER !== "mock") return;
  if (channel !== "linkedin") return;
  if (Math.random() >= 0.2) return;

  const conversations = await dbConnect("conversations");
  const messages = await dbConnect("messages");
  const conversation = await conversations.findOne({ leadId, channel });
  if (!conversation) return;

  await messages.insertOne({
    conversationId: conversation._id,
    direction: "inbound",
    channel,
    body: SIMULATED_REPLIES[Math.floor(Math.random() * SIMULATED_REPLIES.length)],
    sentByUserId: null,
    sentAt: new Date(),
    providerMessageId: null,
  });
  await conversations.updateOne(
    { _id: conversation._id },
    { $set: { lastMessageAt: new Date() }, $inc: { unreadCount: 1 } },
  );
  await dispatchWebhookEvent(workspaceId, "lead.replied", {
    campaignId: campaignId.toString(),
    leadId: leadId.toString(),
  }).catch(() => {});
}

// A lead is considered "replied" for condition steps if there's any inbound message
// in any of their conversations since they were enrolled in the campaign.
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

async function dispatchAction(step, lead, campaign) {
  const connector = getLinkedInConnector();

  switch (step.type) {
    case "connection_request": {
      const note = step.config?.note ? renderTemplate(step.config.note, lead) : "";
      return { ...(await connector.sendConnectionRequest(lead, note)), body: note, channel: "linkedin" };
    }
    case "message": {
      const body = renderTemplate(step.config?.template || "", lead);
      return { ...(await connector.sendMessage(lead, body)), body, channel: "linkedin" };
    }
    case "follow_up": {
      const body = renderTemplate(step.config?.template || "", lead);
      return { ...(await connector.sendMessage(lead, body)), body, channel: "linkedin" };
    }
    case "inmail": {
      const subject = renderTemplate(step.config?.subject || "", lead);
      const body = renderTemplate(step.config?.template || "", lead);
      return { ...(await connector.sendInMail(lead, subject, body)), body, subject, channel: "linkedin" };
    }
    case "profile_visit":
      return { ...(await connector.visitProfile(lead)), channel: "linkedin" };
    case "like_post":
      return { ...(await connector.likeRecentPost(lead)), channel: "linkedin" };
    case "email": {
      const subject = renderTemplate(step.config?.subject || "", lead);
      const body = renderTemplate(step.config?.template || "", lead);
      const result = await sendEmail({ to: lead.email, subject, body });
      return { ...result, body, subject, channel: "email" };
    }
    default:
      return { success: false, error: `Unhandled step type: ${step.type}` };
  }
}

const MESSAGE_STEP_TYPES = new Set(["message", "follow_up", "inmail", "email"]);

/**
 * Processes a single due job: dispatches the step's action (respecting daily limits),
 * logs the result, and enqueues the next job in the sequence (walking through any
 * delay/condition steps in between). Called by the /api/cron/run-scheduler route.
 */
export async function processJob(job) {
  const jobsCol = await dbConnect("jobs");
  const campaignLeadsCol = await dbConnect("campaign_leads");
  const sequenceStepsCol = await dbConnect("sequence_steps");
  const leadsCol = await dbConnect("leads");
  const campaignsCol = await dbConnect("campaigns");
  const activityLogsCol = await dbConnect("activity_logs");

  await jobsCol.updateOne({ _id: job._id }, { $set: { status: "processing" } });

  try {
    const [campaignLead, step, campaign] = await Promise.all([
      campaignLeadsCol.findOne({ _id: job.campaignLeadId }),
      sequenceStepsCol.findOne({ _id: job.stepId }),
      campaignsCol.findOne({ _id: job.campaignId }),
    ]);

    if (!campaignLead || !step || !campaign) {
      await jobsCol.updateOne(
        { _id: job._id },
        { $set: { status: "skipped", lastError: "Campaign lead or step no longer exists" } },
      );
      return { status: "skipped" };
    }

    // Paused/draft campaigns: leave the job queued (don't lose it) so resuming the
    // campaign picks up exactly where it left off, instead of racing it against a pause.
    if (campaign.status !== "active") {
      await jobsCol.updateOne({ _id: job._id }, { $set: { status: "queued" } });
      return { status: "paused" };
    }

    const lead = await leadsCol.findOne({ _id: campaignLead.leadId });
    if (!lead) {
      await jobsCol.updateOne(
        { _id: job._id },
        { $set: { status: "failed", lastError: "Lead no longer exists" } },
      );
      return { status: "failed" };
    }

    // Enforce the workspace's daily action caps (+ warm-up ramp, + campaign override) before dispatching.
    const underLimit = await isUnderLimit(job.workspaceId, step.type, null, campaign.dailyLimitsOverride);
    if (!underLimit) {
      await jobsCol.updateOne(
        { _id: job._id },
        { $set: { status: "queued", runAfter: nextMidnightUTC() } },
      );
      return { status: "rate_limited" };
    }

    const result = await dispatchAction(step, lead, campaign);

    if (!result.success) {
      await jobsCol.updateOne(
        { _id: job._id },
        { $set: { status: "failed", lastError: result.error || "Unknown error" }, $inc: { attempts: 1 } },
      );
      return { status: "failed", error: result.error };
    }

    await activityLogsCol.insertOne({
      workspaceId: job.workspaceId,
      actionType: step.type,
      campaignId: job.campaignId,
      leadId: lead._id,
      occurredAt: new Date(),
    });

    if (MESSAGE_STEP_TYPES.has(step.type) && result.body) {
      await recordOutboundMessage(job.workspaceId, lead._id, result.channel, result.body, result.subject);
      await maybeSimulateReply(job.workspaceId, job.campaignId, lead._id, result.channel);
    }

    // Resolve what happens next in the sequence (walking through any delay/condition steps).
    const allSteps = await sequenceStepsCol.find({ campaignId: job.campaignId }).toArray();
    const { nextStep, delayMs } = await resolveStepAfter(allSteps, step, (conditionStep) =>
      evaluateHasReplied(lead._id, campaignLead.enrolledAt),
    );

    if (nextStep) {
      await jobsCol.insertOne({
        workspaceId: job.workspaceId,
        campaignId: job.campaignId,
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
        { $set: { currentStepId: nextStep._id, status: "in_progress", lastActionAt: new Date() } },
      );
    } else {
      await campaignLeadsCol.updateOne(
        { _id: campaignLead._id },
        { $set: { currentStepId: null, status: "completed", lastActionAt: new Date() } },
      );
      await dispatchWebhookEvent(job.workspaceId, "lead.sequence_completed", {
        campaignId: job.campaignId.toString(),
        leadId: lead._id.toString(),
      });
    }

    await jobsCol.updateOne({ _id: job._id }, { $set: { status: "done" } });

    if (step.type === "connection_request") {
      await dispatchWebhookEvent(job.workspaceId, "connection.requested", {
        campaignId: job.campaignId.toString(),
        leadId: lead._id.toString(),
      });
    }

    return { status: "done" };
  } catch (error) {
    console.error("processJob failed:", error);
    await jobsCol.updateOne(
      { _id: job._id },
      { $set: { status: "failed", lastError: error.message }, $inc: { attempts: 1 } },
    );
    return { status: "failed", error: error.message };
  }
}

function nextMidnightUTC() {
  const d = new Date();
  d.setUTCHours(24, 0, 0, 0);
  return d;
}

// Pulls and processes a batch of due jobs. Returns a summary for the cron route to report.
export async function runDueJobs(batchSize = 50) {
  const jobsCol = await dbConnect("jobs");
  const due = await jobsCol
    .find({ status: "queued", runAfter: { $lte: new Date() } })
    .limit(batchSize)
    .toArray();

  const results = { processed: 0, succeeded: 0, failed: 0, skipped: 0, rateLimited: 0, paused: 0 };

  for (const job of due) {
    const outcome = await processJob(job);
    results.processed++;
    if (outcome.status === "done") results.succeeded++;
    else if (outcome.status === "failed") results.failed++;
    else if (outcome.status === "skipped") results.skipped++;
    else if (outcome.status === "rate_limited") results.rateLimited++;
    else if (outcome.status === "paused") results.paused++;
  }

  return results;
}
