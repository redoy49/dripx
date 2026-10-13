import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

function escapeCsvField(val) {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const campaignObjectId = new ObjectId(id);
    const workspaceObjectId = new ObjectId(session.workspaceId);

    const campaigns = await dbConnect("campaigns");
    const campaign = await campaigns.findOne({
      _id: campaignObjectId,
      workspaceId: workspaceObjectId,
    });
    if (!campaign) {
      return Response.json({ message: "Campaign not found" }, { status: 404 });
    }

    const campaignLeads = await dbConnect("campaign_leads");
    const leads = await dbConnect("leads");

    const enrollments = await campaignLeads.find({ campaignId: campaignObjectId }).toArray();
    const enrolledLeadIds = enrollments.map((e) => e.leadId);

    const leadDocs =
      enrolledLeadIds.length > 0
        ? await leads.find({ _id: { $in: enrolledLeadIds } }).toArray()
        : [];
    const leadMap = new Map(leadDocs.map((l) => [l._id.toString(), l]));

    const headers = [
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Company",
      "Job Title",
      "LinkedIn URL",
      "Campaign Status",
      "Enrolled At",
      "Last Action At",
    ];

    const rows = [headers.join(",")];

    for (const e of enrollments) {
      const lead = leadMap.get(e.leadId.toString()) || {};
      const row = [
        escapeCsvField(lead.firstName),
        escapeCsvField(lead.lastName),
        escapeCsvField(lead.email),
        escapeCsvField(lead.phone),
        escapeCsvField(lead.company),
        escapeCsvField(lead.jobTitle),
        escapeCsvField(lead.linkedinUrl),
        escapeCsvField(e.status),
        escapeCsvField(e.enrolledAt ? new Date(e.enrolledAt).toISOString() : ""),
        escapeCsvField(e.lastActionAt ? new Date(e.lastActionAt).toISOString() : ""),
      ];
      rows.push(row.join(","));
    }

    const csvContent = rows.join("\r\n");
    const safeName = (campaign.name || "campaign").replace(/[^a-zA-Z0-9_-]/g, "_");

    return new Response(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${safeName}_leads.csv"`,
      },
    });
  } catch (error) {
    console.error("Exporting campaign leads failed:", error);
    return Response.json({ message: "Failed to export leads" }, { status: 500 });
  }
}
