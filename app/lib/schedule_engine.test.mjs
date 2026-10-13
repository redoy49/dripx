/**
 * Automated Test Suite for Feature 5: Working Hours, Timezone & Sending Schedule Engine
 * Run via: node --env-file=.env.local app/lib/schedule_engine.test.mjs
 */

import assert from "node:assert";
import {
  DEFAULT_SENDING_SCHEDULE,
  getZonedParts,
  zonedTimeToUtc,
  parseTimeToMinutes,
  isWithinSendingWindow,
  getNextWindowStart,
  calculateScheduledRunTime,
  detectLeadTimezone,
  resolveEffectiveSchedule,
} from "./scheduleEngine.js";

console.log("=== RUNNING WORKING HOURS & SENDING SCHEDULE TESTS ===\n");

// 1. Testing Timezone Date Parts & Weekday Mapping
console.log("1. Testing Timezone Date Parts & Weekday Extraction...");
{
  // 2026-10-14 14:30:00 UTC is Wednesday
  const sampleUtc = new Date(Date.UTC(2026, 9, 14, 14, 30, 0)); // Month 9 is Oct (0-indexed)
  
  // America/New_York (UTC-4 in October) -> 10:30 AM Wednesday
  const nyParts = getZonedParts(sampleUtc, "America/New_York");
  assert.strictEqual(nyParts.hour, 10, "NY hour should be 10 AM");
  assert.strictEqual(nyParts.minute, 30, "NY minute should be 30");
  assert.strictEqual(nyParts.weekdayIndex, 3, "NY should be Wednesday (day 3)");

  // Asia/Tokyo (UTC+9) -> 23:30 (11:30 PM) Wednesday
  const tokyoParts = getZonedParts(sampleUtc, "Asia/Tokyo");
  assert.strictEqual(tokyoParts.hour, 23, "Tokyo hour should be 23");
  assert.strictEqual(tokyoParts.weekdayIndex, 3, "Tokyo should be Wednesday");

  // Europe/London (UTC+1 in October BST) -> 15:30 (3:30 PM) Wednesday
  const londonParts = getZonedParts(sampleUtc, "Europe/London");
  assert.strictEqual(londonParts.hour, 15, "London hour should be 15");

  console.log("✓ Timezone date parts and weekday extraction verified across global timezones");
}

// 2. Testing Sending Window Boundary Checks (isWithinSendingWindow)
console.log("\n2. Testing Sending Window Boundary Checks...");
{
  const testSchedule = {
    timezone: "America/New_York",
    days: [1, 2, 3, 4, 5], // Mon-Fri
    startTime: "09:00",
    endTime: "17:00",
  };

  // Case A: Wednesday 10:30 AM NY -> INSIDE window
  const wednesday10am = zonedTimeToUtc(2026, 10, 14, 10, 30, "America/New_York");
  assert.strictEqual(isWithinSendingWindow(testSchedule, wednesday10am), true, "10:30 AM Wed should be inside window");

  // Case B: Wednesday 08:30 AM NY -> BEFORE window
  const wednesday830am = zonedTimeToUtc(2026, 10, 14, 8, 30, "America/New_York");
  assert.strictEqual(isWithinSendingWindow(testSchedule, wednesday830am), false, "8:30 AM Wed should be outside window");

  // Case C: Wednesday 17:30 PM NY -> AFTER window
  const wednesday1730pm = zonedTimeToUtc(2026, 10, 14, 17, 30, "America/New_York");
  assert.strictEqual(isWithinSendingWindow(testSchedule, wednesday1730pm), false, "5:30 PM Wed should be outside window");

  // Case D: Sunday 12:00 PM NY -> WEEKEND / INACTIVE DAY
  const sundayNoon = zonedTimeToUtc(2026, 10, 11, 12, 0, "America/New_York");
  assert.strictEqual(isWithinSendingWindow(testSchedule, sundayNoon), false, "Sunday should be outside window");

  console.log("✓ Window boundary checks verified (inside, before, after, and inactive days)");
}

// 3. Testing Next Window Rollover (getNextWindowStart)
console.log("\n3. Testing Next Window Rollover Engine...");
{
  const testSchedule = {
    timezone: "America/New_York",
    days: [1, 2, 3, 4, 5], // Mon-Fri
    startTime: "09:00",
    endTime: "17:00",
  };

  // Case A: Before hours today -> Rolls to today 09:00 AM
  const wednesdayEarly = zonedTimeToUtc(2026, 10, 14, 6, 15, "America/New_York");
  const nextFromEarly = getNextWindowStart(testSchedule, wednesdayEarly);
  const earlyParts = getZonedParts(nextFromEarly, "America/New_York");
  assert.strictEqual(earlyParts.day, 14, "Should open on the same day");
  assert.strictEqual(earlyParts.hour, 9, "Should open at 9:00 AM");
  assert.strictEqual(earlyParts.minute, 0, "Should open at 9:00 AM");

  // Case B: After hours today (Wednesday 19:00) -> Rolls to tomorrow (Thursday 09:00 AM)
  const wednesdayLate = zonedTimeToUtc(2026, 10, 14, 19, 0, "America/New_York");
  const nextFromLate = getNextWindowStart(testSchedule, wednesdayLate);
  const lateParts = getZonedParts(nextFromLate, "America/New_York");
  assert.strictEqual(lateParts.day, 15, "Should roll to Thursday (Oct 15)");
  assert.strictEqual(lateParts.hour, 9, "Should roll to 9:00 AM");

  // Case C: Friday after hours (Friday 18:30) -> Rolls across weekend to Monday 09:00 AM!
  const fridayLate = zonedTimeToUtc(2026, 10, 16, 18, 30, "America/New_York");
  const nextFromFriday = getNextWindowStart(testSchedule, fridayLate);
  const mondayParts = getZonedParts(nextFromFriday, "America/New_York");
  assert.strictEqual(mondayParts.day, 19, "Should roll past Saturday and Sunday to Monday (Oct 19)");
  assert.strictEqual(mondayParts.weekdayIndex, 1, "Should be Monday");
  assert.strictEqual(mondayParts.hour, 9, "Should open at 9:00 AM");

  console.log("✓ Next window rollover verified (same day morning, next day, and weekend skip to Monday)");
}

// 4. Testing Follow-Up Delay Scheduling (calculateScheduledRunTime)
console.log("\n4. Testing Follow-Up Delay Calculation...");
{
  const testSchedule = {
    timezone: "America/New_York",
    days: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "17:00",
  };

  // Base: Wednesday 10:00 AM NY. Delay: 2 hours (12:00 PM) -> Stays on Wednesday 12:00 PM
  const baseWed10am = zonedTimeToUtc(2026, 10, 14, 10, 0, "America/New_York");
  const run1 = calculateScheduledRunTime(baseWed10am, 2 * 60 * 60 * 1000, testSchedule);
  const parts1 = getZonedParts(run1, "America/New_York");
  assert.strictEqual(parts1.day, 14);
  assert.strictEqual(parts1.hour, 12, "Delay should land at 12:00 PM");

  // Base: Friday 15:00 PM NY. Delay: 1 day (Saturday 15:00) -> Lands outside active days!
  // Must roll forward to Monday 09:00 AM
  const baseFri15pm = zonedTimeToUtc(2026, 10, 16, 15, 0, "America/New_York");
  const run2 = calculateScheduledRunTime(baseFri15pm, 24 * 60 * 60 * 1000, testSchedule);
  const parts2 = getZonedParts(run2, "America/New_York");
  assert.strictEqual(parts2.day, 19, "1-day delay on Friday afternoon must roll to Monday morning");
  assert.strictEqual(parts2.hour, 9, "Should be 9:00 AM");

  console.log("✓ Follow-up delay scheduling and weekend postponement verified");
}

// 5. Testing Lead Timezone Auto-Detection
console.log("\n5. Testing Lead Timezone Auto-Detection...");
{
  const leadUS = { country: "United States", location: "San Francisco, CA" };
  assert.strictEqual(detectLeadTimezone(leadUS), "America/Los_Angeles", "SF should map to Pacific");

  const leadNY = { country: "USA", location: "New York" };
  assert.strictEqual(detectLeadTimezone(leadNY), "America/New_York", "NY should map to Eastern");

  const leadUK = { country: "United Kingdom", location: "London" };
  assert.strictEqual(detectLeadTimezone(leadUK), "Europe/London", "London should map to Europe/London");

  const leadGermany = { country: "Germany", location: "Berlin" };
  assert.strictEqual(detectLeadTimezone(leadGermany), "Europe/Berlin", "Berlin should map to Europe/Berlin");

  const leadJapan = { country: "Japan", location: "Tokyo" };
  assert.strictEqual(detectLeadTimezone(leadJapan), "Asia/Tokyo", "Tokyo should map to Asia/Tokyo");

  const leadExplicit = { timezone: "Australia/Melbourne" };
  assert.strictEqual(detectLeadTimezone(leadExplicit), "Australia/Melbourne", "Explicit timezone should be preserved");

  const leadEmpty = { country: null, location: "" };
  assert.strictEqual(detectLeadTimezone(leadEmpty), null, "Empty lead should return null");

  console.log("✓ Lead location and country auto-detection verified");
}

// 6. Testing Effective Schedule Resolution & Override Hierarchy
console.log("\n6. Testing Effective Schedule Resolution & Override Hierarchy...");
{
  const workspaceDefault = {
    timezone: "America/New_York",
    days: [1, 2, 3, 4, 5],
    startTime: "09:00",
    endTime: "17:00",
    leadTimezoneOptimization: false,
  };

  // Case A: Campaign inherits workspace schedule
  const campaignInherit = { useWorkspaceSchedule: true };
  const res1 = resolveEffectiveSchedule(workspaceDefault, campaignInherit);
  assert.strictEqual(res1.timezone, "America/New_York");
  assert.strictEqual(res1.startTime, "09:00");

  // Case B: Campaign overrides workspace schedule
  const campaignCustom = {
    useWorkspaceSchedule: false,
    timezone: "Europe/London",
    startTime: "08:00",
    endTime: "16:00",
    days: [1, 2, 3, 4],
  };
  const res2 = resolveEffectiveSchedule(workspaceDefault, campaignCustom);
  assert.strictEqual(res2.timezone, "Europe/London");
  assert.strictEqual(res2.startTime, "08:00");
  assert.deepStrictEqual(res2.days, [1, 2, 3, 4]);

  // Case C: Smart Send with lead optimization active
  const workspaceWithSmart = {
    ...workspaceDefault,
    leadTimezoneOptimization: true,
  };
  const leadTokyo = { country: "Japan", location: "Tokyo" };
  const res3 = resolveEffectiveSchedule(workspaceWithSmart, null, leadTokyo);
  assert.strictEqual(res3.timezone, "Asia/Tokyo", "Should adopt lead timezone");
  assert.strictEqual(res3.isLeadTimezoneApplied, true);

  console.log("✓ Schedule inheritance and smart override hierarchy verified");
}

console.log("\n=================================================");
console.log("ALL WORKING HOURS & SCHEDULE TESTS PASSED (6/6)!");
console.log("=================================================");
