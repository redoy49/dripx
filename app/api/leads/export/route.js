import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

function escapeCsvCell(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatCsvRow(fields) {
  return fields.map(escapeCsvCell).join(",");
}

// Streams an RFC 4180 compliant CSV export of leads in the workspace matching active filters.
export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const workspaceObjectId = new ObjectId(session.workspaceId);
    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const tag = searchParams.get("tag");
    const source = searchParams.get("source");
    const campaignId = searchParams.get("campaignId");
    const status = searchParams.get("status");

    const campaignLeadsCol = await dbConnect("campaign_leads");
    const campaignsCol = await dbConnect("campaigns");
    const leadsCol = await dbConnect("leads");

    const query = { workspaceId: workspaceObjectId };

    if (search) {
      const re = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { firstName: re },
        { lastName: re },
        { company: re },
        { jobTitle: re },
        { email: re },
      ];
    }
    if (tag && tag !== "all") query.tags = tag;
    if (source && source !== "all") query.source = source;

    if (campaignId && campaignId !== "all") {
      if (campaignId === "unassigned") {
        const allEnrollments = await campaignLeadsCol.distinct("leadId");
        query._id = { $nin: allEnrollments };
      } else {
        const campaignLeadIds = await campaignLeadsCol.distinct("leadId", {
          campaignId: new ObjectId(campaignId),
        });
        query._id = { $in: campaignLeadIds };
      }
    }

    if (status && status !== "all") {
      const statusLeadIds = await campaignLeadsCol.distinct("leadId", { status });
      if (query._id) {
        const existingIn = query._id.$in || [];
        const existingSet = new Set(existingIn.map((id) => id.toString()));
        const intersected = statusLeadIds.filter((id) => existingSet.has(id.toString()));
        query._id = { $in: intersected };
      } else {
        query._id = { $in: statusLeadIds };
      }
    }

    const leads = await leadsCol.find(query).sort({ createdAt: -1 }).toArray();
    const leadIds = leads.map((l) => l._id);

    // Fetch campaigns
    const enrollments = leadIds.length > 0
      ? await campaignLeadsCol.find({ leadId: { $in: leadIds } }).toArray()
      : [];

    const campaignIds = [...new Set(enrollments.map((e) => e.campaignId))];
    const campaignDocs = campaignIds.length > 0
      ? await campaignsCol.find({ _id: { $in: campaignIds } }).project({ name: 1 }).toArray()
      : [];
    const campaignNameMap = new Map(campaignDocs.map((c) => [c._id.toString(), c.name]));

    const campaignsByLeadId = new Map();
    for (const e of enrollments) {
      const lId = e.leadId.toString();
      if (!campaignsByLeadId.has(lId)) campaignsByLeadId.set(lId, []);
      const cName = campaignNameMap.get(e.campaignId.toString());
      if (cName) campaignsByLeadId.get(lId).push(cName);
    }

    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company",
      "Job Title",
      "LinkedIn URL",
      "Tags",
      "Source",
      "Active Campaigns",
      "Created At",
    ];

    const rows = [formatCsvRow(headers)];

    for (const lead of leads) {
      const lId = lead._id.toString();
      const camps = campaignsByLeadId.get(lId) || [];
      const tags = Array.isArray(lead.tags) ? lead.tags.join("; ") : "";

      rows.push(
        formatCsvRow([
          lead.firstName || "",
          lead.lastName || "",
          lead.email || "",
          lead.phone || "",
          lead.company || "",
          lead.jobTitle || "",
          lead.linkedinUrl || "",
          tags,
          lead.source || "manual",
          camps.join("; "),
          lead.createdAt ? new Date(lead.createdAt).toISOString() : "",
        ]),
      );
    }

    const csvContent = rows.join("\r\n");

    return new Response(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="dripx-leads-export.csv"',
      },
    });
  } catch (error) {
    console.error("Exporting leads to CSV failed:", error);
    return Response.json({ message: "Failed to export leads" }, { status: 500 });
  }
}
