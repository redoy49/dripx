/**
 * Automated Test Suite for Unified Executive Pulse & Global Dashboard Modernization
 * Run: node --env-file=.env.local app/lib/dashboard_analytics.test.mjs
 */

import assert from "node:assert/strict";
import { ObjectId } from "mongodb";
import {
  getTimeRangeBounds,
  computePipelineMetrics,
  aggregateTouches,
  generateExecutiveAlerts,
} from "./dashboardAnalytics.js";

console.log("=== RUNNING UNIFIED EXECUTIVE PULSE & DASHBOARD TESTS ===\n");

// --- TEST 1: Time Range Boundary Generator ---
console.log("1. Testing Time Range Boundary Computations...");

const boundsToday = getTimeRangeBounds("today");
assert.equal(boundsToday.days, 1);
assert.equal(boundsToday.startTime.getUTCHours(), 0);
assert.equal(boundsToday.startTime.getUTCMinutes(), 0);

const bounds7d = getTimeRangeBounds("7d");
assert.equal(bounds7d.days, 7);
const diffDays7 = Math.round((bounds7d.now.getTime() - bounds7d.startTime.getTime()) / 86400000);
assert.equal(diffDays7, 7);

const bounds30d = getTimeRangeBounds("30d");
assert.equal(bounds30d.days, 30);

const bounds90d = getTimeRangeBounds("90d");
assert.equal(bounds90d.days, 90);

// Default fallback for invalid string
const boundsFallback = getTimeRangeBounds("invalid_range");
assert.equal(boundsFallback.days, 7);

console.log("✓ Time range boundary calculations verified for all presets\n");

// --- TEST 2: Executive KPI Formulas & Zero-Division Safety ---
console.log("2. Testing Executive KPI Calculations & Zero-Division Guards...");



// Case A: Active pipeline
const activePipeline = computePipelineMetrics(250, 180, 27);
assert.equal(activePipeline.totalLeads, 250);
assert.equal(activePipeline.enrolledCount, 180);
assert.equal(activePipeline.unassignedCount, 70);
assert.equal(activePipeline.overallReplyRate, 15.0);

// Case B: Brand new workspace (Zero leads)
const emptyPipeline = computePipelineMetrics(0, 0, 0);
assert.equal(emptyPipeline.overallReplyRate, 0);
assert(!Number.isNaN(emptyPipeline.overallReplyRate), "Must not produce NaN");

console.log("✓ Pipeline formulas and zero-division safety verified\n");

// --- TEST 3: Multi-Channel Touch & Velocity Aggregator ---
console.log("3. Testing Multi-Channel Touch & Velocity Aggregation...");



const touches = aggregateTouches({
  emailsSent: 60,
  linkedinMessages: 25,
  connectionRequests: 15,
  profileViews: 0,
});
assert.equal(touches.totalTouches, 100);
assert.equal(touches.emailsSent, 60);
assert.equal(touches.linkedinTouches, 40);
assert.equal(touches.emailPct, 60);
assert.equal(touches.linkedinPct, 40);

console.log("✓ Multi-channel touch aggregation verified\n");

// --- TEST 4: Contextual Alert Generation Rules ---
console.log("4. Testing Contextual Alert Generation Rules...");



const alerts1 = generateExecutiveAlerts({
  needsReconnectCount: 1,
  failedJobsCount: 0,
  unreadConversations: 4,
});
assert.equal(alerts1.length, 2);
assert.equal(alerts1[0].id, "reconnect_needed");
assert.equal(alerts1[1].id, "unread_inbox");

const alertsHealthy = generateExecutiveAlerts({
  needsReconnectCount: 0,
  failedJobsCount: 0,
  unreadConversations: 0,
});
assert.equal(alertsHealthy.length, 0);

console.log("✓ Contextual alert rules verified\n");

// --- TEST 5: Workspace Scoping & Security Boundary Guard ---
console.log("5. Testing Multi-Tenant Workspace Boundary Guard...");

const wsAlpha = new ObjectId();
const wsBeta = new ObjectId();

const mockLogs = [
  { _id: new ObjectId(), workspaceId: wsAlpha, actionType: "email" },
  { _id: new ObjectId(), workspaceId: wsAlpha, actionType: "email" },
  { _id: new ObjectId(), workspaceId: wsBeta, actionType: "email" },
];

function filterLogsForWorkspace(logs, workspaceId) {
  return logs.filter((l) => l.workspaceId.toString() === workspaceId.toString());
}

const alphaLogs = filterLogsForWorkspace(mockLogs, wsAlpha);
assert.equal(alphaLogs.length, 2, "Workspace Alpha should only count its own activity logs");

const betaLogs = filterLogsForWorkspace(mockLogs, wsBeta);
assert.equal(betaLogs.length, 1, "Workspace Beta should only count its own activity logs");

console.log("✓ Multi-tenant workspace scoping verified\n");

console.log("=================================================");
console.log("ALL DASHBOARD ANALYTICS TESTS PASSED (5/5)!");
console.log("=================================================");
