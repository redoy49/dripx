/**
 * Core Sending Schedule & Working Hours Engine for DripX.
 * Re-exports client-safe constants & math from scheduleConstants.js
 * and includes server-only campaign job alignment engine.
 */

export * from "./scheduleConstants.js";
import {
  resolveEffectiveSchedule,
  isWithinSendingWindow,
  getNextWindowStart,
  calculateStaggeredRunTime,
} from "./scheduleConstants.js";

/**
 * Re-aligns and staggers all queued jobs for a given campaign.
 * Useful when working hours or timezone settings change, ensuring emails are spaced 4-8 minutes apart.
 */
export async function realignCampaignJobs(campaignId) {
  const { dbConnect } = await import("./mongoDb.js");
  const { ObjectId } = await import("mongodb");

  const campaigns = await dbConnect("campaigns");
  const campaignObjectId = typeof campaignId === "string" ? new ObjectId(campaignId) : campaignId;
  const campaign = await campaigns.findOne({ _id: campaignObjectId });
  if (!campaign) return { updated: 0 };

  const sendingSchedulesCol = await dbConnect("sending_schedules");
  const workspaceScheduleDoc = await sendingSchedulesCol.findOne({
    workspaceId: campaign.workspaceId,
  });
  const effectiveSchedule = resolveEffectiveSchedule(
    workspaceScheduleDoc,
    campaign.scheduleOverride,
  );

  const jobsCol = await dbConnect("jobs");
  const queuedJobs = await jobsCol
    .find({ campaignId: campaignObjectId, status: "queued" })
    .sort({ createdAt: 1 })
    .toArray();

  if (queuedJobs.length === 0) return { updated: 0 };

  const now = new Date();
  let cursor = isWithinSendingWindow(effectiveSchedule, now)
    ? now
    : getNextWindowStart(effectiveSchedule, now);

  let updatedCount = 0;
  for (let i = 0; i < queuedJobs.length; i++) {
    const job = queuedJobs[i];
    let runAfter;
    if (i === 0) {
      runAfter = isWithinSendingWindow(effectiveSchedule, cursor)
        ? cursor
        : getNextWindowStart(effectiveSchedule, cursor);
    } else {
      runAfter = calculateStaggeredRunTime(cursor, 0, effectiveSchedule, null, 4, 8);
    }
    cursor = runAfter;

    await jobsCol.updateOne(
      { _id: job._id },
      {
        $set: {
          runAfter,
          lastError: isWithinSendingWindow(effectiveSchedule, runAfter)
            ? null
            : `Scheduled: Outside sending window (${effectiveSchedule.startTime}-${effectiveSchedule.endTime} ${effectiveSchedule.timezone}). Rescheduled to ${runAfter.toISOString()}`,
        },
      },
    );
    updatedCount++;
  }

  return { updated: updatedCount };
}
