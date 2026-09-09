import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { serializeLead } from "@/app/api/leads/route";
import { parseCsv, mapCsvRowToLead } from "@/app/lib/csv";
import { getLinkedInConnector } from "@/app/lib/connectors";
import { enrollLeads } from "@/app/lib/campaignEnrollment";

const SCRAPE_SOURCES = [
  "basic_search",
  "sales_navigator",
  "recruiter_search",
  "event_members",
  "group_members",
  "my_network",
];

// Inserts leads for a workspace, skipping ones that already exist by linkedinUrl or email.
async function insertLeads(workspaceId, rawLeads, source) {
  const leads = await dbConnect("leads");
  const inserted = [];

  for (const raw of rawLeads) {
    const linkedinUrl = (raw.linkedinUrl || "").trim();
    const email = (raw.email || "").trim().toLowerCase();

    if (!linkedinUrl && !email && !raw.firstName) continue;

    const dedupeQuery = { workspaceId };
    if (linkedinUrl) dedupeQuery.linkedinUrl = linkedinUrl;
    else if (email) dedupeQuery.email = email;
    else continue;

    const existing = linkedinUrl || email ? await leads.findOne(dedupeQuery) : null;

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
    const result = await leads.insertOne(doc);
    inserted.push({ ...doc, _id: result.insertedId });
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
