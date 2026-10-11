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

    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get("status");

    const query = { campaignId: campaign._id };
    if (filterStatus && filterStatus !== "all") {
      query.status = filterStatus;
    }

    const campaignLeads = await dbConnect("campaign_leads");
    const leads = await dbConnect("leads");
    const sequenceSteps = await dbConnect("sequence_steps");
    const conversations = await dbConnect("conversations");

    const enrollments = await campaignLeads.find(query).toArray();
    const enrolledLeadIds = enrollments.map((e) => e.leadId);

    const [leadDocs, stepDocs, convoDocs] = await Promise.all([
      enrolledLeadIds.length > 0
        ? leads.find({ _id: { $in: enrolledLeadIds } }).toArray()
        : [],
      sequenceSteps.find({ campaignId: campaign._id }).toArray(),
      enrolledLeadIds.length > 0
        ? conversations
            .find({ workspaceId: new ObjectId(session.workspaceId), leadId: { $in: enrolledLeadIds } })
            .toArray()
        : [],
    ]);

    const leadById = new Map(leadDocs.map((l) => [l._id.toString(), l]));
    const stepById = new Map(
      stepDocs.map((s) => [
        s._id.toString(),
        s.config?.subject
          ? `Step ${s.order}: ${s.config.subject.slice(0, 25)}`
          : `Step ${s.order}: ${s.type.replace("_", " ")}`,
      ]),
    );

    // Map lead to conversation (if lead has multiple, pick most recent)
    const convoByLeadId = new Map();
    for (const c of convoDocs) {
      if (c.leadId && !convoByLeadId.has(c.leadId.toString())) {
        convoByLeadId.set(c.leadId.toString(), c._id.toString());
      }
    }

    const items = enrollments.map((e) => {
      const stepTitle = e.currentStepId
        ? stepById.get(e.currentStepId.toString()) || "In Sequence"
        : e.status === "completed"
          ? "Sequence Completed"
          : e.status === "replied"
            ? "Replied (Sequence Paused)"
            : e.status === "paused"
              ? "Paused"
              : "Pending Start";

      return {
        leadId: e.leadId.toString(),
        status: e.status,
        currentStepId: e.currentStepId ? e.currentStepId.toString() : null,
        currentStepTitle: stepTitle,
        enrolledAt: e.enrolledAt,
        lastActionAt: e.lastActionAt,
        conversationId: convoByLeadId.get(e.leadId.toString()) || null,
        lead: leadById.has(e.leadId.toString())
          ? serializeLead(leadById.get(e.leadId.toString()))
          : null,
      };
    });

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
