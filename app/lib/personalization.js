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
  { key: "email", label: "Email" },
  { key: "phone", label: "Phone" },
  { key: "industry", label: "Industry" },
  { key: "website", label: "Website" },
  { key: "icebreaker", label: "Icebreaker" },
];

const NAME_LIKE_DEFAULT_FALLBACK = "there";

function resolveVariable(key, lead) {
  if (!lead) return "";

  if (key === "fullName") {
    return [lead.firstName, lead.lastName].filter(Boolean).join(" ");
  }

  const directKeys = [
    "firstName",
    "lastName",
    "company",
    "jobTitle",
    "email",
    "phone",
    "industry",
    "website",
    "icebreaker",
  ];

  if (directKeys.includes(key) && lead[key] !== undefined && lead[key] !== null) {
    const val = String(lead[key]).trim();
    if (val) return val;
  }

  // Check customFields directly, or stripped of "customFields." prefix
  const custom = lead.customFields;
  if (custom && typeof custom === "object") {
    if (custom[key] !== undefined && custom[key] !== null) {
      const val = String(custom[key]).trim();
      if (val) return val;
    }
    const strippedKey = key.replace(/^customFields\./, "");
    if (custom[strippedKey] !== undefined && custom[strippedKey] !== null) {
      const val = String(custom[strippedKey]).trim();
      if (val) return val;
    }
  }

  // Fallback to any direct property on lead object
  if (lead[key] !== undefined && lead[key] !== null) {
    const val = String(lead[key]).trim();
    if (val) return val;
  }

  return "";
}

// Renders a message template against a lead, substituting {{variable}} tokens.
// A missing/empty value falls back to the token's own |fallback text if present,
// otherwise "there" for name-like fields, otherwise an empty string.
export function renderTemplate(template, lead) {
  if (!template) return "";
  if (!lead) lead = {};

  return template.replace(VARIABLE_RE, (_match, key, fallback) => {
    const value = resolveVariable(key.trim(), lead);

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
  jobTitle: "VP of Growth",
  email: "alex.morgan@acme.com",
  phone: "+1 (555) 234-5678",
  industry: "B2B SaaS",
  website: "https://acme.com",
  customFields: {
    icebreaker: "Loved your recent article on customer retention!",
  },
};
