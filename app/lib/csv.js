// Minimal dependency-free CSV parser: handles quoted fields (with escaped "" quotes)
// and commas/newlines inside quotes. Returns an array of row objects keyed by header.
export function parseCsv(text) {
  // Strip a leading UTF-8 BOM (common in CSVs exported from Excel on Windows) — left in
  // place, it silently attaches to the first header, so that column never matches any
  // known field and its data gets dropped from every row.
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);

  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  const pushField = () => {
    row.push(field);
    field = "";
  };
  const pushRow = () => {
    pushField();
    rows.push(row);
    row = [];
  };

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      pushField();
    } else if (char === "\n") {
      pushRow();
    } else if (char === "\r") {
      // skip, \n handles the row break
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) pushRow();

  const [header, ...body] = rows.filter((r) => r.some((cell) => cell.trim() !== ""));
  if (!header) return [];

  const keys = header.map((h) => h.trim());

  return body.map((cells) => {
    const obj = {};
    keys.forEach((key, i) => {
      obj[key] = (cells[i] || "").trim();
    });
    return obj;
  });
}

// Supported target lead fields with human-readable labels
export const SUPPORTED_LEAD_FIELDS = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "email", label: "Email Address" },
  { key: "linkedinUrl", label: "LinkedIn Profile URL" },
  { key: "company", label: "Company / Organization" },
  { key: "jobTitle", label: "Job Title / Position" },
  { key: "phone", label: "Phone Number" },
  { key: "industry", label: "Industry" },
  { key: "website", label: "Company Website" },
  { key: "icebreaker", label: "Icebreaker / Intro" },
];

// Maps common CSV header variants onto our lead schema.
export const HEADER_ALIASES = {
  firstName: ["firstname", "first name", "first_name", "given name", "fname", "first"],
  lastName: ["lastname", "last name", "last_name", "surname", "family name", "lname", "last"],
  headline: ["headline", "linkedin headline"],
  company: ["company", "company name", "company_name", "organization", "organisation", "employer", "account"],
  jobTitle: ["jobtitle", "job title", "job_title", "position", "role", "designation", "title", "occupation"],
  linkedinUrl: [
    "linkedinurl",
    "linkedin url",
    "linkedin_url",
    "linkedin profile",
    "linkedin profile url",
    "linkedin_profile",
    "profileurl",
    "profile url",
    "profile_url",
    "profile",
    "linkedin link",
    "linkedin",
  ],
  email: ["email", "email address", "work email", "contact email", "primary email", "e-mail", "e-mail address"],
  phone: [
    "phone",
    "phone number",
    "phone_number",
    "work phone",
    "work_phone",
    "mobile phone",
    "mobile_phone",
    "telephone",
    "mobile",
    "cell",
    "contact number",
  ],
  industry: ["industry", "sector", "business sector"],
  website: ["website", "company website", "company_website", "domain", "company domain", "company url"],
  icebreaker: ["icebreaker", "ice_breaker", "custom_intro", "intro", "personalization", "custom note", "notes"],
};

/**
 * Automatically suggests a mapping from CSV header names to target lead fields based on aliases.
 * Returns an object: { [csvHeader]: targetFieldKey | "custom" }
 */
export function detectColumnMapping(headers) {
  const mapping = {};
  const usedFields = new Set();

  for (const header of headers) {
    const normalized = header.trim().toLowerCase();
    let matchedField = null;

    for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
      if (!usedFields.has(field) && aliases.includes(normalized)) {
        matchedField = field;
        break;
      }
    }

    if (matchedField) {
      mapping[header] = matchedField;
      usedFields.add(matchedField);
    } else {
      mapping[header] = "custom";
    }
  }

  return mapping;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LINKEDIN_PROFILE_RE = /linkedin\.com\/in\/[^/?#]+/i;

/**
 * Validates a lead record for outreach readiness.
 * Returns { valid: boolean, errors: string[] }
 */
export function validateLeadRecord(lead) {
  const errors = [];
  const linkedinUrl = (lead.linkedinUrl || "").trim();
  const email = (lead.email || "").trim();

  // Must have at least one identifier
  if (!linkedinUrl && !email) {
    errors.push("Missing both email and LinkedIn profile URL");
  }

  // Validate email format if provided
  if (email && !EMAIL_RE.test(email)) {
    errors.push(`Invalid email format: "${email}"`);
  }

  // Validate LinkedIn URL if provided
  if (linkedinUrl && !linkedinUrl.toLowerCase().includes("linkedin.com")) {
    errors.push(`Not a valid LinkedIn URL: "${linkedinUrl}"`);
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Maps a single CSV row object using a user-specified column mapping.
 * @param {Object} row - Key-value pair from CSV
 * @param {Object} mapping - { [csvHeader]: targetFieldKey | "custom" | "skip" }
 */
export function mapRowWithCustomMapping(row, mapping) {
  const lead = { customFields: {} };

  for (const [header, val] of Object.entries(row)) {
    const value = (val || "").trim();
    if (!value) continue;

    const target = mapping?.[header];

    if (!target || target === "custom") {
      lead.customFields[header] = value;
    } else if (target === "skip") {
      // Explicitly skipped by user, do not store
      continue;
    } else {
      lead[target] = value;
    }
  }

  return lead;
}

export function mapCsvRowToLead(row) {
  const lead = { customFields: {} };
  const usedKeys = new Set();

  for (const [field, aliases] of Object.entries(HEADER_ALIASES)) {
    const matchKey = Object.keys(row).find((k) => aliases.includes(k.toLowerCase()));
    if (matchKey) {
      lead[field] = row[matchKey];
      usedKeys.add(matchKey);
    }
  }

  // Anything left over becomes a custom field, keeping the import lossless.
  for (const [key, value] of Object.entries(row)) {
    if (!usedKeys.has(key) && value) {
      lead.customFields[key] = value;
    }
  }

  return lead;
}
