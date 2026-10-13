import { ObjectId } from "mongodb";
import { dbConnect } from "./mongoDb.js";
import { getLinkedInConnector } from "./connectors/index.js";
import { sendEmail } from "./email/index.js";
import { renderTemplate } from "./personalization.js";
import { isUnderLimit } from "./limits.js";
import { resolveStepAfter } from "./sequenceEngine.js";
import { dispatchWebhookEvent } from "./webhooks.js";
import {
  isWithinSendingWindow,
  getNextWindowStart,
  calculateScheduledRunTime,
  resolveEffectiveSchedule,
} from "./scheduleEngine.js";

export { handleLeadReplied } from "./leadReplied.js";

// Finds/creates the unified-inbox conversation for a lead+channel and appends a message to it.
async function recordOutboundMessage(workspaceId, leadId, channel, body, subject, options = {}) {
  const { providerMessageId = null, threadId = null, senderEmailAccountId = null } = options;
  const conversations = await dbConnect("conversations");
  const messages = await dbConnect("messages");

  let conversation = await conversations.findOne({ leadId, channel });
  if (!conversation) {
    const result = await conversations.insertOne({
      workspaceId,
      leadId,
      channel,
      subject: subject || null,
      threadId: threadId || null,
      senderEmailAccountId: senderEmailAccountId || null,
      lastMessageAt: new Date(),
      unreadCount: 0,
      status: "open",
    });
    conversation = { _id: result.insertedId };
  } else {
    const updateFields = { lastMessageAt: new Date() };
    if (threadId && !conversation.threadId) updateFields.threadId = threadId;
    if (senderEmailAccountId && !conversation.senderEmailAccountId) {
      updateFields.senderEmailAccountId = senderEmailAccountId;
    }
    await conversations.updateOne(
      { _id: conversation._id },
      { $set: updateFields },
    );
  }

  await messages.insertOne({
    conversationId: conversation._id,
    direction: "outbound",
    channel,
    body,
    sentByUserId: null,
    sentAt: new Date(),
    providerMessageId: providerMessageId || null,
    threadId: threadId || null,
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

  await handleLeadReplied(workspaceId, leadId, campaignId).catch(() => {});

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
      const result = await sendEmail({
        to: lead.email,
        subject,
        body,
        accountId: campaign.senderEmailAccountId,
        workspaceId: campaign.workspaceId,
        purpose: "campaign",
      });
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

    // Check Working Hours & Sending Window
    const sendingSchedulesCol = await dbConnect("sending_schedules");
    const workspaceScheduleDoc = await sendingSchedulesCol.findOne({
      workspaceId: job.workspaceId,
    });
    const effectiveSchedule = resolveEffectiveSchedule(
      workspaceScheduleDoc,
      campaign.scheduleOverride,
      lead,
    );
    const now = new Date();

    if (!isWithinSendingWindow(effectiveSchedule, now)) {
      const nextWindow = getNextWindowStart(effectiveSchedule, now);
      await jobsCol.updateOne(
        { _id: job._id },
        {
          $set: {
            status: "queued",
            runAfter: nextWindow,
            lastError: `Postponed: Outside sending window (${effectiveSchedule.startTime}-${effectiveSchedule.endTime} ${effectiveSchedule.timezone}). Rescheduled to ${nextWindow.toISOString()}`,
          },
        },
      );
      const leadDisplayName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.email || "Lead";
      return {
        status: "outside_working_hours",
        leadName: leadDisplayName,
        stepTitle: step.type,
        channel: step.type,
        nextWindow: nextWindow.toISOString(),
        timezone: effectiveSchedule.timezone,
      };
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

    // For email actions, also enforce the specific sender mailbox's ramp-up cap
    if (step.type === "email") {
      const emailAccountsCol = await dbConnect("email_accounts");
      const senderAccountId = campaign.senderEmailAccountId
        ? (typeof campaign.senderEmailAccountId === "string" ? new ObjectId(campaign.senderEmailAccountId) : campaign.senderEmailAccountId)
        : null;
      const targetQuery = senderAccountId
        ? { _id: senderAccountId }
        : { workspaceId: new ObjectId(job.workspaceId), status: "connected" };

      const senderDoc = await emailAccountsCol.findOne(targetQuery);
      if (senderDoc) {
        const { canAccountSendToday } = await import("@/app/lib/rampUpEngine");
        const quota = canAccountSendToday(senderDoc);

        if (!quota.canSend) {
          await jobsCol.updateOne(
            { _id: job._id },
            {
              $set: {
                status: "queued",
                runAfter: nextMidnightUTC(),
                lastError: `Sender mailbox ${senderDoc.email} reached daily ramp-up limit (${quota.currentCount}/${quota.effectiveLimit}). Postponed to next day.`,
              },
            },
          );
          return { status: "rate_limited", reason: "sender_quota_reached" };
        }
      }
    }

    const result = await dispatchAction(step, lead, campaign);

    if (!result.success) {
      const isTransient =
        result.error &&
        /rate limit|timeout|429|503|504|econnreset|etimedout|esocket|temporary/i.test(result.error);
      const attempts = (job.attempts || 0) + 1;

      if (isTransient && attempts < 3) {
        const delayMinutes = Math.pow(2, attempts); // 2m, 4m
        const retryAt = new Date(Date.now() + delayMinutes * 60 * 1000);

        await jobsCol.updateOne(
          { _id: job._id },
          {
            $set: {
              status: "queued",
              runAfter: retryAt,
              lastError: `Attempt ${attempts} failed: ${result.error}. Retrying in ${delayMinutes}m.`,
            },
            $inc: { attempts: 1 },
          },
        );
        return { status: "retrying", attempts, runAfter: retryAt, error: result.error };
      }

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
      await recordOutboundMessage(job.workspaceId, lead._id, result.channel, result.body, result.subject, {
        providerMessageId: result.providerMessageId || null,
        threadId: result.threadId || null,
        senderEmailAccountId: campaign.senderEmailAccountId || null,
      });
      await maybeSimulateReply(job.workspaceId, job.campaignId, lead._id, result.channel);
    }

    // Atomically increment sender mailbox todaySentCount
    if (step.type === "email") {
      const emailAccountsCol = await dbConnect("email_accounts");
      const senderAccountId = campaign.senderEmailAccountId
        ? (typeof campaign.senderEmailAccountId === "string" ? new ObjectId(campaign.senderEmailAccountId) : campaign.senderEmailAccountId)
        : null;
      const targetQuery = senderAccountId
        ? { _id: senderAccountId }
        : { workspaceId: new ObjectId(job.workspaceId), status: "connected" };

      const senderDoc = await emailAccountsCol.findOne(targetQuery);
      if (senderDoc) {
        const { shouldResetDailyCount } = await import("@/app/lib/rampUpEngine");
        const isNewDay = shouldResetDailyCount(senderDoc.lastSentAt, senderDoc.todaySentResetAt);
        const now = new Date();

        await emailAccountsCol.updateOne(
          { _id: senderDoc._id },
          isNewDay
            ? { $set: { todaySentCount: 1, lastSentAt: now, todaySentResetAt: now } }
            : { $inc: { todaySentCount: 1 }, $set: { lastSentAt: now } },
        );
      }
    }

    // Resolve what happens next in the sequence (walking through any delay/condition steps).
    const allSteps = await sequenceStepsCol.find({ campaignId: job.campaignId }).toArray();
    const { nextStep, delayMs } = await resolveStepAfter(allSteps, step, (conditionStep) =>
      evaluateHasReplied(lead._id, campaignLead.enrolledAt),
    );

    if (nextStep) {
      const scheduledRunAfter = calculateScheduledRunTime(
        new Date(),
        delayMs,
        effectiveSchedule,
        lead,
      );

      await jobsCol.insertOne({
        workspaceId: job.workspaceId,
        campaignId: job.campaignId,
        campaignLeadId: campaignLead._id,
        stepId: nextStep._id,
        type: nextStep.type,
        runAfter: scheduledRunAfter,
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

    const leadDisplayName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.email || "Lead";
    const stepTitle = step.config?.subject ? `Step: ${step.config.subject.slice(0, 30)}` : `Step: ${step.type.replace("_", " ")}`;

    return {
      status: "done",
      leadId: lead._id.toString(),
      leadName: leadDisplayName,
      stepTitle,
      channel: result.channel || step.type,
    };
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

/**
 * Atomically claims a queued job so that no two concurrent workers
 * (e.g. manual dispatch and cron scheduler) can process the same job at the same time.
 */
export async function claimAndProcessJob(job, workerId = "runner", forceDue = false) {
  const jobsCol = await dbConnect("jobs");
  const now = new Date();
  const staleThreshold = new Date(Date.now() - 5 * 60 * 1000); // 5 min stale lock threshold

  const filter = {
    _id: job._id,
    $or: [
      forceDue
        ? { status: "queued" }
        : { status: "queued", runAfter: { $lte: now } },
      { status: "processing", lockedAt: { $lt: staleThreshold } },
    ],
  };

  const claimed = await jobsCol.findOneAndUpdate(
    filter,
    {
      $set: {
        status: "processing",
        lockedAt: now,
        lockedBy: workerId,
      },
    },
    { returnDocument: "after" },
  );

  if (!claimed) {
    return { status: "already_claimed", skipped: true };
  }

  return processJob(claimed);
}

// Pulls and processes a batch of due jobs. Supports filtering by campaignId and forceDue mode.
export async function runDueJobs(batchSize = 50, campaignId = null, forceDue = false, workerId = "scheduler") {
  const jobsCol = await dbConnect("jobs");
  const now = new Date();
  const staleThreshold = new Date(Date.now() - 5 * 60 * 1000);

  const query = {
    $or: [
      forceDue
        ? { status: "queued" }
        : { status: "queued", runAfter: { $lte: now } },
      { status: "processing", lockedAt: { $lt: staleThreshold } },
    ],
  };

  if (campaignId) {
    query.campaignId = new ObjectId(campaignId);
  }

  const due = await jobsCol.find(query).limit(batchSize).toArray();

  const results = {
    processed: 0,
    succeeded: 0,
    failed: 0,
    skipped: 0,
    rateLimited: 0,
    paused: 0,
    logs: [],
  };

  for (const job of due) {
    const outcome = await claimAndProcessJob(job, workerId, forceDue);
    if (outcome.status === "already_claimed") {
      continue;
    }

    results.processed++;
    if (outcome.status === "done") results.succeeded++;
    else if (outcome.status === "failed") results.failed++;
    else if (outcome.status === "skipped") results.skipped++;
    else if (outcome.status === "rate_limited") results.rateLimited++;
    else if (outcome.status === "paused") results.paused++;
    else if (outcome.status === "outside_working_hours") results.outsideWorkingHours = (results.outsideWorkingHours || 0) + 1;

    results.logs.push({
      jobId: job._id.toString(),
      status: outcome.status,
      leadName: outcome.leadName || "Lead",
      stepTitle: outcome.stepTitle || job.type,
      channel: outcome.channel || job.type,
      error: outcome.error || null,
      timestamp: new Date().toISOString(),
    });
  }

  return results;
}
