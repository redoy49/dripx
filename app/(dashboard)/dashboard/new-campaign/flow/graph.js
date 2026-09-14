// Pure logic turning the flat `steps` array into a node/edge graph for the canvas.
// No network calls or mutation — SequenceBuilder owns state and calls into these helpers.

import {
  UserPlus,
  MessageSquare,
  Mail,
  Eye,
  ThumbsUp,
  RefreshCw,
  GitBranch,
  Award,
  UserCheck,
  MailSearch,
  Ban,
} from "lucide-react";
import { BRANCH_END } from "@/app/lib/sequenceEngine";

export { BRANCH_END };

// Action types jobProcessor.js can actually execute — shown as live sidebar items.
export const ACTION_STEP_OPTIONS = [
  { type: "connection_request", title: "Connection Request", desc: "Send a LinkedIn invite, optionally with a note", icon: UserPlus, accent: "#6367FF", bg: "#F3F2FF" },
  { type: "message", title: "Message", desc: "Send a direct message to a 1st-degree connection", icon: MessageSquare, accent: "#7C3AED", bg: "#F3EFFE" },
  { type: "inmail", title: "InMail", desc: "Send a paid InMail to an out-of-network profile", icon: Mail, accent: "#0891B2", bg: "#ECFBFE" },
  { type: "profile_visit", title: "View Profile", desc: "Visit the lead's profile to trigger a view notification", icon: Eye, accent: "#059669", bg: "#ECFDF5" },
  { type: "like_post", title: "Like a Post", desc: "Like the lead's most recent LinkedIn post", icon: ThumbsUp, accent: "#D97706", bg: "#FFFBEB" },
  { type: "follow_up", title: "Follow-up", desc: "Send a follow-up LinkedIn message", icon: RefreshCw, accent: "#E11D48", bg: "#FFF1F2" },
  { type: "email", title: "Send Email", desc: "Send a cold email through the connected email channel", icon: Mail, accent: "#0A66C2", bg: "#EBF3FB" },
];

// Grayed-out, disabled — not wired to a real connector yet.
export const UNAVAILABLE_ACTIONS = [
  { title: "Endorse Skills", icon: Award },
  { title: "Follow", icon: UserCheck },
  { title: "Find Email", icon: MailSearch },
  { title: "Withdraw Invite", icon: Ban },
];

export const CONDITION_OPTION = {
  type: "condition",
  title: "Has Replied?",
  desc: "Branch the sequence based on whether the lead has replied",
  icon: GitBranch,
  accent: "#7C3AED",
  bg: "#F3EFFE",
};

export function stepOption(type) {
  return ACTION_STEP_OPTIONS.find((o) => o.type === type) || ACTION_STEP_OPTIONS[0];
}

export function stepSummary(step) {
  const opt = stepOption(step.type);
  const text =
    step.type === "connection_request"
      ? step.config?.note
      : step.type === "inmail" || step.type === "email"
        ? step.config?.subject || step.config?.template
        : step.config?.template;

  if (!text) return opt.desc;
  return text.length > 46 ? `${text.slice(0, 46)}…` : text;
}

export function newClientId() {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function defaultConfigFor(type) {
  switch (type) {
    case "connection_request":
      return { note: "" };
    case "message":
    case "follow_up":
      return { template: "" };
    case "inmail":
    case "email":
      return { subject: "", template: "" };
    case "delay":
      return { amount: 1, unit: "days" };
    case "condition":
      return { rule: "has_replied" };
    default:
      return {};
  }
}

function delayMsOf(config) {
  const amount = Number(config?.amount) || 0;
  const unit = config?.unit || "hours";
  return amount * (unit === "days" ? 24 * 60 * 60 * 1000 : 60 * 60 * 1000);
}

export function formatDelay(ms) {
  if (!ms) return "No delay";
  const hours = ms / (60 * 60 * 1000);
  if (hours < 24) {
    const h = Math.round(hours * 10) / 10;
    return `${h} ${h === 1 ? "hour" : "hours"}`;
  }
  const days = Math.round((hours / 24) * 10) / 10;
  return `${days} ${days === 1 ? "day" : "days"}`;
}

// Mirrors sequenceEngine.js's resolveContinuation: explicit `next` (or BRANCH_END) wins,
// else fall through to the next array position.
function nextIndexAfter(steps, indexOf, step, idx) {
  if (step.next === BRANCH_END) return steps.length;
  if (step.next) {
    const i = indexOf.get(step.next);
    return i === undefined ? steps.length : i;
  }
  return idx + 1;
}

// Walks the flat `steps` array into a { nodes, edges } graph: only action steps become
// nodes, delay steps become the `delayMs` on the next edge, condition steps fork the
// edge into "Replied"/"Not replied", and a path that runs out ends in an "add" node.
export function buildGraph(steps) {
  const indexOf = new Map(steps.map((s, i) => [s.clientId, i]));
  const nodes = [];
  const edges = [];
  const seenActionIds = new Set();
  const addNodeIds = new Set();

  function pushActionNode(step) {
    if (!seenActionIds.has(step.clientId)) {
      seenActionIds.add(step.clientId);
      nodes.push({ id: step.clientId, kind: "action", step });
    }
  }

  function pushEdge(source, target, handle, label, color, delayMs, delayStepIds) {
    if (source == null) return;
    edges.push({
      id: `e_${source}_${handle}_${target}`,
      source,
      target,
      sourceHandle: handle === "yes" || handle === "no" ? handle : undefined,
      data: { delayMs, label, color, delayStepIds, handle },
    });
  }

  function pushAddNode(fromId, handle, label, color, delayMs, delayStepIds) {
    const id = `add__${fromId ?? "root"}__${handle}`;
    if (!addNodeIds.has(id)) {
      addNodeIds.add(id);
      nodes.push({ id, kind: "add", fromId: fromId ?? null, handle });
    }
    pushEdge(fromId, id, handle, label, color, delayMs, delayStepIds);
  }

  function walk(idx, fromId, handle, label, color, delayMs, delayStepIds, visited) {
    while (idx >= 0 && idx < steps.length) {
      const step = steps[idx];

      if (visited.has(step.clientId)) {
        idx = steps.length; // cycle guard: treat as end-of-path
        break;
      }

      if (step.type === "delay") {
        delayMs += delayMsOf(step.config);
        delayStepIds = [...delayStepIds, step.clientId];
        idx = nextIndexAfter(steps, indexOf, step, idx);
        continue;
      }

      if (step.type === "condition") {
        const v2 = new Set(visited);
        v2.add(step.clientId);
        const isFirstFork = handle === "main";

        const yesRaw = step.branches?.yes;
        const noRaw = step.branches?.no;
        const yesIdx = yesRaw === BRANCH_END ? steps.length : yesRaw ? (indexOf.get(yesRaw) ?? steps.length) : idx + 1;
        const noIdx = noRaw === BRANCH_END ? steps.length : noRaw ? (indexOf.get(noRaw) ?? steps.length) : idx + 1;

        walk(
          yesIdx, fromId,
          isFirstFork ? "yes" : handle,
          isFirstFork ? "Replied" : label,
          isFirstFork ? "green" : color,
          delayMs, delayStepIds, v2,
        );
        walk(
          noIdx, fromId,
          isFirstFork ? "no" : handle,
          isFirstFork ? "Not replied" : label,
          isFirstFork ? "red" : color,
          delayMs, delayStepIds, v2,
        );
        return;
      }

      pushActionNode(step);
      pushEdge(fromId, step.clientId, handle, label, color, delayMs, delayStepIds);

      const v2 = new Set(visited);
      v2.add(step.clientId);
      walk(nextIndexAfter(steps, indexOf, step, idx), step.clientId, "main", null, null, 0, [], v2);
      return;
    }

    pushAddNode(fromId, handle, label, color, delayMs, delayStepIds);
  }

  walk(0, null, "main", null, null, 0, [], new Set());

  return { nodes, edges };
}

// The condition (if any) whose fork produced a given node's "yes"/"no" dangling tip.
export function findForkCondition(steps, fromId) {
  const indexOf = new Map(steps.map((s, i) => [s.clientId, i]));
  const fromIdx = fromId == null ? -1 : (indexOf.get(fromId) ?? -1);
  let i = fromIdx === -1 ? 0 : nextIndexAfter(steps, indexOf, steps[fromIdx], fromIdx);

  while (i >= 0 && i < steps.length) {
    const s = steps[i];
    if (s.type === "delay") {
      i = nextIndexAfter(steps, indexOf, s, i);
      continue;
    }
    if (s.type === "condition") return s;
    return null;
  }
  return null;
}

function patchBranch(steps, conditionClientId, handle, targetClientId) {
  return steps.map((s) =>
    s.clientId === conditionClientId
      ? { ...s, branches: { ...s.branches, [handle]: targetClientId } }
      : s,
  );
}

function patchNext(steps, clientId, targetClientId) {
  return steps.map((s) => (s.clientId === clientId ? { ...s, next: targetClientId } : s));
}

// Appends a step at a dangling tip and repoints whatever precedes it (a condition
// branch, or the predecessor's `next`) — array position doesn't matter for correctness.
export function applyAddStep(steps, { fromId, handle }, rawNewStep) {
  const newStep = { ...rawNewStep, next: BRANCH_END };
  let next = [...steps, newStep];

  if (handle === "yes" || handle === "no") {
    const cond = findForkCondition(next, fromId);
    if (cond) next = patchBranch(next, cond.clientId, handle, newStep.clientId);
  } else if (fromId != null) {
    next = patchNext(next, fromId, newStep.clientId);
  }

  return next;
}

// Removes a step and repoints anything that referenced it to BRANCH_END, instead of
// leaving a dangling reference that would fall through to whatever's next in the array.
export function applyDeleteStep(steps, clientId) {
  return steps
    .filter((s) => s.clientId !== clientId)
    .map((s) => {
      let updated = s;
      if (s.type === "condition") {
        updated = {
          ...updated,
          branches: {
            yes: s.branches?.yes === clientId ? BRANCH_END : (s.branches?.yes ?? null),
            no: s.branches?.no === clientId ? BRANCH_END : (s.branches?.no ?? null),
          },
        };
      }
      if (s.next === clientId) {
        updated = { ...updated, next: BRANCH_END };
      }
      return updated;
    });
}

// Rewrites the delay on one edge, collapsing any existing delay steps into at most one.
// Amount 0 removes the hop entirely, wiring source straight to target.
export function applyDelayEdit(steps, edgeInfo, { amount, unit }) {
  const { sourceId, handle, targetKind, targetId, delayStepIds } = edgeInfo;
  let next = steps.filter((s) => !delayStepIds.includes(s.clientId));

  let head = targetKind === "action" ? targetId : BRANCH_END;

  if (amount > 0) {
    const delayStep = { clientId: newClientId(), type: "delay", config: { amount, unit }, branches: null, next: head };
    next = [...next, delayStep];
    head = delayStep.clientId;
  }

  if (handle === "yes" || handle === "no") {
    const cond = findForkCondition(next, sourceId);
    if (cond) next = patchBranch(next, cond.clientId, handle, head);
  } else {
    next = patchNext(next, sourceId, head);
  }

  return next;
}

const ROW_H = 168;
const COL_W = 280;

// Fallback layout for nodes without a saved position.
export function autoLayout(nodes, edges) {
  const children = new Map(nodes.map((n) => [n.id, []]));
  const hasIncoming = new Set();

  edges.forEach((e) => {
    children.get(e.source)?.push(e.target);
    hasIncoming.add(e.target);
  });

  const roots = nodes.filter((n) => !hasIncoming.has(n.id)).map((n) => n.id);

  const widthMemo = new Map();
  function leafWidth(id, visiting) {
    if (widthMemo.has(id)) return widthMemo.get(id);
    if (visiting.has(id)) return 1;
    const nextVisiting = new Set(visiting);
    nextVisiting.add(id);
    const kids = children.get(id) || [];
    const w = kids.length ? kids.reduce((sum, k) => sum + leafWidth(k, nextVisiting), 0) : 1;
    widthMemo.set(id, w);
    return w;
  }
  roots.forEach((r) => leafWidth(r, new Set()));

  const positions = new Map();
  function place(id, x, y, visiting) {
    if (positions.has(id) || visiting.has(id)) return;
    const nextVisiting = new Set(visiting);
    nextVisiting.add(id);
    positions.set(id, { x, y });

    const kids = children.get(id) || [];
    const totalW = leafWidth(id, new Set());
    let cursor = x - (totalW * COL_W) / 2;
    kids.forEach((k) => {
      const w = leafWidth(k, new Set());
      place(k, cursor + (w * COL_W) / 2, y + ROW_H, nextVisiting);
      cursor += w * COL_W;
    });
  }
  roots.forEach((r, i) => place(r, i * 420, 0, new Set()));

  return positions;
}
