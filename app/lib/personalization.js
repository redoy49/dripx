// Personalization engine: substitutes {{variable}} / {{variable|Fallback text}} tokens in
// message templates against a lead's data. Used both by the sequence builder's live preview
// and by the job processor at send-time, so preview always matches what actually sends.

const VARIABLE_RE = /\{\{\s*([\w.]+)\s*(?:\|([^}]*))?\s*\}\}/g;

export const BUILT_IN_VARIABLES = [
  { key: "firstName", label: "First name" },
  { key: "lastName", label: "Last name" },
  { key: "fullName", label: "Full name" },
  { key: "company", label: "Company" },
  { key: "jobTitle", label: "Job title" },
];

const NAME_LIKE_DEFAULT_FALLBACK = "there";

function resolveVariable(key, lead) {
  if (key === "fullName") {
    return [lead.firstName, lead.lastName].filter(Boolean).join(" ");
  }
  if (["firstName", "lastName", "company", "jobTitle"].includes(key)) {
    return lead[key] || "";
  }
  return lead.customFields?.[key] ?? "";
}

// Renders a message template against a lead, substituting {{variable}} tokens.
// A missing/empty value falls back to the token's own |fallback text if present,
// otherwise "there" for name-like fields, otherwise an empty string.
export function renderTemplate(template, lead) {
  if (!template) return "";
  if (!lead) lead = {};

  return template.replace(VARIABLE_RE, (_match, key, fallback) => {
    const value = resolveVariable(key, lead);

    if (value) return value;
    if (fallback !== undefined) return fallback.trim();
    if (key === "firstName" || key === "fullName") return NAME_LIKE_DEFAULT_FALLBACK;

    return "";
  });
}

// A synthetic sample lead for previewing templates before any real lead is enrolled.
export const SAMPLE_LEAD = {
  firstName: "Alex",
  lastName: "Morgan",
  company: "Acme Inc",
  jobTitle: "VP of Marketing",
  customFields: {},
};
