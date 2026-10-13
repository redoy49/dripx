export const BRANCH_END = "__end__";

/**
 * Validates a flat array of sequence steps.
 * Categorizes findings into blocking errors and advisory warnings.
 */
export function validateSequence(steps = []) {
  const errorsByStep = new Map();
  const warningsByStep = new Map();
  const allErrors = [];
  const allWarnings = [];

  const addError = (stepId, message) => {
    if (!errorsByStep.has(stepId)) errorsByStep.set(stepId, []);
    errorsByStep.get(stepId).push(message);
    allErrors.push({ stepId, message });
  };

  const addWarning = (stepId, message) => {
    if (!warningsByStep.has(stepId)) warningsByStep.set(stepId, []);
    warningsByStep.get(stepId).push(message);
    allWarnings.push({ stepId, message });
  };

  const actionSteps = steps.filter((s) => s.type !== "delay" && s.type !== "condition");

  // Rule 1: Empty sequence validation
  if (steps.length === 0 || actionSteps.length === 0) {
    allErrors.push({
      stepId: null,
      message: "Sequence has no outreach actions. Add at least one action step.",
    });
  }

  // Rule 2: Per-step configuration validation
  steps.forEach((step, index) => {
    const id = step.clientId || step.id || `step_${index}`;
    const config = step.config || {};

    switch (step.type) {
      case "email":
      case "inmail": {
        const hasSubject = typeof config.subject === "string" && config.subject.trim().length > 0;
        const hasTemplate =
          typeof config.template === "string" && config.template.trim().length > 0;

        if (!hasSubject && !hasTemplate) {
          addError(id, "Subject line and message body are required");
        } else if (!hasSubject) {
          addError(id, "Subject line is required");
        } else if (!hasTemplate) {
          addError(id, "Message body is required");
        }
        break;
      }

      case "message":
      case "follow_up": {
        const hasTemplate =
          typeof config.template === "string" && config.template.trim().length > 0;

        if (!hasTemplate) {
          addError(id, "Message body is required");
        }
        break;
      }

      case "connection_request": {
        const note = typeof config.note === "string" ? config.note : "";
        if (note.length > 300) {
          addError(id, `Connection note exceeds LinkedIn limit (${note.length}/300 chars)`);
        }
        break;
      }

      case "delay": {
        const amount = Number(config.amount);
        if (isNaN(amount) || amount < 0) {
          addError(id, "Delay amount cannot be negative");
        } else if (amount === 0) {
          addWarning(id, "Delay is set to 0. Steps will execute immediately");
        }
        break;
      }

      case "condition": {
        const yesTarget = step.branches?.yes;
        const noTarget = step.branches?.no;

        if (yesTarget === BRANCH_END && noTarget === BRANCH_END) {
          addWarning(id, "Both condition paths terminate immediately");
        }
        break;
      }

      case "profile_visit":
      case "like_post":
        // Automatic actions, no mandatory text template needed
        break;

      default:
        break;
    }
  });

  return {
    isValid: allErrors.length === 0,
    errorsByStep,
    warningsByStep,
    allErrors,
    allWarnings,
    errorCount: allErrors.length,
    warningCount: allWarnings.length,
    actionStepCount: actionSteps.length,
    stepCount: steps.length,
  };
}

/**
 * Returns a concise status object for a given step ID.
 */
export function getStepValidationStatus(validationResult, stepId) {
  if (!validationResult) {
    return { hasError: false, errorText: "", hasWarning: false, warningText: "" };
  }

  const stepErrors = validationResult.errorsByStep.get(stepId) || [];
  const stepWarnings = validationResult.warningsByStep.get(stepId) || [];

  return {
    hasError: stepErrors.length > 0,
    errorText: stepErrors[0] || "",
    hasWarning: stepWarnings.length > 0,
    warningText: stepWarnings[0] || "",
  };
}
