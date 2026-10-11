import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { serializeLead } from "@/app/api/leads/route";

const EDITABLE_FIELDS = [
  "firstName",
  "lastName",
  "headline",
  "company",
  "jobTitle",
  "linkedinUrl",
  "email",
  "customFields",
  "tags",
  "source",
];

export async function GET(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const leads = await dbConnect("leads");
    const lead = await leads.findOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });

    if (!lead) return Response.json({ message: "Lead not found" }, { status: 404 });

    const campaignLeads = await dbConnect("campaign_leads");
    const campaignsCol = await dbConnect("campaigns");
    const sequenceStepsCol = await dbConnect("sequence_steps");
    const conversationsCol = await dbConnect("conversations");

    const [enrollments, conversation] = await Promise.all([
      campaignLeads.find({ leadId: lead._id }).toArray(),
      conversationsCol.findOne({
        workspaceId: new ObjectId(session.workspaceId),
        leadId: lead._id,
      }),
    ]);

    const campaignIds = enrollments.map((e) => e.campaignId);
    const stepIds = enrollments.map((e) => e.currentStepId).filter(Boolean);

    const [campaignDocs, stepDocs] = await Promise.all([
      campaignIds.length > 0
        ? campaignsCol.find({ _id: { $in: campaignIds } }).project({ name: 1, status: 1 }).toArray()
        : [],
      stepIds.length > 0
        ? sequenceStepsCol.find({ _id: { $in: stepIds } }).project({ order: 1, type: 1, config: 1 }).toArray()
        : [],
    ]);

    const campaignMap = new Map(campaignDocs.map((c) => [c._id.toString(), c]));
    const stepMap = new Map(stepDocs.map((s) => [s._id.toString(), s]));

    const uniqueCampaignsMap = new Map();
    for (const e of enrollments) {
      const campIdStr = e.campaignId.toString();
      if (uniqueCampaignsMap.has(campIdStr)) {
        const existing = uniqueCampaignsMap.get(campIdStr);
        if (existing.enrollmentStatus === "replied" || existing.enrollmentStatus === "in_progress") {
          continue;
        }
      }

      const camp = campaignMap.get(campIdStr);
      const step = e.currentStepId ? stepMap.get(e.currentStepId.toString()) : null;
      const stepTitle = step?.config?.subject
        ? `Step ${step.order}: ${step.config.subject.slice(0, 24)}`
        : step
          ? `Step ${step.order}: ${step.type.replace("_", " ")}`
          : e.status === "completed"
            ? "Completed"
            : e.status === "replied"
              ? "Replied"
              : e.status === "paused"
                ? "Paused"
                : "Pending Start";

      uniqueCampaignsMap.set(campIdStr, {
        id: campIdStr,
        enrollmentId: e._id.toString(),
        name: camp?.name || "Campaign",
        campaignStatus: camp?.status || "draft",
        enrollmentStatus: e.status,
        currentStepTitle: stepTitle,
        enrolledAt: e.enrolledAt,
      });
    }

    const enrichedCampaigns = Array.from(uniqueCampaignsMap.values());

    return Response.json({
      ...serializeLead(lead),
      campaignCount: enrollments.length,
      campaigns: enrichedCampaigns,
      conversationId: conversation ? conversation._id.toString() : null,
    });
  } catch (error) {
    console.error("Fetching lead failed:", error);

    return Response.json({ message: "Failed to fetch lead" }, { status: 500 });
  }
}

export async function PATCH(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const body = await req.json();

    const update = {};
    for (const key of EDITABLE_FIELDS) {
      if (body[key] !== undefined) update[key] = body[key];
    }

    const leads = await dbConnect("leads");
    const result = await leads.findOneAndUpdate(
      { _id: new ObjectId(id), workspaceId: new ObjectId(session.workspaceId) },
      { $set: update },
      { returnDocument: "after" },
    );

    if (!result) return Response.json({ message: "Lead not found" }, { status: 404 });

    return Response.json(serializeLead(result));
  } catch (error) {
    console.error("Updating lead failed:", error);

    return Response.json({ message: "Failed to update lead" }, { status: 500 });
  }
}

export async function DELETE(req, { params }) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const { id } = await params;
    const leads = await dbConnect("leads");
    const result = await leads.deleteOne({
      _id: new ObjectId(id),
      workspaceId: new ObjectId(session.workspaceId),
    });

    if (result.deletedCount === 0) {
      return Response.json({ message: "Lead not found" }, { status: 404 });
    }

    return Response.json({ message: "Lead deleted" });
  } catch (error) {
    console.error("Deleting lead failed:", error);

    return Response.json({ message: "Failed to delete lead" }, { status: 500 });
  }
}
