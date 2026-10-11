import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { serializeLead } from "@/app/api/leads/route";
import {
  parseCsv,
  mapCsvRowToLead,
  mapRowWithCustomMapping,
  validateLeadRecord,
} from "@/app/lib/csv";
import { getLinkedInConnector } from "@/app/lib/connectors";
import { previewLinkedInProfile } from "@/app/lib/connectors/UnipileConnector";
import { enrollLeads } from "@/app/lib/campaignEnrollment";

// Looking up every row would be slow and could hit Unipile's rate limits on a large
// CSV — cap it to a size where a synchronous per-row lookup during import stays fast.
const MAX_ENRICHED_ROWS = 20;

const SCRAPE_SOURCES = [
  "basic_search",
  "sales_navigator",
  "recruiter_search",
  "event_members",
  "group_members",
  "my_network",
];

async function insertLeads(workspaceId, validLeads, source, duplicateStrategy = "skip") {
  const leads = await dbConnect("leads");
  const enrichable =
    process.env.LINKEDIN_PROVIDER === "unipile" && validLeads.length <= MAX_ENRICHED_ROWS;

  const candidates = validLeads
    .map((raw) => ({
      linkedinUrl: (raw.linkedinUrl || "").trim(),
      email: (raw.email || "").trim().toLowerCase(),
      raw,
    }))
    .filter((c) => c.linkedinUrl || c.email || c.raw.firstName);

  // One query for existing matches in this workspace instead of N sequential findOnes.
  const linkedinUrls = [
    ...new Set(candidates.filter((c) => c.linkedinUrl).map((c) => c.linkedinUrl)),
  ];
  const emails = [...new Set(candidates.filter((c) => c.email).map((c) => c.email))];

  const existingDocs =
    linkedinUrls.length || emails.length
      ? await leads
          .find({
            workspaceId,
            $or: [
              ...(linkedinUrls.length ? [{ linkedinUrl: { $in: linkedinUrls } }] : []),
              ...(emails.length ? [{ email: { $in: emails } }] : []),
            ],
          })
          .toArray()
      : [];

  const existingByUrl = new Map(
    existingDocs.filter((d) => d.linkedinUrl).map((d) => [d.linkedinUrl, d]),
  );
  const existingByEmail = new Map(
    existingDocs.filter((d) => d.email).map((d) => [d.email.toLowerCase(), d]),
  );

  const allLeads = [];
  const toInsert = [];
  let newCount = 0;
  let updatedCount = 0;
  let duplicateCount = 0;
  let skippedCount = 0;

  for (const { linkedinUrl, email, raw } of candidates) {
    if (!linkedinUrl && !email) continue;

    const existing =
      (linkedinUrl && existingByUrl.get(linkedinUrl)) ||
      (email && existingByEmail.get(email));

    if (existing) {
      duplicateCount++;

      if (duplicateStrategy === "update") {
        const updateFields = {};
        const stringFields = [
          "firstName",
          "lastName",
          "headline",
          "company",
          "jobTitle",
          "phone",
          "industry",
          "website",
          "icebreaker",
        ];

        for (const f of stringFields) {
          if (raw[f] && raw[f].trim() && (!existing[f] || existing[f] !== raw[f].trim())) {
            updateFields[f] = raw[f].trim();
          }
        }

        if (raw.customFields && typeof raw.customFields === "object") {
          for (const [k, v] of Object.entries(raw.customFields)) {
            if (v && typeof v === "string" && v.trim()) {
              updateFields[`customFields.${k}`] = v.trim();
            }
          }
        }

        if (Object.keys(updateFields).length > 0) {
          updateFields.updatedAt = new Date();
          await leads.updateOne({ _id: existing._id }, { $set: updateFields });
          Object.assign(existing, updateFields);
          updatedCount++;
        } else {
          skippedCount++;
        }
      } else {
        skippedCount++;
      }

      allLeads.push(existing);
      continue;
    }

    const doc = {
      workspaceId,
      firstName: raw.firstName || "",
      lastName: raw.lastName || "",
      headline: raw.headline || "",
      company: raw.company || "",
      jobTitle: raw.jobTitle || "",
      phone: raw.phone || "",
      industry: raw.industry || "",
      website: raw.website || "",
      icebreaker: raw.icebreaker || "",
      linkedinUrl,
      email,
      customFields: raw.customFields || {},
      tags: [],
      source,
      createdAt: new Date(),
    };

    if (enrichable && linkedinUrl && !doc.firstName) {
      const preview = await previewLinkedInProfile(workspaceId, linkedinUrl);
      if (preview) {
        doc.firstName = preview.firstName || doc.firstName;
        doc.lastName = preview.lastName || doc.lastName;
        doc.headline = preview.headline || doc.headline;
        if (preview.providerId) doc.unipile = { providerId: preview.providerId };
      }
    }

    // Register into existing maps so duplicate rows in the same batch don't insert twice
    if (linkedinUrl) existingByUrl.set(linkedinUrl, doc);
    if (email) existingByEmail.set(email, doc);

    toInsert.push(doc);
  }

  if (toInsert.length > 0) {
    const result = await leads.insertMany(toInsert);
    toInsert.forEach((doc, i) => {
      const insertedDoc = { ...doc, _id: result.insertedIds[i] };
      allLeads.push(insertedDoc);
      newCount++;
    });
  }

  return {
    allLeads,
    newCount,
    duplicateCount,
    updatedCount,
    skippedCount,
  };
}

export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const workspaceId = new ObjectId(session.workspaceId);
    const contentType = req.headers.get("content-type") || "";
    let campaignId = null;
    let duplicateStrategy = "skip";
    let validLeads = [];
    const invalidErrors = [];
    let totalRows = 0;
    let source = "csv_upload";

    if (contentType.includes("multipart/form-data")) {
      // CSV upload with optional column mapping & duplicate strategy
      const form = await req.formData();
      const file = form.get("file");
      campaignId = form.get("campaignId") || null;
      duplicateStrategy = form.get("duplicateStrategy") || "skip";
      const mappingRaw = form.get("mapping");

      let mapping = null;
      if (mappingRaw && typeof mappingRaw === "string") {
        try {
          mapping = JSON.parse(mappingRaw);
        } catch {
          mapping = null;
        }
      }

      if (!file || typeof file === "string") {
        return Response.json({ message: "CSV file is required" }, { status: 400 });
      }

      const text = await file.text();
      const rows = parseCsv(text);
      totalRows = rows.length;

      if (rows.length === 0) {
        return Response.json({ message: "CSV file has no data rows" }, { status: 400 });
      }

      const mappedRows = rows.map((row) =>
        mapping ? mapRowWithCustomMapping(row, mapping) : mapCsvRowToLead(row),
      );

      mappedRows.forEach((lead, idx) => {
        const validation = validateLeadRecord(lead);
        if (validation.valid) {
          validLeads.push(lead);
        } else {
          invalidErrors.push({
            rowNumber: idx + 2, // Header is row 1
            lead,
            errors: validation.errors,
          });
        }
      });

      source = "csv_upload";
    } else {
      const body = await req.json();
      campaignId = body.campaignId || null;
      duplicateStrategy = body.duplicateStrategy || "skip";
      source = body.source;

      if (body.source === "paste_urls") {
        const urls = Array.isArray(body.urls) ? body.urls : [];
        const cleaned = urls.map((u) => u.trim()).filter(Boolean);
        totalRows = cleaned.length;

        if (cleaned.length === 0) {
          return Response.json(
            { message: "At least one LinkedIn URL is required" },
            { status: 400 },
          );
        }

        cleaned.forEach((linkedinUrl, idx) => {
          const lead = { linkedinUrl };
          const validation = validateLeadRecord(lead);
          if (validation.valid) {
            validLeads.push(lead);
          } else {
            invalidErrors.push({
              rowNumber: idx + 1,
              lead,
              errors: validation.errors,
            });
          }
        });
      } else if (SCRAPE_SOURCES.includes(body.source)) {
        const connector = getLinkedInConnector();
        const profiles = await connector.fetchProfiles(body.source, {
          limit: body.limit || 10,
          query: body.query || "",
        });
        totalRows = profiles.length;
        validLeads = profiles;
      } else {
        return Response.json({ message: "Unknown or unsupported lead source" }, { status: 400 });
      }
    }

    if (validLeads.length === 0) {
      return Response.json(
        {
          success: false,
          message: "No valid leads found in data. Please check required fields and formatting.",
          imported: 0,
          total: totalRows,
          summary: {
            total: totalRows,
            newCount: 0,
            duplicateCount: 0,
            updatedCount: 0,
            skippedCount: 0,
            invalidCount: invalidErrors.length,
            invalidErrors,
          },
          leads: [],
        },
        { status: 400 },
      );
    }

    const { allLeads, newCount, duplicateCount, updatedCount, skippedCount } =
      await insertLeads(workspaceId, validLeads, source, duplicateStrategy);

    let enrollment = null;
    if (campaignId && allLeads.length > 0) {
      enrollment = await enrollLeads(
        campaignId,
        allLeads.map((l) => l._id.toString()),
      );
    }

    return Response.json({
      success: true,
      imported: allLeads.length,
      total: totalRows,
      summary: {
        total: totalRows,
        newCount,
        duplicateCount,
        updatedCount,
        skippedCount,
        invalidCount: invalidErrors.length,
        invalidErrors,
      },
      leads: allLeads.map(serializeLead),
      enrollment,
    });
  } catch (error) {
    console.error("Importing leads failed:", error);

    return Response.json({ message: "Failed to import leads" }, { status: 500 });
  }
}

