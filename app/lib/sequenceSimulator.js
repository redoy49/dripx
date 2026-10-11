/**
 * Sequence Simulator Engine for DripX
 * Pure, zero-mutation sequence execution dry-run and validation engine.
 * Never calls external APIs, never writes to activity_logs, never mutates jobs or analytics.
 */

import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { renderTemplate } from "@/app/lib/personalization";
import { resolveFirstExecutableStep, resolveStepAfter, STEP_TYPES } from "@/app/lib/sequenceEngine";

function formatDelay(delayMs) {
  if (!delayMs || delayMs <= 0) return "Immediate (0m)";
  const minutes = Math.round(delayMs / (60 * 1000));
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.round(hours / 24);
  return `${days}d`;
}

function extractMissingVariables(text, lead) {
  if (!text) return [];
  const matches = text.match(/\{\{([a-zA-Z0-9_]+)\}\}/g) || [];
  const missing = [];
  for (const m of matches) {
    const key = m.replace(/[{}]/g, "").trim();
    if (!lead[key] && !lead[key.toLowerCase()]) {
      missing.push(m);
    }
  }
  return [...new Set(missing)];
}

/**
 * Simulates a single lead's journey through a campaign sequence.
 * Safe dry-run: strictly read-only.
 */
export async function simulateLeadJourney(campaignId, leadId, options = {}) {
  const campaignsCol = await dbConnect("campaigns");
  const sequenceStepsCol = await dbConnect("sequence_steps");
  const leadsCol = await dbConnect("leads");
  const emailAccountsCol = await dbConnect("email_accounts");

  const [campaign, steps, lead] = await Promise.all([
    campaignsCol.findOne({ _id: new ObjectId(campaignId) }),
    sequenceStepsCol.find({ campaignId: new ObjectId(campaignId) }).sort({ order: 1 }).toArray(),
    leadsCol.findOne({ _id: new ObjectId(leadId) }),
  ]);

  if (!campaign) throw new Error("Campaign not found");
  if (!lead) throw new Error("Lead not found");
  if (!steps || steps.length === 0) throw new Error("Campaign sequence has no configured steps");

  let senderAccount = null;
  if (campaign.senderEmailAccountId) {
    senderAccount = await emailAccountsCol.findOne({ _id: new ObjectId(campaign.senderEmailAccountId) });
  }

  const timeline = [];
  const allWarnings = [];
  let cumulativeDelayMs = 0;

  // Predicate for simulating condition steps
  const evaluateCondition = async (conditionStep) => {
    if (typeof options.simulateReplied === "boolean") {
      return options.simulateReplied;
    }
    // Default condition evaluation in simulation: check if lead has any inbound conversations
    const conversations = await dbConnect("conversations");
    const messages = await dbConnect("messages");
    const convos = await conversations.find({ leadId: lead._id }).project({ _id: 1 }).toArray();
    if (convos.length === 0) return false;
    const count = await messages.countDocuments({
      conversationId: { $in: convos.map((c) => c._id) },
      direction: "inbound",
    });
    return count > 0;
  };

  // Find first executable step
  let current = await resolveFirstExecutableStep(steps, evaluateCondition);
  let stepIndex = 1;
  let guard = 0;

  while (current.nextStep && guard++ < steps.length + 5) {
    const step = current.nextStep;
    cumulativeDelayMs += current.delayMs || 0;

    const stepWarnings = [];
    let renderedSubject = null;
    let renderedBody = null;
    const channel = STEP_TYPES[step.type]?.channel || "general";

    // Validate and render based on step type
    if (step.type === "email") {
      if (!lead.email) {
        stepWarnings.push("Lead does not have an email address");
      }
      if (!senderAccount && !process.env.RESEND_API_KEY) {
        stepWarnings.push("No email sender account connected to send emails");
      }

      renderedSubject = renderTemplate(step.config?.subject || "", lead);
      renderedBody = renderTemplate(step.config?.template || "", lead);

      const missingSub = extractMissingVariables(step.config?.subject, lead);
      const missingBody = extractMissingVariables(step.config?.template, lead);
      if (missingSub.length > 0) {
        stepWarnings.push(`Subject contains unpopulated variables: ${missingSub.join(", ")}`);
      }
      if (missingBody.length > 0) {
        stepWarnings.push(`Body contains unpopulated variables: ${missingBody.join(", ")}`);
      }
    } else if (step.type === "connection_request") {
      if (step.config?.note) {
        renderedBody = renderTemplate(step.config.note, lead);
        if (renderedBody.length > 300) {
          stepWarnings.push(`LinkedIn note exceeds 300 characters (${renderedBody.length} chars)`);
        }
        const missing = extractMissingVariables(step.config.note, lead);
        if (missing.length > 0) {
          stepWarnings.push(`Note contains unpopulated variables: ${missing.join(", ")}`);
        }
      }
    } else if (step.type === "message" || step.type === "follow_up" || step.type === "inmail") {
      if (step.config?.subject) {
        renderedSubject = renderTemplate(step.config.subject, lead);
      }
      renderedBody = renderTemplate(step.config?.template || "", lead);
      const missing = extractMissingVariables(step.config?.template, lead);
      if (missing.length > 0) {
        stepWarnings.push(`Message template contains unpopulated variables: ${missing.join(", ")}`);
      }
    }

    if (stepWarnings.length > 0) {
      allWarnings.push(...stepWarnings.map((w) => `[Step ${step.order || stepIndex}] ${w}`));
    }

    timeline.push({
      stepIndex,
      stepId: step._id.toString(),
      order: step.order || stepIndex,
      type: step.type,
      channel,
      title: step.config?.subject ? `Step ${step.order}: ${step.config.subject.slice(0, 30)}` : `Step ${step.order}: ${step.type.replace("_", " ")}`,
      renderedSubject,
      renderedBody,
      delayBefore: formatDelay(current.delayMs),
      estimatedRunAfter: new Date(Date.now() + cumulativeDelayMs).toISOString(),
      warnings: stepWarnings,
      status: stepWarnings.length === 0 ? "VALID" : "WARNING",
    });

    stepIndex++;

    // Resolve next step in sequence
    current = await resolveStepAfter(steps, step, evaluateCondition);
  }

  const leadName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.email;

  return {
    isSimulation: true,
    campaign: {
      id: campaign._id.toString(),
      name: campaign.name,
      status: campaign.status,
      senderEmail: senderAccount?.email || "Platform Default",
    },
    lead: {
      id: lead._id.toString(),
      name: leadName,
      email: lead.email || null,
      company: lead.company || null,
      jobTitle: lead.jobTitle || lead.headline || null,
    },
    totalSteps: timeline.length,
    estimatedTotalDuration: formatDelay(cumulativeDelayMs),
    warnings: allWarnings,
    timeline,
  };
}
