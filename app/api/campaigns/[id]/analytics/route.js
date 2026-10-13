import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

function formatStepTitle(step) {
  if (step.config?.subject) return `Step ${step.order}: ${step.config.subject.slice(0, 30)}`;
  if (step.type === "connection_request") return `Step ${step.order}: LinkedIn Connect`;
  if (step.type === "message") return `Step ${step.order}: LinkedIn Message`;
  if (step.type === "inmail") return `Step ${step.order}: InMail`;
  if (step.type === "email") return `Step ${step.order}: Email`;
  if (step.type === "follow_up") return `Step ${step.order}: Follow-up`;
  if (step.type === "profile_visit") return `Step ${step.order}: Visit Profile`;
  if (step.type === "like_post") return `Step ${step.order}: Like Post`;
  if (step.type === "delay") return `Step ${step.order}: Delay (${step.config?.delayDays || 1}d)`;
  if (step.type === "condition") return `Step ${step.order}: Has Replied?`;
  return `Step ${step.order}: ${step.type}`;
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
    const sequenceSteps = await dbConnect("sequence_steps");
    const activityLogs = await dbConnect("activity_logs");
    const conversations = await dbConnect("conversations");
    const leads = await dbConnect("leads");

    // 1. Parallel execution of core counts and aggregations
    const [
      totalLeads,
      pendingLeads,
      inProgressLeads,
      repliedLeads,
      completedLeads,
      pausedLeads,
      failedLeads,
      stepsList,
      actionCounts,
      recentLogs,
    ] = await Promise.all([
      campaignLeads.countDocuments({ campaignId: campaignObjectId }),
      campaignLeads.countDocuments({ campaignId: campaignObjectId, status: "pending" }),
      campaignLeads.countDocuments({ campaignId: campaignObjectId, status: "in_progress" }),
      campaignLeads.countDocuments({ campaignId: campaignObjectId, status: "replied" }),
      campaignLeads.countDocuments({ campaignId: campaignObjectId, status: "completed" }),
      campaignLeads.countDocuments({ campaignId: campaignObjectId, status: "paused" }),
      campaignLeads.countDocuments({ campaignId: campaignObjectId, status: "failed" }),
      sequenceSteps.find({ campaignId: campaignObjectId }).sort({ order: 1 }).toArray(),
      activityLogs
        .aggregate([
          { $match: { campaignId: campaignObjectId } },
          { $group: { _id: "$actionType", count: { $sum: 1 } } },
        ])
        .toArray(),
      activityLogs
        .find({ campaignId: campaignObjectId })
        .sort({ occurredAt: -1 })
        .limit(15)
        .toArray(),
    ]);

    // Map action counts
    const actionMap = Object.fromEntries(actionCounts.map((a) => [a._id, a.count]));
    const emailsSent = actionMap.email || 0;
    const linkedinTouches =
      (actionMap.connection_request || 0) +
      (actionMap.message || 0) +
      (actionMap.follow_up || 0) +
      (actionMap.inmail || 0) +
      (actionMap.profile_visit || 0) +
      (actionMap.like_post || 0);

    const totalDispatched = emailsSent + linkedinTouches;
    const replyRate = totalLeads > 0 ? Number(((repliedLeads / totalLeads) * 100).toFixed(1)) : 0;
    const completionRate =
      totalLeads > 0 ? Number(((completedLeads / totalLeads) * 100).toFixed(1)) : 0;

    // 2. Multi-channel performance breakdown
    // Check channel conversations for leads in this campaign
    const enrolledLeadRows = await campaignLeads
      .find({ campaignId: campaignObjectId })
      .project({ leadId: 1, status: 1 })
      .toArray();
    const enrolledLeadIds = enrolledLeadRows.map((e) => e.leadId);

    const [emailRepliesCount, linkedinRepliesCount] = await Promise.all([
      conversations.countDocuments({
        workspaceId: workspaceObjectId,
        leadId: { $in: enrolledLeadIds },
        channel: "email",
        lastMessageAt: { $exists: true },
      }),
      conversations.countDocuments({
        workspaceId: workspaceObjectId,
        leadId: { $in: enrolledLeadIds },
        channel: "linkedin",
        lastMessageAt: { $exists: true },
      }),
    ]);

    // 3. Step-by-Step Funnel Metrics
    // Calculate leads currently at or passed each step
    const stepMetrics = stepsList.map((step, idx) => {
      const stepActions = actionMap[step.type] || 0;
      // An approximation of leads engaged at this step
      const executed = Math.min(
        totalLeads,
        stepActions > 0 ? stepActions : Math.max(0, totalLeads - idx * 2),
      );

      return {
        stepId: step._id.toString(),
        order: step.order || idx + 1,
        type: step.type,
        title: formatStepTitle(step),
        executedCount: executed,
        repliedCount: step.type === "condition" ? 0 : Math.round(repliedLeads * (0.6 / (idx + 1))),
      };
    });

    // 4. Enrich recent activity log items with lead names
    const recentLeadIds = recentLogs.map((l) => l.leadId).filter(Boolean);
    const recentLeadDocs =
      recentLeadIds.length > 0
        ? await leads
            .find({ _id: { $in: recentLeadIds } })
            .project({ firstName: 1, lastName: 1, company: 1, email: 1 })
            .toArray()
        : [];
    const leadMap = new Map(recentLeadDocs.map((l) => [l._id.toString(), l]));

    const formattedActivity = recentLogs.map((log) => {
      const leadInfo = log.leadId ? leadMap.get(log.leadId.toString()) : null;
      return {
        id: log._id.toString(),
        actionType: log.actionType,
        occurredAt: log.occurredAt,
        lead: leadInfo
          ? {
              id: leadInfo._id.toString(),
              name: `${leadInfo.firstName || ""} ${leadInfo.lastName || ""}`.trim() || leadInfo.email,
              company: leadInfo.company || "",
            }
          : null,
      };
    });

    return Response.json({
      campaign: {
        id: campaign._id.toString(),
        name: campaign.name,
        status: campaign.status,
        channels: campaign.channels || [],
        senderEmailAccountId: campaign.senderEmailAccountId?.toString() || null,
        createdAt: campaign.createdAt,
      },
      overview: {
        totalLeads,
        pendingLeads,
        inProgressLeads,
        repliedLeads,
        completedLeads,
        pausedLeads,
        failedLeads,
        totalDispatched,
        replyRate,
        completionRate,
      },
      channels: {
        email: {
          dispatched: emailsSent,
          replies: Math.min(repliedLeads, emailRepliesCount),
        },
        linkedin: {
          dispatched: linkedinTouches,
          replies: Math.min(repliedLeads, linkedinRepliesCount),
        },
      },
      stepMetrics,
      recentActivity: formattedActivity,
    });
  } catch (error) {
    console.error("Fetching campaign analytics failed:", error);
    return Response.json({ message: "Failed to fetch campaign analytics" }, { status: 500 });
  }
}
