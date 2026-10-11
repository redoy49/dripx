import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

// List leads for the current workspace, with optional search/tag/source/campaign/status filters + pagination.
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
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));

    const campaignLeadsCol = await dbConnect("campaign_leads");
    const campaignsCol = await dbConnect("campaigns");
    const sequenceStepsCol = await dbConnect("sequence_steps");
    const conversationsCol = await dbConnect("conversations");
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

    // Filter by Campaign enrollment
    if (campaignId && campaignId !== "all") {
      if (campaignId === "unassigned") {
        // Leads NOT enrolled in any campaign
        const allEnrollments = await campaignLeadsCol.distinct("leadId");
        query._id = { $nin: allEnrollments };
      } else {
        const campaignLeadIds = await campaignLeadsCol.distinct("leadId", {
          campaignId: new ObjectId(campaignId),
        });
        query._id = { $in: campaignLeadIds };
      }
    }

    // Filter by Outreach Status
    if (status && status !== "all") {
      const statusLeadIds = await campaignLeadsCol.distinct("leadId", { status });
      if (query._id) {
        // If already filtered by campaign, intersect IDs
        const existingIn = query._id.$in || [];
        const existingSet = new Set(existingIn.map((id) => id.toString()));
        const intersected = statusLeadIds.filter((id) => existingSet.has(id.toString()));
        query._id = { $in: intersected };
      } else {
        query._id = { $in: statusLeadIds };
      }
    }

    const total = await leadsCol.countDocuments(query);
    const rawLeads = await leadsCol
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Enrich page leads with active campaign enrollments and conversations
    const leadObjectIds = rawLeads.map((l) => l._id);

    const [enrollmentDocs, conversationDocs] = await Promise.all([
      leadObjectIds.length > 0
        ? campaignLeadsCol.find({ leadId: { $in: leadObjectIds } }).toArray()
        : [],
      leadObjectIds.length > 0
        ? conversationsCol.find({ workspaceId: workspaceObjectId, leadId: { $in: leadObjectIds } }).toArray()
        : [],
    ]);

    const campaignIds = [...new Set(enrollmentDocs.map((e) => e.campaignId))];
    const stepIds = [...new Set(enrollmentDocs.map((e) => e.currentStepId).filter(Boolean))];

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
    const convoMap = new Map(conversationDocs.map((c) => [c.leadId.toString(), c._id.toString()]));

    // Group enrollments by leadId (deduplicating by campaignId to guarantee uniqueness)
    const enrollmentsByLeadId = new Map();
    for (const e of enrollmentDocs) {
      const lId = e.leadId.toString();
      const campIdStr = e.campaignId.toString();
      if (!enrollmentsByLeadId.has(lId)) {
        enrollmentsByLeadId.set(lId, new Map());
      }
      const campMapForLead = enrollmentsByLeadId.get(lId);

      // If already present, don't overwrite if existing is replied or in_progress
      if (campMapForLead.has(campIdStr)) {
        const existing = campMapForLead.get(campIdStr);
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

      campMapForLead.set(campIdStr, {
        id: campIdStr,
        enrollmentId: e._id.toString(),
        name: camp?.name || "Campaign",
        campaignStatus: camp?.status || "draft",
        enrollmentStatus: e.status,
        currentStepTitle: stepTitle,
        enrolledAt: e.enrolledAt,
      });
    }

    const items = rawLeads.map((lead) => {
      const leadIdStr = lead._id.toString();
      const campsMap = enrollmentsByLeadId.get(leadIdStr);
      return {
        ...serializeLead(lead),
        campaigns: campsMap ? Array.from(campsMap.values()) : [],
        conversationId: convoMap.get(leadIdStr) || null,
      };
    });

    return Response.json({
      items,
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Fetching leads failed:", error);
    return Response.json({ message: "Failed to fetch leads" }, { status: 500 });
  }
}

// Create a single lead manually.
export async function POST(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const body = await req.json();

    if (!body.firstName && !body.linkedinUrl && !body.email) {
      return Response.json(
        { message: "At least a name, LinkedIn URL or email is required" },
        { status: 400 },
      );
    }

    const leads = await dbConnect("leads");
    const doc = {
      workspaceId: new ObjectId(session.workspaceId),
      firstName: body.firstName || "",
      lastName: body.lastName || "",
      headline: body.headline || "",
      company: body.company || "",
      jobTitle: body.jobTitle || "",
      linkedinUrl: body.linkedinUrl || "",
      email: body.email || "",
      customFields: body.customFields || {},
      tags: Array.isArray(body.tags) ? body.tags : [],
      source: body.source || "manual",
      createdAt: new Date(),
    };
    const result = await leads.insertOne(doc);

    return Response.json(serializeLead({ ...doc, _id: result.insertedId }), {
      status: 201,
    });
  } catch (error) {
    console.error("Creating lead failed:", error);

    return Response.json({ message: "Failed to create lead" }, { status: 500 });
  }
}

export function serializeLead(lead) {
  return {
    id: lead._id.toString(),
    firstName: lead.firstName || "",
    lastName: lead.lastName || "",
    headline: lead.headline || "",
    company: lead.company || "",
    jobTitle: lead.jobTitle || "",
    phone: lead.phone || "",
    industry: lead.industry || "",
    website: lead.website || "",
    icebreaker: lead.icebreaker || "",
    linkedinUrl: lead.linkedinUrl || "",
    email: lead.email || "",
    customFields: lead.customFields || {},
    tags: lead.tags || [],
    source: lead.source || "manual",
    createdAt: lead.createdAt,
  };
}
