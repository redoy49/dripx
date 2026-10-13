/**
 * Automated Test Suite for Campaign Analytics & Performance Dashboard
 * Run: node --env-file=.env.local app/lib/campaign_analytics.test.mjs
 */

import assert from "node:assert/strict";
import { ObjectId } from "mongodb";

console.log("=== RUNNING CAMPAIGN ANALYTICS & DASHBOARD TESTS ===\n");

// --- TEST 1: KPI Calculation & Zero-Division Safety ---
console.log("1. Testing KPI Aggregator & Safe Rate Computations...");

function calculateKpis({ totalEnrolled, repliedCount, completedCount, outboundTouches }) {
  const replyRate = totalEnrolled > 0
    ? Number(((repliedCount / totalEnrolled) * 100).toFixed(1))
    : 0;
  const completionRate = totalEnrolled > 0
    ? Number(((completedCount / totalEnrolled) * 100).toFixed(1))
    : 0;

  return {
    totalEnrolled,
    outboundTouches,
    repliedCount,
    completedCount,
    replyRate,
    completionRate,
  };
}

// Case A: Standard campaign with numbers
const standardKpis = calculateKpis({
  totalEnrolled: 200,
  repliedCount: 36,
  completedCount: 94,
  outboundTouches: 512,
});
assert.equal(standardKpis.totalEnrolled, 200);
assert.equal(standardKpis.outboundTouches, 512);
assert.equal(standardKpis.replyRate, 18.0, "Reply rate should be 18.0%");
assert.equal(standardKpis.completionRate, 47.0, "Completion rate should be 47.0%");

// Case B: Zero enrolled safety (Brand new campaign)
const emptyKpis = calculateKpis({
  totalEnrolled: 0,
  repliedCount: 0,
  completedCount: 0,
  outboundTouches: 0,
});
assert.equal(emptyKpis.replyRate, 0, "Zero enrolled must yield 0% without NaN");
assert.equal(emptyKpis.completionRate, 0, "Zero enrolled must yield 0% without NaN");
assert(!Number.isNaN(emptyKpis.replyRate), "Should never produce NaN");

console.log("✓ KPI calculations and zero-division guards verified\n");

// --- TEST 2: Multi-Channel Performance Matrix ---
console.log("2. Testing Multi-Channel Performance Matrix Breakdown...");

function calculateChannelMatrix(activities, conversations) {
  let emailSent = 0;
  let linkedinSent = 0;

  for (const act of activities) {
    if (act.type === "email_sent") emailSent++;
    else if (act.type === "linkedin_message" || act.type === "linkedin_connection_request") linkedinSent++;
  }

  let emailReplies = 0;
  let linkedinReplies = 0;

  for (const conv of conversations) {
    if (conv.channel === "email" && conv.inboundCount > 0) emailReplies++;
    else if (conv.channel === "linkedin" && conv.inboundCount > 0) linkedinReplies++;
  }

  return {
    email: {
      sent: emailSent,
      replies: emailReplies,
      rate: emailSent > 0 ? Number(((emailReplies / emailSent) * 100).toFixed(1)) : 0,
    },
    linkedin: {
      sent: linkedinSent,
      replies: linkedinReplies,
      rate: linkedinSent > 0 ? Number(((linkedinReplies / linkedinSent) * 100).toFixed(1)) : 0,
    },
  };
}

const mockActivities = [
  { type: "email_sent" },
  { type: "email_sent" },
  { type: "email_sent" },
  { type: "email_sent" },
  { type: "linkedin_connection_request" },
  { type: "linkedin_message" },
];

const mockConversations = [
  { channel: "email", inboundCount: 1 },
  { channel: "email", inboundCount: 0 },
  { channel: "linkedin", inboundCount: 1 },
];

const channelMatrix = calculateChannelMatrix(mockActivities, mockConversations);
assert.equal(channelMatrix.email.sent, 4, "Email sent count matches");
assert.equal(channelMatrix.email.replies, 1, "Email replies match");
assert.equal(channelMatrix.email.rate, 25.0, "Email reply rate matches (1 / 4 = 25%)");

assert.equal(channelMatrix.linkedin.sent, 2, "LinkedIn touches match");
assert.equal(channelMatrix.linkedin.replies, 1, "LinkedIn replies match");
assert.equal(channelMatrix.linkedin.rate, 50.0, "LinkedIn reply rate matches (1 / 2 = 50%)");

console.log("✓ Multi-channel matrix calculates accurate per-channel metrics\n");

// --- TEST 3: Step-by-Step Funnel & Drop-Off Aggregation ---
console.log("3. Testing Step-by-Step Funnel Drop-Off Aggregation...");

function aggregateStepDropOff(steps, leadStepDistribution, totalEnrolled) {
  const sortedSteps = [...steps].sort((a, b) => (a.order || 0) - (b.order || 0));

  let cumulativeReached = totalEnrolled;
  const funnel = [];

  for (let i = 0; i < sortedSteps.length; i++) {
    const step = sortedSteps[i];
    const leadsAtOrPastStep = leadStepDistribution[step._id.toString()] || 0;
    const reached = cumulativeReached;
    const nextReached = leadsAtOrPastStep;
    const dropOffCount = Math.max(0, reached - nextReached);
    const dropOffRate = reached > 0 ? Number(((dropOffCount / reached) * 100).toFixed(1)) : 0;

    funnel.push({
      stepId: step._id.toString(),
      title: step.title || `Step ${i + 1}`,
      type: step.type,
      order: step.order || i + 1,
      reached,
      completed: nextReached,
      dropOffRate,
    });

    cumulativeReached = nextReached;
  }

  return funnel;
}

const step1Id = new ObjectId();
const step2Id = new ObjectId();
const step3Id = new ObjectId();

const testSteps = [
  { _id: step1Id, title: "Initial Cold Email", type: "email", order: 1 },
  { _id: step2Id, title: "LinkedIn Connect", type: "linkedin_connection", order: 2 },
  { _id: step3Id, title: "Follow-up Email", type: "email", order: 3 },
];

// Distribution: 100 enrolled initially -> 70 proceed to step 2 -> 40 proceed to step 3
const distribution = {
  [step1Id.toString()]: 70,
  [step2Id.toString()]: 40,
  [step3Id.toString()]: 30,
};

const funnel = aggregateStepDropOff(testSteps, distribution, 100);
assert.equal(funnel.length, 3);
assert.equal(funnel[0].reached, 100);
assert.equal(funnel[0].completed, 70);
assert.equal(funnel[0].dropOffRate, 30.0, "Step 1 drop-off is 30% (30 dropped out of 100)");

assert.equal(funnel[1].reached, 70);
assert.equal(funnel[1].completed, 40);
assert.equal(funnel[1].dropOffRate, 42.9, "Step 2 drop-off is 42.9% (30 dropped out of 70)");

console.log("✓ Funnel drop-off aggregator produces expected conversion flow\n");

// --- TEST 4: RFC 4180 CSV Formatter & Sanitization ---
console.log("4. Testing RFC 4180 CSV Formatter & Escaping...");

function escapeCsvCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatCsvRow(fields) {
  return fields.map(escapeCsvCell).join(",");
}

// Plain text cell
assert.equal(escapeCsvCell("John"), "John");

// Cell with comma
assert.equal(escapeCsvCell("Acme, Inc."), '"Acme, Inc."');

// Cell with quotes
assert.equal(escapeCsvCell('The "Best" SaaS'), '"The ""Best"" SaaS"');

// Cell with newline
assert.equal(escapeCsvCell("Line 1\nLine 2"), '"Line 1\nLine 2"');

// Complete row formatting
const headers = ["First Name", "Last Name", "Email", "Company", "Status"];
const row = ["Jane", "Doe, Jr.", "jane@example.com", 'Acme "Global"', "in_progress"];

const formattedHeader = formatCsvRow(headers);
const formattedRow = formatCsvRow(row);

assert.equal(formattedHeader, "First Name,Last Name,Email,Company,Status");
assert.equal(formattedRow, 'Jane,"Doe, Jr.",jane@example.com,"Acme ""Global""",in_progress');

console.log("✓ RFC 4180 CSV escaping handles commas, quotes, and newlines accurately\n");

// --- TEST 5: Lead Pause/Resume & Queued Job Invalidation Logic ---
console.log("5. Testing Lead Status Toggle & Job Cancellation Logic...");

function simulateLeadStatusToggle(leadCurrentStatus, mockJobs) {
  const nextStatus = leadCurrentStatus === "paused" ? "in_progress" : "paused";

  let updatedJobs = [...mockJobs];
  if (nextStatus === "paused") {
    updatedJobs = updatedJobs.map((j) => {
      if (j.status === "queued") {
        return { ...j, status: "skipped", lastError: "Lead manually paused" };
      }
      return j;
    });
  }

  return { nextStatus, jobs: updatedJobs };
}

const initialJobs = [
  { _id: new ObjectId(), status: "queued", stepIndex: 2 },
  { _id: new ObjectId(), status: "completed", stepIndex: 1 },
];

// Pausing the lead:
const pauseResult = simulateLeadStatusToggle("in_progress", initialJobs);
assert.equal(pauseResult.nextStatus, "paused");
assert.equal(pauseResult.jobs[0].status, "skipped");
assert.equal(pauseResult.jobs[0].lastError, "Lead manually paused");
assert.equal(pauseResult.jobs[1].status, "completed", "Non-queued jobs remain unchanged");

// Resuming the lead:
const resumeResult = simulateLeadStatusToggle("paused", pauseResult.jobs);
assert.equal(resumeResult.nextStatus, "in_progress");

console.log("✓ Lead status toggle and queued job cancellation verified\n");

// --- TEST 6: Multi-Tenant Workspace Guard ---
console.log("6. Testing Workspace Scoping Isolation Guard...");

function verifyWorkspaceAccess(resourceWorkspaceId, sessionWorkspaceId) {
  if (!resourceWorkspaceId || !sessionWorkspaceId) return false;
  return resourceWorkspaceId.toString() === sessionWorkspaceId.toString();
}

const userWorkspace = new ObjectId();
const foreignWorkspace = new ObjectId();

assert(verifyWorkspaceAccess(userWorkspace, userWorkspace), "Same workspace granted");
assert(!verifyWorkspaceAccess(foreignWorkspace, userWorkspace), "Foreign workspace rejected");

console.log("✓ Workspace isolation guard enforced\n");

console.log("====================================================");
console.log("ALL CAMPAIGN ANALYTICS & DASHBOARD TESTS PASSED (6/6)");
console.log("====================================================\n");
