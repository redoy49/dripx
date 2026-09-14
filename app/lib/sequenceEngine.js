// Shared step-type metadata + the "what happens next" resolver used by both the sequence
// builder API (validation) and the job processor (execution), so the two never disagree
// about how a sequence flows.

// Explicit "stop here" marker, distinct from `null` (= "fall through to whatever's
// next in step order"). Lets a branch terminate without inheriting whatever gets
// appended after it later.
export const BRANCH_END = "__end__";

export const STEP_TYPES = {
  connection_request: { label: "Connection Request", action: true, channel: "linkedin" },
  message: { label: "Message", action: true, channel: "linkedin" },
  inmail: { label: "InMail", action: true, channel: "linkedin" },
  profile_visit: { label: "Profile Visit", action: true, channel: "linkedin" },
  like_post: { label: "Like Post", action: true, channel: "linkedin" },
  follow_up: { label: "Follow-up", action: true, channel: "linkedin" },
  email: { label: "Email", action: true, channel: "email" },
  condition: { label: "Condition", action: false, channel: null },
  delay: { label: "Delay", action: false, channel: null },
};

export function isActionStep(type) {
  return !!STEP_TYPES[type]?.action;
}

function findStepById(steps, id) {
  if (!id) return null;
  return steps.find((s) => s._id.toString() === id.toString()) || null;
}

function nextInOrder(steps, currentStep) {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  const idx = sorted.findIndex((s) => s._id.toString() === currentStep._id.toString());
  return idx >= 0 && idx < sorted.length - 1 ? sorted[idx + 1] : null;
}

// Any step can carry an explicit `next` (a step id, or BRANCH_END), making its
// continuation position-independent. Unset falls through to whatever's positionally
// next, unchanged from pre-existing saved sequences.
function resolveContinuation(steps, cursor) {
  if (cursor.next === BRANCH_END) return null;
  if (cursor.next) return findStepById(steps, cursor.next);
  return nextInOrder(steps, cursor);
}

// Walks forward from `currentStep` through any delay/condition chain until it lands on
// an action step or the sequence ends. `evaluateCondition(step)` is an async predicate
// the caller supplies (needs DB access, kept out of this pure-logic module). Returns
// { nextStep: sequenceStepDoc|null, delayMs: number }.
export async function resolveNextExecutableStep(steps, currentStep, evaluateCondition) {
  let delayMs = 0;
  let cursor = currentStep;
  let guard = 0;

  while (guard++ < steps.length + 1) {
    const meta = STEP_TYPES[cursor.type];

    if (meta?.action) {
      return { nextStep: cursor, delayMs };
    }

    if (cursor.type === "delay") {
      const amount = Number(cursor.config?.amount) || 0;
      const unit = cursor.config?.unit || "hours";
      const multiplier = unit === "days" ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000;
      delayMs += amount * multiplier;

      const next = resolveContinuation(steps, cursor);
      if (!next) return { nextStep: null, delayMs };
      cursor = next;
      continue;
    }

    if (cursor.type === "condition") {
      const passed = await evaluateCondition(cursor);
      const targetId = passed ? cursor.branches?.yes : cursor.branches?.no;

      if (targetId === BRANCH_END) {
        return { nextStep: null, delayMs };
      }

      const target = findStepById(steps, targetId);

      if (target) {
        cursor = target;
        continue;
      }

      // No explicit branch target configured: fall through to the next step in order.
      const next = resolveContinuation(steps, cursor);
      if (!next) return { nextStep: null, delayMs };
      cursor = next;
      continue;
    }

    // Unknown type, bail safely.
    return { nextStep: null, delayMs };
  }

  return { nextStep: null, delayMs };
}

// Resolves what runs after `justRanStep` has already executed: advances past it first,
// then walks any delay/condition chain. Call this (not resolveNextExecutableStep
// directly) once a step's action has been dispatched — resolveNextExecutableStep treats
// its `currentStep` as something to evaluate, not skip past, so passing it an
// already-executed action step would just return that same step again.
export async function resolveStepAfter(steps, justRanStep, evaluateCondition) {
  const next = resolveContinuation(steps, justRanStep);
  if (!next) return { nextStep: null, delayMs: 0 };
  return resolveNextExecutableStep(steps, next, evaluateCondition);
}

// Resolves the very first executable step when a campaign is activated (mirrors the
// walk above but starting "before" step 0).
export async function resolveFirstExecutableStep(steps, evaluateCondition) {
  const sorted = [...steps].sort((a, b) => a.order - b.order);
  if (sorted.length === 0) return { nextStep: null, delayMs: 0 };

  const first = sorted[0];
  const meta = STEP_TYPES[first.type];
  if (meta?.action) return { nextStep: first, delayMs: 0 };

  return resolveNextExecutableStep(sorted, first, evaluateCondition);
}
