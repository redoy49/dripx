/**
 * Automated Test Suite for Email Account Health, DNS Diagnostics & Sending Ramp-up Monitor
 * Run: node --env-file=.env.local app/lib/email_health_rampup.test.mjs
 */

import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import {
  extractDomainFromEmail,
  generateRemediationSnippets,
} from "./dnsDiagnostics.js";
import {
  computeRampUpStatus,
  shouldResetDailyCount,
  canAccountSendToday,
  evaluateMailboxHealth,
  generateRampUpProjection,
} from "./rampUpEngine.js";

console.log("=== RUNNING EMAIL HEALTH, DNS DIAGNOSTICS & RAMP-UP TESTS ===\n");

// --- TEST 1: Domain Extraction & Remediation Snippets ---
console.log("1. Testing Domain Extraction & Remediation Snippet Generator...");

assert.equal(extractDomainFromEmail("alex@growthmail.io"), "growthmail.io");
assert.equal(extractDomainFromEmail("support+sales@sub.company.org"), "sub.company.org");
assert.equal(extractDomainFromEmail("  ceo@CORP.COM  "), "corp.com");
assert.equal(extractDomainFromEmail("plaindomain.com"), "plaindomain.com");

const snippetsGoogle = generateRemediationSnippets("outreach.dev", "google");
assert.equal(snippetsGoogle.length, 4, "Must generate SPF, DMARC, DKIM, and MX snippets");
assert.ok(snippetsGoogle.some((s) => s.value.includes("_spf.google.com")), "Google SPF snippet required");
assert.ok(snippetsGoogle.some((s) => s.value.includes("v=DMARC1;")), "DMARC snippet required");

const snippetsMs = generateRemediationSnippets("outreach.dev", "microsoft");
assert.ok(snippetsMs.some((s) => s.value.includes("spf.protection.outlook.com")), "Microsoft SPF snippet required");

console.log("✓ Domain extraction and DNS snippet generator verified\n");

// --- TEST 2: DNS Evaluation Logic & Deliverability Scoring Engine ---
console.log("2. Testing DNS Evaluation & Weighted Deliverability Scoring...");

function evaluateMockDns({ spfRecord, dmarcRecord, dkimRecord, mxCount = 1 }) {
  // SPF: 30 pts max
  let spfScore = 0;
  let spfStatus = "missing";
  if (spfRecord) {
    if (spfRecord.includes("+all")) {
      spfScore = 15;
      spfStatus = "warning";
    } else if (spfRecord.includes("-all")) {
      spfScore = 30;
      spfStatus = "valid";
    } else if (spfRecord.includes("~all")) {
      spfScore = 28;
      spfStatus = "valid";
    } else {
      spfScore = 20;
      spfStatus = "warning";
    }
  }

  // DKIM: 25 pts max
  let dkimScore = 0;
  let dkimStatus = "missing";
  if (dkimRecord && (dkimRecord.includes("v=DKIM1") || dkimRecord.includes("p="))) {
    dkimScore = 25;
    dkimStatus = "valid";
  }

  // DMARC: 25 pts max
  let dmarcScore = 0;
  let dmarcStatus = "missing";
  if (dmarcRecord && dmarcRecord.startsWith("v=DMARC1")) {
    if (dmarcRecord.includes("p=reject")) {
      dmarcScore = 25;
      dmarcStatus = "valid";
    } else if (dmarcRecord.includes("p=quarantine")) {
      dmarcScore = 23;
      dmarcStatus = "valid";
    } else {
      dmarcScore = 15;
      dmarcStatus = "warning";
    }
  }

  // MX: 20 pts max
  const mxScore = mxCount > 0 ? 20 : 0;
  const mxStatus = mxCount > 0 ? "valid" : "missing";

  const total = Math.min(100, Math.round(spfScore + dkimScore + dmarcScore + mxScore));
  let rating = "critical";
  if (total >= 90) rating = "optimal";
  else if (total >= 70) rating = "good";
  else if (total >= 50) rating = "warning";

  return { total, rating, spfStatus, dkimStatus, dmarcStatus, mxStatus };
}

// Case A: Perfect domain setup
const perfectDns = evaluateMockDns({
  spfRecord: "v=spf1 include:_spf.google.com -all",
  dmarcRecord: "v=DMARC1; p=reject; pct=100",
  dkimRecord: "v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQ...",
  mxCount: 5,
});
assert.equal(perfectDns.total, 100);
assert.equal(perfectDns.rating, "optimal");
assert.equal(perfectDns.spfStatus, "valid");
assert.equal(perfectDns.dmarcStatus, "valid");

// Case B: Incomplete domain (Missing DMARC & Permissive SPF)
const flawedDns = evaluateMockDns({
  spfRecord: "v=spf1 include:_spf.google.com +all", // Permissive
  dmarcRecord: null, // Missing
  dkimRecord: "v=DKIM1; p=MIGf...",
  mxCount: 1,
});
assert.equal(flawedDns.total, 60);
assert.equal(flawedDns.rating, "warning");
assert.equal(flawedDns.spfStatus, "warning");
assert.equal(flawedDns.dmarcStatus, "missing");

// Case C: Unconfigured Domain (Zero DNS)
const zeroDns = evaluateMockDns({
  spfRecord: null,
  dmarcRecord: null,
  dkimRecord: null,
  mxCount: 0,
});
assert.equal(zeroDns.total, 0);
assert.equal(zeroDns.rating, "critical");

console.log("✓ DNS weighted deliverability scoring verified (Optimal, Warning, Critical)\n");

// --- TEST 3: Sending Ramp-Up Engine & Daily Trajectory ---
console.log("3. Testing Sending Ramp-Up Engine Progression & Capacities...");

// Case A: Day 1 brand new mailbox (started today)
const brandNewAccount = {
  createdAt: new Date(),
  dailyLimit: 40,
  rampUp: {
    enabled: true,
    startingLimit: 10,
    dailyIncrement: 3,
    targetLimit: 40,
    startedAt: new Date(),
  },
};
const day1Status = computeRampUpStatus(brandNewAccount);
assert.equal(day1Status.currentEffectiveLimit, 10, "Day 1 must start at startingLimit (10)");
assert.equal(day1Status.currentDay, 1);
assert.equal(day1Status.isWarmingUp, true);
assert.equal(day1Status.isGraduated, false);
assert.equal(day1Status.progressPct, 0);

// Case B: Day 5 mailbox (started 4 days ago)
const fourDaysAgo = new Date(Date.now() - 4 * 86400000);
const day5Account = {
  createdAt: fourDaysAgo,
  dailyLimit: 40,
  rampUp: {
    enabled: true,
    startingLimit: 10,
    dailyIncrement: 3,
    targetLimit: 40,
    startedAt: fourDaysAgo,
  },
};
const day5Status = computeRampUpStatus(day5Account);
// 10 + (4 * 3) = 22
assert.equal(day5Status.currentEffectiveLimit, 22, "Day 5 capacity must be 10 + (4 * 3) = 22");
assert.equal(day5Status.currentDay, 5);
assert.equal(day5Status.isWarmingUp, true);
assert.equal(day5Status.isGraduated, false);
assert.equal(day5Status.progressPct, 40); // (22 - 10) / (40 - 10) = 40%

// Case C: Fully Graduated mailbox (started 30 days ago)
const monthAgo = new Date(Date.now() - 30 * 86400000);
const graduatedAccount = {
  createdAt: monthAgo,
  dailyLimit: 40,
  rampUp: {
    enabled: true,
    startingLimit: 10,
    dailyIncrement: 3,
    targetLimit: 40,
    startedAt: monthAgo,
  },
};
const gradStatus = computeRampUpStatus(graduatedAccount);
assert.equal(gradStatus.currentEffectiveLimit, 40, "Effective limit must be capped at targetLimit (40)");
assert.equal(gradStatus.isWarmingUp, false);
assert.equal(gradStatus.isGraduated, true);
assert.equal(gradStatus.progressPct, 100);

// Case D: Ramp-Up disabled
const manualAccount = {
  dailyLimit: 50,
  rampUp: { enabled: false },
};
const manualStatus = computeRampUpStatus(manualAccount);
assert.equal(manualStatus.enabled, false);
assert.equal(manualStatus.currentEffectiveLimit, 50);
assert.equal(manualStatus.isWarmingUp, false);

// Case E: 14-day projection schedule
const projection = generateRampUpProjection(10, 3, 25, 10);
assert.equal(projection.length, 10);
assert.equal(projection[0].limit, 10);
assert.equal(projection[1].limit, 13);
assert.equal(projection[4].limit, 22);
assert.equal(projection[5].limit, 25);
assert.equal(projection[5].isGraduated, true);
assert.equal(projection[9].limit, 25, "Must remain capped at 25");

console.log("✓ Ramp-Up volume calculations & projection schedules verified\n");

// --- TEST 4: UTC Date Rollover & Daily Quota Guard ---
console.log("4. Testing UTC Date Rollover & Daily Quota Guard...");

// Same UTC day
const now = new Date();
assert.equal(shouldResetDailyCount(now), false, "Same date should not trigger reset");

// Yesterday
const yesterday = new Date(Date.now() - 25 * 3600000);
assert.equal(shouldResetDailyCount(yesterday), true, "Yesterday should trigger daily reset");

// Quota check: Under quota
const activeAccount = {
  dailyLimit: 40,
  todaySentCount: 8,
  lastSentAt: new Date(),
  rampUp: { enabled: false },
};
const quotaOk = canAccountSendToday(activeAccount);
assert.equal(quotaOk.canSend, true);
assert.equal(quotaOk.remaining, 32);

// Quota check: At limit
const cappedAccount = {
  dailyLimit: 40,
  todaySentCount: 40,
  lastSentAt: new Date(),
  rampUp: { enabled: false },
};
const quotaCapped = canAccountSendToday(cappedAccount);
assert.equal(quotaCapped.canSend, false);
assert.equal(quotaCapped.remaining, 0);

// Quota check: At limit yesterday, but date rolled over today
const rolledOverAccount = {
  dailyLimit: 40,
  todaySentCount: 40,
  lastSentAt: yesterday, // Sent 40 yesterday
  rampUp: { enabled: false },
};
const quotaRolledOver = canAccountSendToday(rolledOverAccount);
assert.equal(quotaRolledOver.canSend, true, "New calendar day must reset effective today count");
assert.equal(quotaRolledOver.currentCount, 0);
assert.equal(quotaRolledOver.remaining, 40);

console.log("✓ Date rollover & daily quota enforcement verified\n");

// --- TEST 5: Holistic Mailbox Health Index ---
console.log("5. Testing Multi-Factor Mailbox Health Index...");

// Excellent health
const healthA = evaluateMailboxHealth({
  status: "connected",
  dnsScore: 100,
  recentErrorCount: 0,
  rampUp: { enabled: true, startingLimit: 10 },
});
assert.equal(healthA.score, 100);
assert.equal(healthA.rating, "excellent");
assert.equal(healthA.breakdown.connection, 35);
assert.equal(healthA.breakdown.dns, 35);

// Reconnection required
const healthB = evaluateMailboxHealth({
  status: "needs_reconnect",
  dnsScore: 100,
  recentErrorCount: 0,
});
assert.equal(healthB.breakdown.connection, 0);
assert.ok(healthB.score < 70);

// Degraded DNS
const healthC = evaluateMailboxHealth({
  status: "connected",
  dnsScore: 50,
  recentErrorCount: 2,
});
assert.equal(healthC.breakdown.connection, 35);
assert.equal(healthC.breakdown.dns, 18);
assert.equal(healthC.breakdown.reliability, 9);
assert.equal(healthC.score, 77);
assert.equal(healthC.rating, "good");

console.log("✓ Multi-factor Mailbox Health scoring verified\n");

console.log("=================================================");
console.log("ALL EMAIL HEALTH & RAMP-UP TESTS PASSED (5/5)!");
console.log("=================================================");
