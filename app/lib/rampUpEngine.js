/**
 * Sending Ramp-Up & Deliverability Health Engine
 * Manages automated sender warming, effective daily quotas, and multi-factor mailbox health.
 */

export const DEFAULT_RAMPUP_CONFIG = {
  enabled: true,
  startingLimit: 10,
  dailyIncrement: 3,
  targetLimit: 40,
};

/**
 * Computes the active ramp-up stage, daily allowance, and graduation status for an account.
 */
export function computeRampUpStatus(account) {
  if (!account) {
    return {
      enabled: false,
      isWarmingUp: false,
      isGraduated: true,
      currentEffectiveLimit: 40,
      currentDay: 1,
      startingLimit: 10,
      dailyIncrement: 3,
      targetLimit: 40,
      progressPct: 100,
    };
  }

  const rampUp = account.rampUp || {};
  const isEnabled = rampUp.enabled !== false; // Default to true if not explicitly false

  const startingLimit = Math.max(1, rampUp.startingLimit ?? DEFAULT_RAMPUP_CONFIG.startingLimit);
  const dailyIncrement = Math.max(1, rampUp.dailyIncrement ?? DEFAULT_RAMPUP_CONFIG.dailyIncrement);
  const targetLimit = Math.max(
    startingLimit,
    rampUp.targetLimit ?? account.dailyLimit ?? DEFAULT_RAMPUP_CONFIG.targetLimit,
  );

  if (!isEnabled) {
    return {
      enabled: false,
      isWarmingUp: false,
      isGraduated: true,
      currentEffectiveLimit: targetLimit,
      currentDay: 1,
      startingLimit,
      dailyIncrement,
      targetLimit,
      progressPct: 100,
    };
  }

  const startDate = new Date(rampUp.startedAt || account.createdAt || Date.now());
  const now = new Date();
  const msElapsed = Math.max(0, now.getTime() - startDate.getTime());
  const daysElapsed = Math.floor(msElapsed / (24 * 60 * 60 * 1000));

  const effectiveLimit = Math.min(targetLimit, startingLimit + daysElapsed * dailyIncrement);
  const isGraduated = effectiveLimit >= targetLimit;

  const totalRange = targetLimit - startingLimit;
  const currentProgress = effectiveLimit - startingLimit;
  const progressPct = totalRange > 0 ? Math.min(100, Math.round((currentProgress / totalRange) * 100)) : 100;

  return {
    enabled: true,
    isWarmingUp: !isGraduated,
    isGraduated,
    currentEffectiveLimit: effectiveLimit,
    currentDay: daysElapsed + 1,
    startingLimit,
    dailyIncrement,
    targetLimit,
    progressPct,
  };
}

/**
 * Checks whether the current date (UTC) has rolled over past the account's last recorded send date.
 */
export function shouldResetDailyCount(lastSentAt, resetAt = null) {
  const referenceDate = resetAt || lastSentAt;
  if (!referenceDate) return false;

  const last = new Date(referenceDate);
  const now = new Date();

  return (
    last.getUTCFullYear() !== now.getUTCFullYear() ||
    last.getUTCMonth() !== now.getUTCMonth() ||
    last.getUTCDate() !== now.getUTCDate()
  );
}

/**
 * Evaluates whether an email account has available quota to dispatch an email right now.
 */
export function canAccountSendToday(account) {
  const rampUpStatus = computeRampUpStatus(account);
  const effectiveLimit = rampUpStatus.currentEffectiveLimit;

  // If date rolled over, effective today count is 0
  const isNewDay = shouldResetDailyCount(account.lastSentAt, account.todaySentResetAt);
  const currentCount = isNewDay ? 0 : (account.todaySentCount || 0);

  const remaining = Math.max(0, effectiveLimit - currentCount);

  return {
    canSend: currentCount < effectiveLimit,
    currentCount,
    effectiveLimit,
    remaining,
    isNewDay,
    rampUpStatus,
  };
}

/**
 * Multi-factor Mailbox Health Score Calculator (0 - 100).
 * Combines:
 * - Connection Handshake (35%)
 * - DNS Deliverability (35%)
 * - Warmup/Ramp-up Health (15%)
 * - Error/Bounce Telemetry (15%)
 */
export function evaluateMailboxHealth({
  status = "connected",
  dnsScore = 100,
  recentErrorCount = 0,
  rampUp = {},
}) {
  // 1. Connection (35 points)
  let connectionScore = 35;
  if (status === "needs_reconnect" || status === "disconnected") {
    connectionScore = 0;
  }

  // 2. DNS Deliverability (35 points)
  const normalizedDns = Math.max(0, Math.min(100, dnsScore ?? 100));
  const dnsPoints = Math.round((normalizedDns / 100) * 35);

  // 3. Ramp-up adherence (15 points)
  let rampUpPoints = 15;
  if (rampUp?.enabled && rampUp?.startingLimit > 50) {
    rampUpPoints = 8; // penalty for overly aggressive baseline
  }

  // 4. Error/Bounce rate (15 points)
  let errorPoints = 15;
  if (recentErrorCount > 0) {
    errorPoints = Math.max(0, 15 - recentErrorCount * 3);
  }

  const totalScore = Math.max(0, Math.min(100, connectionScore + dnsPoints + rampUpPoints + errorPoints));

  let rating = "critical";
  if (totalScore >= 90) rating = "excellent";
  else if (totalScore >= 75) rating = "good";
  else if (totalScore >= 55) rating = "warning";

  return {
    score: totalScore,
    rating,
    breakdown: {
      connection: connectionScore,
      dns: dnsPoints,
      rampUp: rampUpPoints,
      reliability: errorPoints,
    },
  };
}

/**
 * Generates day-by-day sending allowance projection curve for preview in settings modal.
 */
export function generateRampUpProjection(startingLimit = 10, dailyIncrement = 3, targetLimit = 40, totalDays = 14) {
  const schedule = [];
  for (let day = 1; day <= totalDays; day++) {
    const limit = Math.min(targetLimit, startingLimit + (day - 1) * dailyIncrement);
    schedule.push({
      day,
      limit,
      isGraduated: limit >= targetLimit,
    });
  }
  return schedule;
}
