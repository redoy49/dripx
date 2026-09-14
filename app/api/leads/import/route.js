import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { serializeLead } from "@/app/api/leads/route";
import { parseCsv, mapCsvRowToLead } from "@/app/lib/csv";
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

async function insertLeads(workspaceId, rawLeads, source) {
  const leads = await dbConnect("leads");
  const enrichable = process.env.LINKEDIN_PROVIDER === "unipile" && rawLeads.length <= MAX_ENRICHED_ROWS;

  const candidates = rawLeads
    .map((raw) => ({
      linkedinUrl: (raw.linkedinUrl || "").trim(),
      email: (raw.email || "").trim().toLowerCase(),
      raw,
    }))
    .filter((c) => c.linkedinUrl || c.email || c.raw.firstName);

  // One query for existing matches instead of N sequential findOnes.
  const linkedinUrls = [...new Set(candidates.filter((c) => c.linkedinUrl).map((c) => c.linkedinUrl))];
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
  const existingByUrl = new Map(existingDocs.filter((d) => d.linkedinUrl).map((d) => [d.linkedinUrl, d]));
  const existingByEmail = new Map(existingDocs.filter((d) => d.email).map((d) => [d.email, d]));

  const inserted = [];
  const toInsert = [];

  for (const { linkedinUrl, email, raw } of candidates) {
    if (!linkedinUrl && !email) continue;

    const existing = (linkedinUrl && existingByUrl.get(linkedinUrl)) || (email && existingByEmail.get(email));
    if (existing) {
      inserted.push(existing);
      continue;
    }

    const doc = {
      workspaceId,
      firstName: raw.firstName || "",
      lastName: raw.lastName || "",
      headline: raw.headline || "",
      company: raw.company || "",
      jobTitle: raw.jobTitle || "",
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

    toInsert.push(doc);
  }

  if (toInsert.length > 0) {
    const result = await leads.insertMany(toInsert);
    toInsert.forEach((doc, i) => inserted.push({ ...doc, _id: result.insertedIds[i] }));
  }

  return inserted;
}

export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const workspaceId = new ObjectId(session.workspaceId);
    const contentType = req.headers.get("content-type") || "";
    let insertedLeads = [];
    let campaignId = null;

    if (contentType.includes("multipart/form-data")) {
      // CSV upload
      const form = await req.formData();
      const file = form.get("file");
      campaignId = form.get("campaignId") || null;

      if (!file || typeof file === "string") {
        return Response.json({ message: "CSV file is required" }, { status: 400 });
      }

      const text = await file.text();
      const rows = parseCsv(text);

      if (rows.length === 0) {
        return Response.json({ message: "CSV file has no data rows" }, { status: 400 });
      }

      const mapped = rows.map(mapCsvRowToLead);
      insertedLeads = await insertLeads(workspaceId, mapped, "csv_upload");
    } else {
      const body = await req.json();
      campaignId = body.campaignId || null;

      if (body.source === "paste_urls") {
        const urls = Array.isArray(body.urls) ? body.urls : [];
        const cleaned = urls.map((u) => u.trim()).filter(Boolean);

        if (cleaned.length === 0) {
          return Response.json({ message: "At least one LinkedIn URL is required" }, { status: 400 });
        }

        const mapped = cleaned.map((linkedinUrl) => ({ linkedinUrl }));
        insertedLeads = await insertLeads(workspaceId, mapped, "paste_urls");
      } else if (SCRAPE_SOURCES.includes(body.source)) {
        const connector = getLinkedInConnector();
        const profiles = await connector.fetchProfiles(body.source, {
          limit: body.limit || 10,
          query: body.query || "",
        });
        insertedLeads = await insertLeads(workspaceId, profiles, body.source);
      } else {
        return Response.json({ message: "Unknown or unsupported lead source" }, { status: 400 });
      }
    }

    let enrollment = null;
    if (campaignId && insertedLeads.length > 0) {
      enrollment = await enrollLeads(
        campaignId,
        insertedLeads.map((l) => l._id.toString()),
      );
    }

    return Response.json({
      imported: insertedLeads.length,
      leads: insertedLeads.map(serializeLead),
      enrollment,
    });
  } catch (error) {
    console.error("Importing leads failed:", error);

    return Response.json({ message: "Failed to import leads" }, { status: 500 });
  }
}
