import { cache } from "react";
import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { getTimeRangeBounds } from "@/app/lib/dashboardAnalytics";
import { buildVelocityChart } from "@/app/lib/dashboardVelocity";
import { hydrateRecentActivity, buildTeamMembersList } from "@/app/lib/dashboardHelpers";
import { formatDashboardPayload } from "@/app/lib/dashboardPayload";

/**
 * Shared server-side dashboard summary loader used by both the streaming Server Component
 * (`app/(dashboard)/dashboard/page.jsx`) and `GET /api/dashboard/summary`.
 * Batches queries into 2 parallel round-trips strictly scoped to `workspaceId`.
 */
export const getDashboardSummary = cache(async ({ userId, workspaceId, range = "7d" }) => {
  const wsObjId = new ObjectId(workspaceId);
  const userObjId = new ObjectId(userId);
  const { startTime, now, days } = getTimeRangeBounds(range);

  const [
    users,
    workspaces,
    campaigns,
    campaignLeads,
    activityLogs,
    leads,
    conversations,
    messages,
    emailAccounts,
    jobs,
    teamMembersCol,
  ] = await Promise.all([
    dbConnect("users"),
    dbConnect("workspaces"),
    dbConnect("campaigns"),
    dbConnect("campaign_leads"),
    dbConnect("activity_logs"),
    dbConnect("leads"),
    dbConnect("conversations"),
    dbConnect("messages"),
    dbConnect("email_accounts"),
    dbConnect("jobs"),
    dbConnect("team_members"),
  ]);

  // Batch 1: Fetch workspace-scoped records + pre-aggregated metrics in 1 RTT
  const [
    me,
    workspace,
    totalLeads,
    workspaceCampaigns,
    mailboxes,
    rangeLogsAgg,
    convoDocs,
    jobsAgg,
    recentLogs,
    teamDocs,
  ] = await Promise.all([
    users.findOne({ _id: userObjId }, { projection: { name: 1, email: 1, avatarUrl: 1, image: 1 } }),
    workspaces.findOne({ _id: wsObjId }, { projection: { name: 1, plan: 1 } }),
    leads.countDocuments({ workspaceId: wsObjId }),
    campaigns
      .find({ workspaceId: wsObjId })
      .sort({ status: 1, createdAt: -1 })
      .project({ name: 1, status: 1, channels: 1, createdAt: 1 })
      .toArray(),
    emailAccounts
      .find({ workspaceId: wsObjId, status: { $ne: "disconnected" } })
      .project({ status: 1, dnsHealth: 1, rampUp: 1, dailyLimit: 1, createdAt: 1 })
      .toArray(),
    activityLogs
      .aggregate([
        { $match: { workspaceId: wsObjId, occurredAt: { $gte: startTime } } },
        { $group: { _id: "$actionType", count: { $sum: 1 } } },
      ])
      .toArray(),
    conversations
      .find({ workspaceId: wsObjId })
      .project({ _id: 1, unreadCount: 1, channel: 1 })
      .toArray(),
    jobs
      .aggregate([
        { $match: { workspaceId: wsObjId, status: { $in: ["queued", "processing", "failed"] } } },
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ])
      .toArray(),
    activityLogs.find({ workspaceId: wsObjId }).sort({ occurredAt: -1 }).limit(7).toArray(),
    teamMembersCol.find({ workspaceId: wsObjId }).toArray(),
  ]);

  const workspaceCampaignIds = workspaceCampaigns.map((c) => c._id);
  const topCampaignDocs = workspaceCampaigns.slice(0, 6);
  const topCampaignIds = topCampaignDocs.map((c) => c._id);
  const convoIds = convoDocs.map((c) => c._id);

  const memberUserIds = teamDocs.map((t) => t.userId).filter(Boolean);
  if (me?._id) memberUserIds.push(me._id);

  const facetStages = {
    enrolledDistinct: [{ $group: { _id: "$leadId" } }, { $count: "count" }],
    byStatus: [{ $group: { _id: "$status", count: { $sum: 1 } } }],
    byCampaign: [
      { $match: { campaignId: { $in: topCampaignIds } } },
      {
        $group: {
          _id: "$campaignId",
          total: { $sum: 1 },
          inProgress: { $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] } },
          replied: { $sum: { $cond: [{ $eq: ["$status", "replied"] }, 1, 0] } },
        },
      },
    ],
  };
  if (recentLogs.length === 0) {
    facetStages.recentEnrollments = [{ $sort: { enrolledAt: -1, _id: -1 } }, { $limit: 6 }];
  }

  // Batch 2: Scoped campaign_leads $facet + message counts + velocity chart + users in 1 RTT
  const [campaignLeadFacet, messageCountsAgg, velocityChart, teamUsers] = await Promise.all([
    workspaceCampaignIds.length > 0
      ? campaignLeads.aggregate([{ $match: { campaignId: { $in: workspaceCampaignIds } } }, { $facet: facetStages }]).toArray()
      : Promise.resolve([]),
    convoIds.length > 0
      ? messages
          .aggregate([
            { $match: { conversationId: { $in: convoIds }, sentAt: { $gte: startTime } } },
            { $group: { _id: "$direction", count: { $sum: 1 } } },
          ])
          .toArray()
      : Promise.resolve([]),
    buildVelocityChart({
      activityLogsCol: activityLogs,
      messagesCol: messages,
      campaignLeadsCol: campaignLeads,
      workspaceId: wsObjId,
      convoIds,
      workspaceCampaignIds,
      now,
      days,
      range,
    }),
    memberUserIds.length > 0
      ? users
          .find({ _id: { $in: memberUserIds } })
          .project({ name: 1, email: 1, avatarUrl: 1 })
          .toArray()
      : Promise.resolve([]),
  ]);

  const facet = campaignLeadFacet[0] || {};
  const campaignsMap = new Map(workspaceCampaigns.map((c) => [c._id.toString(), c]));
  const recentActivity = await hydrateRecentActivity({
    recentLogs,
    fallbackEnrollments: facet.recentEnrollments || [],
    leadsCol: leads,
    campaignsMap,
    campaignsCol: campaigns,
  });

  const userMap = new Map(teamUsers.map((u) => [u._id.toString(), u]));
  const teamMembers = buildTeamMembersList({ me, teamDocs, userMap, totalLeads });

  return formatDashboardPayload({
    me,
    workspace,
    range,
    totalLeads,
    topCampaignDocs,
    facet,
    mailboxes,
    rangeLogsAgg,
    messageCountsAgg,
    convoDocs,
    jobsAgg,
    velocityChart,
    recentActivity,
    teamMembers,
  });
});
