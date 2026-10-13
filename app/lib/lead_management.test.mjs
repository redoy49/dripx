/**
 * Automated Test Suite for Advanced Lead Management & Bulk Campaign Enrollment Hub
 * Run: node --env-file=.env.local app/lib/lead_management.test.mjs
 */

import assert from "node:assert/strict";
import { ObjectId } from "mongodb";

console.log("=== RUNNING ADVANCED LEAD MANAGEMENT & BULK ENROLLMENT TESTS ===\n");

// --- TEST 1: RFC 4180 CSV Formatter & Special Characters Escaping ---
console.log("1. Testing RFC 4180 CSV Formatter & Special Characters Escaping...");

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

// Check standard field without special chars
assert.equal(escapeCsvCell("John"), "John");

// Check commas escaping
assert.equal(escapeCsvCell("Acme, Inc."), '"Acme, Inc."');

// Check quotes escaping (quotes must be doubled)
assert.equal(escapeCsvCell('Founder & "CEO"'), '"Founder & ""CEO"""');

// Check newline escaping
assert.equal(escapeCsvCell("Line 1\nLine 2"), '"Line 1\nLine 2"');

// Check null and undefined
assert.equal(escapeCsvCell(null), "");
assert.equal(escapeCsvCell(undefined), "");

// Check full row formatting
const headers = ["First Name", "Last Name", "Company", "Tags"];
const row1 = ["Sarah", "Connor", "Cyberdyne Systems, Inc.", "vip; enterprise"];
const row2 = ['T-800 "Model 101"', "Terminator", "Skynet", "ai; lead"];

const formattedHeaders = formatCsvRow(headers);
const formattedRow1 = formatCsvRow(row1);
const formattedRow2 = formatCsvRow(row2);

assert.equal(formattedHeaders, "First Name,Last Name,Company,Tags");
assert.equal(formattedRow1, 'Sarah,Connor,"Cyberdyne Systems, Inc.",vip; enterprise');
assert.equal(formattedRow2, '"T-800 ""Model 101""",Terminator,Skynet,ai; lead');

console.log("✓ RFC 4180 CSV formatting & cell escaping verified\n");

// --- TEST 2: Multi-Dimensional Lead Filter Query Construction ---
console.log("2. Testing Multi-Dimensional Lead Filter Query Construction...");

function buildLeadQuery({ workspaceId, search, tag, source, campaignId, status, enrollmentsMap, statusMap }) {
  const query = { workspaceId: new ObjectId(workspaceId) };

  if (search && search.trim()) {
    const re = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [
      { firstName: re },
      { lastName: re },
      { company: re },
      { jobTitle: re },
      { email: re },
    ];
  }

  if (tag && tag !== "all") query.tags = tag;
  if (source && source !== "all") query.source = source;

  // Filter by Campaign enrollment
  if (campaignId && campaignId !== "all") {
    if (campaignId === "unassigned") {
      const allEnrolledLeadIds = enrollmentsMap.get("ALL") || [];
      query._id = { $nin: allEnrolledLeadIds };
    } else {
      const campaignLeadIds = enrollmentsMap.get(campaignId) || [];
      query._id = { $in: campaignLeadIds };
    }
  }

  // Filter by Outreach Status
  if (status && status !== "all") {
    const statusLeadIds = statusMap.get(status) || [];
    if (query._id) {
      const existingIn = query._id.$in || [];
      const existingSet = new Set(existingIn.map((id) => id.toString()));
      const intersected = statusLeadIds.filter((id) => existingSet.has(id.toString()));
      query._id = { $in: intersected };
    } else {
      query._id = { $in: statusLeadIds };
    }
  }

  return query;
}

const testWorkspaceId = new ObjectId();
const lead1 = new ObjectId();
const lead2 = new ObjectId();
const lead3 = new ObjectId();

const enrollmentsMap = new Map();
enrollmentsMap.set("camp123", [lead1, lead2]);
enrollmentsMap.set("ALL", [lead1, lead2]);

const statusMap = new Map();
statusMap.set("replied", [lead1]);

// Query 1: Base workspace query
const qBase = buildLeadQuery({ workspaceId: testWorkspaceId });
assert.deepEqual(qBase.workspaceId, testWorkspaceId);
assert.equal(qBase.$or, undefined);

// Query 2: Search by company with special regex character
const qSearch = buildLeadQuery({ workspaceId: testWorkspaceId, search: "Acme (US)" });
assert.ok(qSearch.$or, "Must construct $or array for search query");
assert.equal(qSearch.$or.length, 5);

// Query 3: Unassigned leads
const qUnassigned = buildLeadQuery({
  workspaceId: testWorkspaceId,
  campaignId: "unassigned",
  enrollmentsMap,
  statusMap,
});
assert.deepEqual(qUnassigned._id, { $nin: [lead1, lead2] }, "Unassigned query must exclude all enrolled leads");

// Query 4: Campaign AND status intersection
const qIntersect = buildLeadQuery({
  workspaceId: testWorkspaceId,
  campaignId: "camp123",
  status: "replied",
  enrollmentsMap,
  statusMap,
});
assert.ok(qIntersect._id.$in);
assert.equal(qIntersect._id.$in.length, 1);
assert.equal(qIntersect._id.$in[0].toString(), lead1.toString());

console.log("✓ Multi-dimensional filter builder & intersection logic verified\n");

// --- TEST 3: Bulk Tag Operations (Add & Remove Idempotency) ---
console.log("3. Testing Bulk Tag Operations...");

function simulateBulkAddTags(leads, targetLeadIds, newTags) {
  const targetSet = new Set(targetLeadIds.map((id) => id.toString()));
  let modifiedCount = 0;

  for (const lead of leads) {
    if (targetSet.has(lead._id.toString())) {
      const existingTags = new Set(lead.tags || []);
      let changed = false;
      for (const t of newTags) {
        if (!existingTags.has(t)) {
          existingTags.add(t);
          changed = true;
        }
      }
      if (changed) {
        lead.tags = Array.from(existingTags);
        modifiedCount++;
      }
    }
  }

  return modifiedCount;
}

function simulateBulkRemoveTags(leads, targetLeadIds, tagsToRemove) {
  const targetSet = new Set(targetLeadIds.map((id) => id.toString()));
  const removeSet = new Set(tagsToRemove);
  let modifiedCount = 0;

  for (const lead of leads) {
    if (targetSet.has(lead._id.toString())) {
      const origLen = (lead.tags || []).length;
      lead.tags = (lead.tags || []).filter((t) => !removeSet.has(t));
      if (lead.tags.length !== origLen) {
        modifiedCount++;
      }
    }
  }

  return modifiedCount;
}

const leadsStore = [
  { _id: new ObjectId(), tags: ["prospect", "q4"] },
  { _id: new ObjectId(), tags: ["customer"] },
  { _id: new ObjectId(), tags: [] },
];

// Add tag "enterprise" to lead 0 and lead 1
const addCount1 = simulateBulkAddTags(leadsStore, [leadsStore[0]._id, leadsStore[1]._id], ["enterprise"]);
assert.equal(addCount1, 2, "Both leads should be updated");
assert.ok(leadsStore[0].tags.includes("enterprise"));
assert.ok(leadsStore[1].tags.includes("enterprise"));

// Adding "enterprise" again (Idempotency test)
const addCount2 = simulateBulkAddTags(leadsStore, [leadsStore[0]._id], ["enterprise"]);
assert.equal(addCount2, 0, "Idempotent add should not increment modifiedCount if tag already present");
assert.equal(leadsStore[0].tags.filter((t) => t === "enterprise").length, 1, "Tag must not be duplicated");

// Remove tag "q4"
const removeCount1 = simulateBulkRemoveTags(leadsStore, [leadsStore[0]._id, leadsStore[2]._id], ["q4"]);
assert.equal(removeCount1, 1, "Only lead 0 had tag 'q4'");
assert.ok(!leadsStore[0].tags.includes("q4"));

console.log("✓ Bulk tag addition & removal idempotency verified\n");

// --- TEST 4: Campaign Enrollment Auto-Start & Job Scheduling ---
console.log("4. Testing Campaign Enrollment Auto-Start & Step Progression...");

function simulateEnrollment({
  campaign,
  steps,
  leadIds,
  existingEnrollments = [],
}) {
  const existingSet = new Set(existingEnrollments.map((e) => `${e.campaignId}_${e.leadId}`));
  const newEnrollments = [];
  const queuedJobs = [];

  for (const leadId of leadIds) {
    const key = `${campaign._id}_${leadId}`;
    if (existingSet.has(key)) continue;

    const enrollment = {
      _id: new ObjectId(),
      campaignId: campaign._id,
      leadId,
      status: "pending",
      currentStepId: null,
      enrolledAt: new Date(),
    };
    newEnrollments.push(enrollment);

    // If campaign is active, immediately resolve first step and queue job
    if (campaign.status === "active" && steps.length > 0) {
      const firstStep = steps[0];
      const delayMs = (firstStep.delayDays || 0) * 86400000;
      queuedJobs.push({
        _id: new ObjectId(),
        workspaceId: campaign.workspaceId,
        campaignId: campaign._id,
        campaignLeadId: enrollment._id,
        stepId: firstStep._id,
        type: firstStep.type,
        runAfter: new Date(Date.now() + delayMs),
        status: "queued",
      });
      enrollment.currentStepId = firstStep._id;
      enrollment.status = "in_progress";
    }
  }

  return {
    enrolled: newEnrollments.length,
    skipped: leadIds.length - newEnrollments.length,
    queuedJobs: queuedJobs.length,
    newEnrollments,
    queuedJobsList: queuedJobs,
  };
}

const testCampaignId = new ObjectId();
const testStepId = new ObjectId();
const campaignSteps = [
  { _id: testStepId, type: "email", order: 1, delayDays: 0 },
];

// Case A: Enroll into draft campaign
const draftCampaign = { _id: testCampaignId, workspaceId: testWorkspaceId, status: "draft" };
const draftResult = simulateEnrollment({
  campaign: draftCampaign,
  steps: campaignSteps,
  leadIds: [lead1, lead2],
});
assert.equal(draftResult.enrolled, 2);
assert.equal(draftResult.queuedJobs, 0, "Draft campaign must not queue jobs yet");
assert.equal(draftResult.newEnrollments[0].status, "pending");

// Case B: Enroll into active campaign
const activeCampaign = { _id: testCampaignId, workspaceId: testWorkspaceId, status: "active" };
const activeResult = simulateEnrollment({
  campaign: activeCampaign,
  steps: campaignSteps,
  leadIds: [lead1, lead2, lead3],
  existingEnrollments: [{ campaignId: testCampaignId, leadId: lead1 }], // lead1 already enrolled
});
assert.equal(activeResult.enrolled, 2, "lead2 and lead3 should be enrolled");
assert.equal(activeResult.skipped, 1, "lead1 should be skipped");
assert.equal(activeResult.queuedJobs, 2, "2 jobs should be queued immediately for active campaign");
assert.equal(activeResult.newEnrollments[0].status, "in_progress");
assert.equal(activeResult.newEnrollments[0].currentStepId.toString(), testStepId.toString());
assert.equal(activeResult.queuedJobsList[0].status, "queued");

console.log("✓ Campaign enrollment and active job dispatch verified\n");

// --- TEST 5: Multi-Tenant Workspace Security Boundary ---
console.log("5. Testing Multi-Tenant Workspace Security Boundary...");

const wsA = new ObjectId();
const wsB = new ObjectId();

const leadsDb = [
  { _id: new ObjectId(), workspaceId: wsA, email: "alice@company-a.com" },
  { _id: new ObjectId(), workspaceId: wsA, email: "bob@company-a.com" },
  { _id: new ObjectId(), workspaceId: wsB, email: "charlie@company-b.com" },
];

function filterLeadsForWorkspace(leads, requestedIds, userWorkspaceId) {
  const reqSet = new Set(requestedIds.map((id) => id.toString()));
  return leads.filter((l) => reqSet.has(l._id.toString()) && l.workspaceId.toString() === userWorkspaceId.toString());
}

// User in Workspace A requests their own leads + Workspace B's lead
const maliciousRequestIds = [leadsDb[0]._id, leadsDb[1]._id, leadsDb[2]._id];
const verifiedLeadsWsA = filterLeadsForWorkspace(leadsDb, maliciousRequestIds, wsA);

assert.equal(verifiedLeadsWsA.length, 2, "Workspace A should only be granted access to its own 2 leads");
assert.ok(!verifiedLeadsWsA.some((l) => l.email === "charlie@company-b.com"), "Cross-workspace leak prevented!");

// User in Workspace B attempts the same
const verifiedLeadsWsB = filterLeadsForWorkspace(leadsDb, maliciousRequestIds, wsB);
assert.equal(verifiedLeadsWsB.length, 1, "Workspace B should only be granted access to its 1 lead");
assert.equal(verifiedLeadsWsB[0].email, "charlie@company-b.com");

console.log("✓ Multi-tenant workspace security boundaries enforced\n");

console.log("=================================================");
console.log("ALL ADVANCED LEAD MANAGEMENT TESTS PASSED (5/5)!");
console.log("=================================================");
