import { cache } from "react";
import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";

function toIso(val) {
  if (!val) return null;
  return val instanceof Date ? val.toISOString() : String(val);
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
    createdAt: toIso(lead.createdAt),
  };
}

export const getWorkspaceLeads = cache(
  async ({
    workspaceId,
    search = "",
    tag = null,
    source = null,
    campaignId = null,
    status = null,
    page = 1,
    limit = 25,
  }) => {
    const workspaceObjectId = new ObjectId(workspaceId);
    const [campaignLeadsCol, campaignsCol, sequenceStepsCol, conversationsCol, leadsCol] =
      await Promise.all([
        dbConnect("campaign_leads"),
        dbConnect("campaigns"),
        dbConnect("sequence_steps"),
        dbConnect("conversations"),
        dbConnect("leads"),
      ]);

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

    const [total, rawLeads] = await Promise.all([
      leadsCol.countDocuments(query),
      leadsCol
        .find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .toArray(),
    ]);

    const leadObjectIds = rawLeads.map((l) => l._id);

    const [enrollmentDocs, conversationDocs] = await Promise.all([
      leadObjectIds.length > 0
        ? campaignLeadsCol.find({ leadId: { $in: leadObjectIds } }).toArray()
        : [],
      leadObjectIds.length > 0
        ? conversationsCol
            .find({ workspaceId: workspaceObjectId, leadId: { $in: leadObjectIds } })
            .toArray()
        : [],
    ]);

    const campaignIds = [...new Set(enrollmentDocs.map((e) => e.campaignId))];
    const stepIds = [...new Set(enrollmentDocs.map((e) => e.currentStepId).filter(Boolean))];

    const [campaignDocs, stepDocs] = await Promise.all([
      campaignIds.length > 0
        ? campaignsCol.find({ _id: { $in: campaignIds } }).project({ name: 1, status: 1 }).toArray()
        : [],
      stepIds.length > 0
        ? sequenceStepsCol
            .find({ _id: { $in: stepIds } })
            .project({ order: 1, type: 1, config: 1 })
            .toArray()
        : [],
    ]);

    const campaignMap = new Map(campaignDocs.map((c) => [c._id.toString(), c]));
    const stepMap = new Map(stepDocs.map((s) => [s._id.toString(), s]));
    const convoMap = new Map(conversationDocs.map((c) => [c.leadId.toString(), c._id.toString()]));

    const enrollmentsByLeadId = new Map();
    for (const e of enrollmentDocs) {
      const lId = e.leadId.toString();
      const campIdStr = e.campaignId.toString();
      if (!enrollmentsByLeadId.has(lId)) {
        enrollmentsByLeadId.set(lId, new Map());
      }
      const campMapForLead = enrollmentsByLeadId.get(lId);

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
        enrolledAt: toIso(e.enrolledAt),
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

    return { items, total, page, limit };
  },
);
