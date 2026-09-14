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

// Maps common CSV header variants onto our lead schema.
const HEADER_ALIASES = {
  firstName: ["firstname", "first name", "first_name"],
  lastName: ["lastname", "last name", "last_name"],
  headline: ["headline", "title"],
  company: ["company", "company name", "organization"],
  jobTitle: ["jobtitle", "job title", "job_title", "position"],
  linkedinUrl: ["linkedinurl", "linkedin url", "linkedin_url", "profileurl", "profile url", "url"],
  email: ["email", "email address"],
};

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
