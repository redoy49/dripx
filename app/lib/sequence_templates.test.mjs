/**
 * Automated Test Suite for Feature 6: Multi-Channel Sequence Templates Library
 * Run via: node --env-file=.env.local app/lib/sequence_templates.test.mjs
 */

import assert from "node:assert";
import {
  SYSTEM_SEQUENCE_TEMPLATES,
  TEMPLATE_CATEGORIES,
  instantiateTemplateSteps,
  templateToStepsSummary,
} from "./sequenceTemplates.js";
import { STEP_TYPES } from "./sequenceEngine.js";
import { buildGraph } from "../(dashboard)/dashboard/new-campaign/flow/graph.js";
import { validateSequence } from "../(dashboard)/dashboard/new-campaign/flow/validation.js";

console.log("=== RUNNING MULTI-CHANNEL SEQUENCE TEMPLATES TESTS ===\n");

// 1. Testing System Templates Integrity
console.log("1. Testing System Templates Data Integrity & Step Definitions...");
{
  assert.strictEqual(SYSTEM_SEQUENCE_TEMPLATES.length, 5, "Must have exactly 5 curated playbooks");

  for (const tpl of SYSTEM_SEQUENCE_TEMPLATES) {
    assert.ok(tpl.id, `Template must have an id: ${tpl.name}`);
    assert.ok(tpl.name, `Template must have a name: ${tpl.id}`);
    assert.ok(tpl.description, `Template must have a description: ${tpl.name}`);
    assert.ok(Array.isArray(tpl.channels) && tpl.channels.length > 0, `Template must declare channels: ${tpl.name}`);
    assert.ok(Array.isArray(tpl.steps) && tpl.steps.length > 0, `Template must declare steps: ${tpl.name}`);
    assert.strictEqual(tpl.isSystem, true, "System playbooks must have isSystem: true");

    // Verify all steps have known types
    for (const step of tpl.steps) {
      assert.ok(STEP_TYPES[step.type], `Step type "${step.type}" in template "${tpl.name}" must be valid in sequenceEngine`);
    }
  }

  console.log("✓ All 5 system playbooks validated with complete properties and step types");
}

// 2. Testing Template Instantiation & ID Remapping Engine
console.log("\n2. Testing Template Instantiation & ID Remapping Engine...");
{
  const b2bPlaybook = SYSTEM_SEQUENCE_TEMPLATES.find((t) => t.id === "tpl_multichannel_classic");
  assert.ok(b2bPlaybook, "Multi-channel classic playbook must exist");

  const clonedSteps = instantiateTemplateSteps(b2bPlaybook);
  assert.strictEqual(clonedSteps.length, b2bPlaybook.steps.length, "Cloned steps count must match template");

  // Verify all steps received unique, newly generated clientIds
  const clientIds = clonedSteps.map((s) => s.clientId);
  const uniqueIds = new Set(clientIds);
  assert.strictEqual(uniqueIds.size, clonedSteps.length, "Every instantiated step must have a unique clientId");

  // Verify condition step has accurately remapped branches
  const conditionStep = clonedSteps.find((s) => s.type === "condition");
  assert.ok(conditionStep, "Condition step must exist in cloned steps");
  assert.ok(conditionStep.branches?.yes, "Condition branches.yes must be remapped");
  assert.ok(conditionStep.branches?.no, "Condition branches.no must be remapped");

  // Verify branch target IDs point to actual steps in clonedSteps
  assert.ok(clientIds.includes(conditionStep.branches.yes), "branches.yes must point to a valid instantiated step");
  assert.ok(clientIds.includes(conditionStep.branches.no), "branches.no must point to a valid instantiated step");

  console.log("✓ Fresh clientIds generated and branch targets remapped with zero dangling pointers");
}

// 3. Testing Canvas Graph Compatibility (buildGraph)
console.log("\n3. Testing Graph Compatibility with Canvas Engine...");
{
  for (const tpl of SYSTEM_SEQUENCE_TEMPLATES) {
    const cloned = instantiateTemplateSteps(tpl);
    const graph = buildGraph(cloned);

    assert.ok(Array.isArray(graph.nodes), `Template "${tpl.name}" must produce valid nodes`);
    assert.ok(Array.isArray(graph.edges), `Template "${tpl.name}" must produce valid edges`);
    assert.ok(graph.nodes.length > 0, `Template "${tpl.name}" must contain nodes`);

    // Verify all edge sources and targets correspond to generated nodes
    const nodeIds = new Set(graph.nodes.map((n) => n.id));
    for (const edge of graph.edges) {
      assert.ok(nodeIds.has(edge.source), `Edge source "${edge.source}" must exist in graph nodes`);
      assert.ok(nodeIds.has(edge.target), `Edge target "${edge.target}" must exist in graph nodes`);
    }
  }

  console.log("✓ All 5 playbooks seamlessly generate React Flow node & edge graphs");
}

// 4. Testing Sequence Validation Cleanliness (validateSequence)
console.log("\n4. Testing Real-Time Sequence Validation Cleanliness...");
{
  for (const tpl of SYSTEM_SEQUENCE_TEMPLATES) {
    const cloned = instantiateTemplateSteps(tpl);
    const validation = validateSequence(cloned);

    assert.strictEqual(
      validation.errorCount,
      0,
      `Template "${tpl.name}" must have 0 validation errors, found: ${validation.allErrors.map((e) => e.message).join(", ")}`,
    );
    assert.ok(validation.actionStepCount > 0, `Template "${tpl.name}" must contain executable action steps`);
  }

  console.log("✓ All 5 playbooks pass validateSequence with 0 errors and valid readiness status");
}

// 5. Testing Metrics & Summary Aggregator (templateToStepsSummary)
console.log("\n5. Testing Metrics & Summary Aggregator...");
{
  const b2bPlaybook = SYSTEM_SEQUENCE_TEMPLATES.find((t) => t.id === "tpl_multichannel_classic");
  const summary = templateToStepsSummary(b2bPlaybook);

  assert.strictEqual(summary.totalSteps, 7, "Multi-channel playbook should have 7 steps");
  assert.strictEqual(summary.actionCount, 6, "Should have 6 action steps");
  assert.strictEqual(summary.conditionCount, 1, "Should have 1 condition step");
  assert.ok(summary.channels.includes("linkedin") && summary.channels.includes("email"), "Should attribute both LinkedIn and Email channels");

  console.log("✓ Summary aggregator extracts accurate action counts and channel attributions");
}

console.log("\n=================================================");
console.log("ALL SEQUENCE TEMPLATES TESTS PASSED (5/5)!");
console.log("=================================================");
