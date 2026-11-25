import { ToolLoopAgent, isStepCount } from "ai";
import { createReadTools } from "./readTools";
import { createDraftTools } from "./draftTools";
import { createGuardedTools } from "./guardedTools";

const SYSTEM_BASE = `You are DripX AI, an expert multi-channel cold outreach strategist and automation operator embedded inside DripX.
You help users analyze metrics, design high-converting Email & LinkedIn sequences, manage leads, and reply in the Unified Inbox.

Key rules:
- Be concise, practical, and data-driven. Format answers cleanly with Markdown tables or bullet lists.
- Never invent campaign IDs, lead emails, or analytics numbers—always inspect real workspace data with your tools first.
- When building sequences, follow best practices: short subject lines, clear personalization variables like {{firstName}} and {{company}}, staggered delays, and email_followup for threaded replies.
- Always surface direct DripX dashboard links when you create or inspect a campaign (e.g. [Open in Flow Builder](/dashboard/new-campaign?id=...)).
- When a tool approval request is denied by the user, accept the decision gracefully and do not re-trigger the denied tool automatically.`;

function buildModeInstructions(mode, hydratedContext) {
  const modeNote =
    mode === "ask"
      ? "Mode: ASK (Fast direct assistant — answer concisely without modifying workspace data)."
      : mode === "plan"
      ? "Mode: PLAN (Read-only strategist — inspect workspace data and propose a detailed plan without executing writes)."
      : "Mode: BUILD (Full DripX Agent — inspect data, create draft campaigns/sequences, enroll leads into drafts, and request user approval before activating campaigns, sending live replies, or deleting records).";

  const ctxSection = hydratedContext
    ? `\n\nAttached Workspace Context (@mentions):\n${hydratedContext}`
    : "";

  return `${SYSTEM_BASE}\n\n${modeNote}${ctxSection}`;
}

export function createDripXAgent({
  resolvedModel,
  workspaceId,
  userId,
  mode = "build",
  hydratedContext = "",
}) {
  const readTools = createReadTools(workspaceId);
  const draftTools = createDraftTools(workspaceId, userId);
  const guardedTools = createGuardedTools(workspaceId, userId);

  let tools = {};
  if (resolvedModel.config.supportsTools) {
    if (mode === "plan") {
      tools = readTools;
    } else if (mode === "build") {
      tools = { ...readTools, ...draftTools, ...guardedTools };
    }
  }

  return new ToolLoopAgent({
    model: resolvedModel.model,
    instructions: buildModeInstructions(mode, hydratedContext),
    tools,
    stopWhen: isStepCount(12),
    ...(resolvedModel.reasoning ? { reasoning: resolvedModel.reasoning } : {}),
    ...(resolvedModel.providerOptions ? { providerOptions: resolvedModel.providerOptions } : {}),
    ...(mode === "build" && resolvedModel.config.supportsTools
      ? {
          toolApproval: {
            activateCampaign: "user-approval",
            updateCampaignStatus: "user-approval",
            sendInboxReply: "user-approval",
            deleteCampaign: "user-approval",
          },
          ...(process.env.JWT_SECRET
            ? { experimental_toolApprovalSecret: process.env.JWT_SECRET }
            : {}),
        }
      : {}),
  });
}
