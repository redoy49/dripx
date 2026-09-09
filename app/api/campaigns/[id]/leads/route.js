import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { serializeLead } from "@/app/api/leads/route";
import { enrollLeads } from "@/app/lib/campaignEnrollment";

// List leads enrolled in a campaign, joined with their lead profile + progress.
export async function GET(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const campaigns = await dbConnect("campaigns");
    const campaign = await campaigns.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });
    if (!campaign) return Response.json({ message: "Campaign not found" }, { status: 404 });

    const campaignLeads = await dbConnect("campaign_leads");
    const leads = await dbConnect("leads");

    const enrollments = await campaignLeads.find({ campaignId: campaign._id }).toArray();
    const leadDocs = await leads
      .find({ _id: { $in: enrollments.map((e) => e.leadId) } })
      .toArray();
    const leadById = new Map(leadDocs.map((l) => [l._id.toString(), l]));

    const items = enrollments.map((e) => ({
      leadId: e.leadId.toString(),
      status: e.status,
      currentStepId: e.currentStepId ? e.currentStepId.toString() : null,
      enrolledAt: e.enrolledAt,
      lastActionAt: e.lastActionAt,
      lead: leadById.has(e.leadId.toString())
        ? serializeLead(leadById.get(e.leadId.toString()))
        : null,
    }));

    return Response.json({ items });
  } catch (error) {
    console.error("Fetching campaign leads failed:", error);

    return Response.json({ message: "Failed to fetch campaign leads" }, { status: 500 });
  }
}

// Enroll existing leads (by id) into this campaign.
export async function POST(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const body = await req.json();
    const leadIds = Array.isArray(body.leadIds) ? body.leadIds : [];

    if (leadIds.length === 0) {
      return Response.json({ message: "leadIds is required" }, { status: 400 });
    }

    const campaigns = await dbConnect("campaigns");
    const campaign = await campaigns.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });
    if (!campaign) return Response.json({ message: "Campaign not found" }, { status: 404 });

    const result = await enrollLeads(id, leadIds);

    return Response.json(result);
  } catch (error) {
    console.error("Enrolling leads failed:", error);

    return Response.json({ message: "Failed to enroll leads" }, { status: 500 });
  }
}
