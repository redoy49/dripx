import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { DEFAULT_DAILY_LIMITS, ACTION_TYPE_TO_LIMIT_FIELD } from "@/app/lib/limits.constants";

export { DEFAULT_DAILY_LIMITS, DAILY_LIMIT_MAX, ACTION_TYPE_TO_LIMIT_FIELD } from "@/app/lib/limits.constants";

export async function getWorkspaceLimits(workspaceId) {
  const dailyLimits = await dbConnect("daily_limits");
  let doc = await dailyLimits.findOne({ workspaceId: new ObjectId(workspaceId) });

  if (!doc) {
    doc = { workspaceId: new ObjectId(workspaceId), ...DEFAULT_DAILY_LIMITS, updatedAt: new Date() };
    await dailyLimits.insertOne(doc);
  }

  return doc;
}

// Counts how many activity_logs rows of a given actionType exist for "today" (since
// midnight UTC) in this workspace — the basis for daily cap enforcement.
export async function countTodayActivity(workspaceId, actionType) {
  const activityLogs = await dbConnect("activity_logs");
  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);

  return activityLogs.countDocuments({
    workspaceId: new ObjectId(workspaceId),
    actionType,
    occurredAt: { $gte: startOfDay },
  });
}

// Ramps a new LinkedIn account's effective limit up over its first ~2 weeks so early
// activity looks organic rather than a brand-new account suddenly maxing out its caps.
export function getWarmupMultiplier(linkedinAccount) {
  if (!linkedinAccount?.connectedAt) return 1;

  const daysSinceConnected = Math.floor(
    (Date.now() - new Date(linkedinAccount.connectedAt).getTime()) / (24 * 60 * 60 * 1000),
  );

  if (daysSinceConnected < 3) return 0.2;
  if (daysSinceConnected < 7) return 0.5;
  if (daysSinceConnected < 14) return 0.8;

  return 1;
}

// Returns true if dispatching one more `actionType` action today would stay within the
// workspace's configured (and warm-up-adjusted) daily cap. `campaignOverride` is a
// campaign's optional dailyLimitsOverride doc, which wins over the workspace default
// when the field it needs is present.
export async function isUnderLimit(workspaceId, actionType, linkedinAccount = null, campaignOverride = null) {
  const field = ACTION_TYPE_TO_LIMIT_FIELD[actionType];
  if (!field) return true; // no cap defined for this action type

  const limits = await getWorkspaceLimits(workspaceId);
  if (!limits.activityControlOn) return true;

  const rawLimit = campaignOverride?.[field] ?? limits[field] ?? DEFAULT_DAILY_LIMITS[field] ?? 0;
  const effectiveLimit = Math.max(1, Math.floor(rawLimit * getWarmupMultiplier(linkedinAccount)));
  const usedToday = await countTodayActivity(workspaceId, actionType);

  return usedToday < effectiveLimit;
}
