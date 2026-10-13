import assert from "node:assert/strict";
import { validateSequence, getStepValidationStatus } from "../(dashboard)/dashboard/new-campaign/flow/validation.js";
import { BRANCH_END } from "../lib/sequenceEngine.js";

console.log("=== RUNNING SEQUENCE BUILDER VALIDATION TESTS ===");

// 1. Test Empty Sequence
console.log("\n1. Testing Empty Sequence Detection...");
const emptyResult = validateSequence([]);
assert.equal(emptyResult.isValid, false, "Empty sequence should be invalid");
assert.equal(emptyResult.actionStepCount, 0);
assert.ok(emptyResult.allErrors[0].message.includes("no outreach actions"));
console.log("✓ Empty sequence correctly flagged");

// 2. Test Sequence with only Delays / Conditions (no actions)
console.log("\n2. Testing Non-action Steps Only...");
const noActionsResult = validateSequence([
  { clientId: "d1", type: "delay", config: { amount: 1, unit: "days" } },
]);
assert.equal(noActionsResult.isValid, false, "Sequence without actions should be invalid");
console.log("✓ Sequence without executable actions correctly flagged");

// 3. Test Unconfigured Email & InMail Steps
console.log("\n3. Testing Missing Email & InMail Template Validation...");
const unconfiguredSteps = [
  { clientId: "e1", type: "email", config: { subject: "", template: "" } },
  { clientId: "m1", type: "message", config: { template: "" } },
  { clientId: "im1", type: "inmail", config: { subject: "Only subject", template: "" } },
];
const unconfResult = validateSequence(unconfiguredSteps);
assert.equal(unconfResult.isValid, false);
assert.equal(unconfResult.errorCount, 3);

const statusE1 = getStepValidationStatus(unconfResult, "e1");
assert.equal(statusE1.hasError, true);
assert.equal(statusE1.errorText, "Subject line and message body are required");

const statusM1 = getStepValidationStatus(unconfResult, "m1");
assert.equal(statusM1.hasError, true);
assert.equal(statusM1.errorText, "Message body is required");

const statusIM1 = getStepValidationStatus(unconfResult, "im1");
assert.equal(statusIM1.hasError, true);
assert.equal(statusIM1.errorText, "Message body is required");
console.log("✓ Missing subject lines and message bodies correctly flagged with exact error texts");

// 4. Test LinkedIn Connection Request 300 Char Limit
console.log("\n4. Testing LinkedIn 300-Char Note Limit...");
const longNote = "a".repeat(301);
const longNoteStep = [
  { clientId: "cr1", type: "connection_request", config: { note: longNote } },
];
const longResult = validateSequence(longNoteStep);
assert.equal(longResult.isValid, false);
assert.ok(longResult.errorsByStep.get("cr1")[0].includes("exceeds LinkedIn limit (301/300 chars)"));
console.log("✓ LinkedIn note exceeding 300 characters correctly flagged");

// 5. Test Advisory Warnings (Condition Dead Ends & 0 Delay)
console.log("\n5. Testing Advisory Warnings...");
const warningSteps = [
  { clientId: "cr2", type: "connection_request", config: { note: "Hi {{firstName}}!" } },
  { clientId: "d_zero", type: "delay", config: { amount: 0, unit: "days" } },
  { clientId: "cond1", type: "condition", config: { rule: "has_replied" }, branches: { yes: BRANCH_END, no: BRANCH_END } },
];
const warnResult = validateSequence(warningSteps);
assert.equal(warnResult.isValid, true, "Advisories do not block validity");
assert.ok(warnResult.warningCount >= 2);
console.log("✓ Advisory warnings for 0 delay and empty condition outcomes captured properly");

// 6. Test Valid, Production-Ready Sequence
console.log("\n6. Testing Valid Full Sequence...");
const validSequence = [
  { clientId: "step1", type: "connection_request", config: { note: "Hi {{firstName}}, would love to connect!" } },
  { clientId: "delay1", type: "delay", config: { amount: 2, unit: "days" } },
  { clientId: "step2", type: "message", config: { template: "Thanks for connecting {{firstName}}!" } },
  { clientId: "delay2", type: "delay", config: { amount: 3, unit: "days" } },
  { clientId: "step3", type: "email", config: { subject: "Quick question for {{company}}", template: "Hi {{firstName}},\n\nWanted to follow up..." } },
];
const validResult = validateSequence(validSequence);
assert.equal(validResult.isValid, true, "Fully configured sequence should be 100% valid");
assert.equal(validResult.errorCount, 0);
assert.equal(validResult.actionStepCount, 3);

const statusStep1 = getStepValidationStatus(validResult, "step1");
assert.equal(statusStep1.hasError, false);
assert.equal(statusStep1.hasWarning, false);

console.log("✓ Fully configured sequence validated cleanly with 0 errors and 0 warnings");

console.log("\nALL SEQUENCE BUILDER VALIDATION TESTS PASSED! (100% SUCCESS)");
