/**
 * Core Sending Schedule & Working Hours Engine for DripX.
 * Pure mathematical and IANA timezone calculations using native Intl.DateTimeFormat.
 * Zero external dependencies.
 */

export const DEFAULT_SENDING_SCHEDULE = {
  timezone: "America/New_York",
  days: [1, 2, 3, 4, 5], // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
  startTime: "09:00",
  endTime: "17:00",
  leadTimezoneOptimization: false,
};

export const WEEKDAYS = [
  { day: 1, short: "Mon", full: "Monday" },
  { day: 2, short: "Tue", full: "Tuesday" },
  { day: 3, short: "Wed", full: "Wednesday" },
  { day: 4, short: "Thu", full: "Thursday" },
  { day: 5, short: "Fri", full: "Friday" },
  { day: 6, short: "Sat", full: "Saturday" },
  { day: 7, short: "Sun", full: "Sunday" },
];

export const POPULAR_TIMEZONES = [
  { value: "America/New_York", label: "US Eastern Time (New York, Miami)", offset: "UTC-4 / UTC-5" },
  { value: "America/Chicago", label: "US Central Time (Chicago, Dallas)", offset: "UTC-5 / UTC-6" },
  { value: "America/Denver", label: "US Mountain Time (Denver, Phoenix)", offset: "UTC-6 / UTC-7" },
  { value: "America/Los_Angeles", label: "US Pacific Time (Los Angeles, SF)", offset: "UTC-7 / UTC-8" },
  { value: "Europe/London", label: "UK / London (GMT / BST)", offset: "UTC+0 / UTC+1" },
  { value: "Europe/Paris", label: "Central European Time (Paris, Berlin, Rome)", offset: "UTC+1 / UTC+2" },
  { value: "Europe/Helsinki", label: "Eastern European Time (Helsinki, Athens)", offset: "UTC+2 / UTC+3" },
  { value: "Asia/Dubai", label: "Gulf Standard Time (Dubai)", offset: "UTC+4" },
  { value: "Asia/Kolkata", label: "India Standard Time (Mumbai, Delhi)", offset: "UTC+5:30" },
  { value: "Asia/Singapore", label: "Singapore / Hong Kong (SGT / HKT)", offset: "UTC+8" },
  { value: "Asia/Tokyo", label: "Japan Standard Time (Tokyo)", offset: "UTC+9" },
  { value: "Australia/Sydney", label: "Australian Eastern Time (Sydney, Melbourne)", offset: "UTC+10 / UTC+11" },
  { value: "UTC", label: "Coordinated Universal Time (UTC)", offset: "UTC+0" },
];

/**
 * Extracts calendar date parts and day-of-week in target timezone.
 */
export function getZonedParts(date = new Date(), timeZone = "America/New_York") {
  const safeDate = date instanceof Date ? date : new Date(date);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timeZone || "America/New_York",
    hour12: false,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(safeDate);

  const map = {};
  for (const p of parts) map[p.type] = p.value;

  const weekdayMap = { Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6, Sun: 7 };
  const weekday = map.weekday;
  const weekdayIndex = weekdayMap[weekday] || 1;

  return {
    year: parseInt(map.year, 10),
    month: parseInt(map.month, 10),
    day: parseInt(map.day, 10),
    hour: parseInt(map.hour, 10),
    minute: parseInt(map.minute, 10),
    second: parseInt(map.second, 10),
    weekday,
    weekdayIndex, // 1=Mon ... 7=Sun
  };
}

/**
 * Converts calendar day & clock time in a target timezone to an exact UTC Date object.
 */
export function zonedTimeToUtc(year, month, day, hour, minute, timeZone = "America/New_York") {
  const tz = timeZone || "America/New_York";
  const guessUtc = new Date(Date.UTC(year, month - 1, day, hour, minute, 0));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(guessUtc);

  const map = {};
  for (const p of parts) map[p.type] = p.value;

  const zonedDate = new Date(
    Date.UTC(
      parseInt(map.year, 10),
      parseInt(map.month, 10) - 1,
      parseInt(map.day, 10),
      parseInt(map.hour, 10),
      parseInt(map.minute, 10),
      parseInt(map.second, 10),
    ),
  );

  const diffMs = zonedDate.getTime() - guessUtc.getTime();
  return new Date(guessUtc.getTime() - diffMs);
}

/**
 * Parses "09:00" to total minutes from midnight (540).
 */
export function parseTimeToMinutes(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const [h, m] = timeStr.split(":").map((v) => parseInt(v, 10));
  return (h || 0) * 60 + (m || 0);
}

/**
 * Checks if a given timestamp falls within the allowed days and hours of a sending schedule.
 */
export function isWithinSendingWindow(schedule, date = new Date()) {
  const config = { ...DEFAULT_SENDING_SCHEDULE, ...(schedule || {}) };
  const safeDate = date instanceof Date ? date : new Date(date);
  const tz = config.timezone || "America/New_York";

  const parts = getZonedParts(safeDate, tz);
  const activeDays = Array.isArray(config.days) ? config.days : DEFAULT_SENDING_SCHEDULE.days;

  // 1. Must be an active day
  if (!activeDays.includes(parts.weekdayIndex)) {
    return false;
  }

  // 2. Must be between startTime and endTime
  const currentMinutes = parts.hour * 60 + parts.minute;
  const startMinutes = parseTimeToMinutes(config.startTime || "09:00");
  const endMinutes = parseTimeToMinutes(config.endTime || "17:00");

  return currentMinutes >= startMinutes && currentMinutes < endMinutes;
}

/**
 * Computes the exact UTC Date when the next sending window opens for a given schedule.
 * Rolls forward to next valid weekday/startTime if currently outside window.
 */
export function getNextWindowStart(schedule, fromDate = new Date()) {
  const config = { ...DEFAULT_SENDING_SCHEDULE, ...(schedule || {}) };
  const safeDate = fromDate instanceof Date ? fromDate : new Date(fromDate);
  const tz = config.timezone || "America/New_York";

  const startMinutes = parseTimeToMinutes(config.startTime || "09:00");
  const startHour = Math.floor(startMinutes / 60);
  const startMinute = startMinutes % 60;

  const activeDays = Array.isArray(config.days) && config.days.length > 0
    ? config.days
    : DEFAULT_SENDING_SCHEDULE.days;

  const currentParts = getZonedParts(safeDate, tz);
  const currentMinutes = currentParts.hour * 60 + currentParts.minute;

  // Case 1: Today is an active day, and we are BEFORE start time
  if (activeDays.includes(currentParts.weekdayIndex) && currentMinutes < startMinutes) {
    return zonedTimeToUtc(
      currentParts.year,
      currentParts.month,
      currentParts.day,
      startHour,
      startMinute,
      tz,
    );
  }

  // Case 2: Advance day by day until we find the next active day
  // Create a working UTC date representing today at midnight UTC
  let checkUtc = zonedTimeToUtc(
    currentParts.year,
    currentParts.month,
    currentParts.day,
    12, // midday to avoid DST edges while stepping days
    0,
    tz,
  );

  for (let step = 1; step <= 14; step++) {
    checkUtc = new Date(checkUtc.getTime() + 24 * 60 * 60 * 1000);
    const dayParts = getZonedParts(checkUtc, tz);
    if (activeDays.includes(dayParts.weekdayIndex)) {
      return zonedTimeToUtc(
        dayParts.year,
        dayParts.month,
        dayParts.day,
        startHour,
        startMinute,
        tz,
      );
    }
  }

  // Fallback: tomorrow at startTime
  return new Date(safeDate.getTime() + 24 * 60 * 60 * 1000);
}

/**
 * Calculates scheduled run time for follow-up sequence steps.
 * Adds delayMs to baseDate, then rolls forward if the candidate timestamp is outside the sending window.
 */
export function calculateScheduledRunTime(baseDate = new Date(), delayMs = 0, schedule = {}, lead = null) {
  const effectiveSchedule = resolveEffectiveSchedule(schedule, null, lead);
  const safeBase = baseDate instanceof Date ? baseDate : new Date(baseDate);
  const candidate = new Date(safeBase.getTime() + Math.max(0, delayMs || 0));

  if (isWithinSendingWindow(effectiveSchedule, candidate)) {
    return candidate;
  }

  return getNextWindowStart(effectiveSchedule, candidate);
}

/**
 * Attempts to auto-detect a prospect's timezone from their location or country metadata.
 */
export function detectLeadTimezone(lead) {
  if (!lead) return null;
  if (lead.timezone && typeof lead.timezone === "string") {
    return lead.timezone;
  }

  const raw = `${lead.location || ""} ${lead.country || ""}`.toLowerCase();
  if (!raw.trim()) return null;

  if (/\b(us|usa|united states|new york|california|texas|florida|america)\b/i.test(raw)) {
    if (/\b(california|san francisco|los angeles|seattle|washington|oregon)\b/i.test(raw)) return "America/Los_Angeles";
    if (/\b(texas|chicago|illinois|dallas|houston|central)\b/i.test(raw)) return "America/Chicago";
    if (/\b(denver|colorado|phoenix|arizona)\b/i.test(raw)) return "America/Denver";
    return "America/New_York";
  }

  if (/\b(uk|united kingdom|britain|england|london|scotland)\b/i.test(raw)) return "Europe/London";
  if (/\b(germany|deutschland|berlin|munich|frankfurt|hamburg)\b/i.test(raw)) return "Europe/Berlin";
  if (/\b(france|paris)\b/i.test(raw)) return "Europe/Paris";
  if (/\b(canada|toronto|ontario|vancouver)\b/i.test(raw)) return "America/Toronto";
  if (/\b(australia|sydney|melbourne|brisbane)\b/i.test(raw)) return "Australia/Sydney";
  if (/\b(india|mumbai|delhi|bangalore|bengaluru|hyderabad)\b/i.test(raw)) return "Asia/Kolkata";
  if (/\b(japan|tokyo|osaka)\b/i.test(raw)) return "Asia/Tokyo";
  if (/\b(singapore)\b/i.test(raw)) return "Asia/Singapore";
  if (/\b(dubai|uae|united arab emirates)\b/i.test(raw)) return "Asia/Dubai";
  if (/\b(netherlands|amsterdam)\b/i.test(raw)) return "Europe/Amsterdam";
  if (/\b(spain|madrid|barcelona)\b/i.test(raw)) return "Europe/Madrid";

  return null;
}

/**
 * Combines workspace default schedule, campaign override, and lead timezone optimization
 * to produce the final effective sending schedule.
 */
export function resolveEffectiveSchedule(workspaceSchedule = {}, campaignOverride = null, lead = null) {
  let base = { ...DEFAULT_SENDING_SCHEDULE, ...(workspaceSchedule || {}) };

  if (campaignOverride && campaignOverride.useWorkspaceSchedule === false) {
    base = { ...base, ...campaignOverride };
  }

  // If lead timezone optimization is active, check if lead location provides a specific timezone
  if (base.leadTimezoneOptimization && lead) {
    const leadTz = detectLeadTimezone(lead);
    if (leadTz) {
      base.timezone = leadTz;
      base.isLeadTimezoneApplied = true;
    }
  }

  return base;
}
