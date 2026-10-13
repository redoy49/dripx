import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { serializeLead } from "@/app/api/leads/route";

// Lists execution queue jobs for a campaign, with status counts and joined lead details.
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

    const { searchParams } = new URL(req.url);
    const filterStatus = searchParams.get("status");

    const jobsCol = await dbConnect("jobs");
    const leadsCol = await dbConnect("leads");
    const sequenceStepsCol = await dbConnect("sequence_steps");

    // 1. Queue Status Counts
    const [queued, processing, done, failed, skipped] = await Promise.all([
      jobsCol.countDocuments({ campaignId: campaignObjectId, status: "queued" }),
      jobsCol.countDocuments({ campaignId: campaignObjectId, status: "processing" }),
      jobsCol.countDocuments({ campaignId: campaignObjectId, status: "done" }),
      jobsCol.countDocuments({ campaignId: campaignObjectId, status: "failed" }),
      jobsCol.countDocuments({ campaignId: campaignObjectId, status: "skipped" }),
    ]);

    const counts = {
      queued,
      processing,
      done,
      failed,
      skipped,
      total: queued + processing + done + failed + skipped,
    };

    // 2. Query jobs with filter
    const query = { campaignId: campaignObjectId };
    if (filterStatus && filterStatus !== "all") {
      query.status = filterStatus;
    }

    const rawJobs = await jobsCol
      .find(query)
      .sort({ runAfter: 1, createdAt: -1 })
      .limit(60)
      .toArray();

    // 3. Enrich jobs with lead and step details
    const leadIds = rawJobs.map((j) => j.leadId).filter(Boolean);
    const stepIds = rawJobs.map((j) => j.stepId).filter(Boolean);

    // If jobs don't have direct leadId, extract through campaign_leads
    const campaignLeadIds = rawJobs.map((j) => j.campaignLeadId).filter(Boolean);
    const campaignLeadsCol = await dbConnect("campaign_leads");
    const campaignLeadDocs =
      campaignLeadIds.length > 0
        ? await campaignLeadsCol.find({ _id: { $in: campaignLeadIds } }).toArray()
        : [];
    const campaignLeadMap = new Map(campaignLeadDocs.map((cl) => [cl._id.toString(), cl]));

    const resolvedLeadIds = [
      ...leadIds,
      ...campaignLeadDocs.map((cl) => cl.leadId).filter(Boolean),
    ];

    const [leadDocs, stepDocs] = await Promise.all([
      resolvedLeadIds.length > 0
        ? leadsCol.find({ _id: { $in: resolvedLeadIds } }).toArray()
        : [],
      stepIds.length > 0
        ? sequenceStepsCol.find({ _id: { $in: stepIds } }).toArray()
        : [],
    ]);

    const leadMap = new Map(leadDocs.map((l) => [l._id.toString(), l]));
    const stepMap = new Map(stepDocs.map((s) => [s._id.toString(), s]));

    const items = rawJobs.map((job) => {
      let targetLeadId = job.leadId?.toString();
      if (!targetLeadId && job.campaignLeadId) {
        const cl = campaignLeadMap.get(job.campaignLeadId.toString());
        if (cl?.leadId) targetLeadId = cl.leadId.toString();
      }

      const leadDoc = targetLeadId ? leadMap.get(targetLeadId) : null;
      const stepDoc = job.stepId ? stepMap.get(job.stepId.toString()) : null;

      const stepTitle = stepDoc?.config?.subject
        ? `Step ${stepDoc.order}: ${stepDoc.config.subject.slice(0, 30)}`
        : stepDoc
          ? `Step ${stepDoc.order}: ${stepDoc.type?.replace("_", " ")}`
          : job.type?.replace("_", " ") || "Step";

      return {
        id: job._id.toString(),
        status: job.status,
        type: job.type,
        stepTitle,
        stepId: job.stepId ? job.stepId.toString() : null,
        runAfter: job.runAfter,
        attempts: job.attempts || 0,
        lastError: job.lastError || null,
        lockedAt: job.lockedAt || null,
        createdAt: job.createdAt,
        lead: leadDoc ? serializeLead(leadDoc) : null,
      };
    });

    return Response.json({
      counts,
      items,
    });
  } catch (error) {
    console.error("Fetching campaign execution jobs failed:", error);
    return Response.json({ message: "Failed to fetch jobs" }, { status: 500 });
  }
}
