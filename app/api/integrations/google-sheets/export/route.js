import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { exportLeadsToGoogleSheet } from "@/app/lib/integrations/googleSheets";

export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const body = await req.json();
    const leadsCol = await dbConnect("leads");

    const query = { workspaceId: new ObjectId(session.workspaceId) };
    if (body.campaignId) {
      const campaignLeads = await dbConnect("campaign_leads");
      const enrollments = await campaignLeads
        .find({ campaignId: new ObjectId(body.campaignId) })
        .project({ leadId: 1 })
        .toArray();
      query._id = { $in: enrollments.map((e) => e.leadId) };
    }

    const leads = await leadsCol.find(query).limit(1000).toArray();
    const result = await exportLeadsToGoogleSheet(session.workspaceId, leads);

    if (result.skipped) {
      return Response.json({ message: result.message }, { status: 501 });
    }
    if (!result.success) {
      return Response.json({ message: result.error || "Export failed" }, { status: 500 });
    }

    return Response.json(result);
  } catch (error) {
    console.error("Google Sheets export failed:", error);

    return Response.json({ message: "Failed to export to Google Sheets" }, { status: 500 });
  }
}
