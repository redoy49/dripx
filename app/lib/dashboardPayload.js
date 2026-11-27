import { generateExecutiveAlerts } from "@/app/lib/dashboardAnalytics";
import { mapTopCampaigns, summarizeMailboxes } from "@/app/lib/dashboardHelpers";

export function formatDashboardPayload({
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
}) {
  const enrolledLeadsInWs = facet.enrolledDistinct?.[0]?.count || 0;
  const unassignedLeads = Math.max(0, totalLeads - enrolledLeadsInWs);

  const statusCounts = new Map((facet.byStatus || []).map((s) => [s._id, s.count]));
  const completedEnrollments = statusCounts.get("completed") || 0;
  const repliedEnrollments = statusCounts.get("replied") || 0;
  const pendingEnrollments =
    (statusCounts.get("pending") || 0) + (statusCounts.get("in_progress") || 0);
  const pendingInvitesCount = pendingEnrollments > 0 ? pendingEnrollments : unassignedLeads;
  const overallReplyRate =
    enrolledLeadsInWs > 0 ? Number(((repliedEnrollments / enrolledLeadsInWs) * 100).toFixed(1)) : 0;

  const infra = summarizeMailboxes(mailboxes);

  const logsByType = new Map(rangeLogsAgg.map((r) => [r._id, r.count]));
  const loggedEmailsSent = logsByType.get("email") || 0;
  const loggedLinkedinMessages =
    (logsByType.get("message") || 0) +
    (logsByType.get("follow_up") || 0) +
    (logsByType.get("inmail") || 0);
  const loggedConnectionRequests = logsByType.get("connection_request") || 0;
  const loggedProfileViews = logsByType.get("profile_visit") || 0;

  const msgByDir = new Map(messageCountsAgg.map((m) => [m._id, m.count]));
  const outboundMsgCount = msgByDir.get("outbound") || 0;
  const inboundRepliesCount = msgByDir.get("inbound") || 0;
  const activeCampaignLeadsCount =
    (statusCounts.get("in_progress") || 0) + completedEnrollments + repliedEnrollments;

  const emailsSent =
    loggedEmailsSent > 0 ? loggedEmailsSent : mailboxes.length > 0 ? outboundMsgCount : 0;
  const connectionRequests =
    loggedConnectionRequests > 0 ? loggedConnectionRequests : activeCampaignLeadsCount;
  const linkedinMessages = loggedLinkedinMessages > 0 ? loggedLinkedinMessages : outboundMsgCount;
  const profileViews =
    loggedProfileViews > 0 ? loggedProfileViews : Math.round(activeCampaignLeadsCount * 0.7);
  const totalTouches = emailsSent + linkedinMessages + connectionRequests + profileViews;

  let unreadConversations = 0;
  let emailConvos = 0;
  let linkedinConvos = 0;
  for (const c of convoDocs) {
    if ((c.unreadCount || 0) > 0) unreadConversations++;
    if (c.channel === "email") emailConvos++;
    else if (c.channel === "linkedin") linkedinConvos++;
  }

  const jobCounts = new Map(jobsAgg.map((j) => [j._id, j.count]));

  return {
    workspaceName: workspace?.name || "My Workspace",
    greetingName: me?.name || me?.email?.split("@")[0] || "Leader",
    range,
    pipeline: {
      totalLeads,
      enrolledCount: enrolledLeadsInWs,
      unassignedCount: unassignedLeads,
      pendingInvitesCount,
      completedCount: completedEnrollments,
      repliedCount: repliedEnrollments,
      overallReplyRate,
    },
    outreach: {
      totalTouches,
      emailsSent,
      emailsLimit: infra.totalDailyCapacity > 0 ? infra.totalDailyCapacity : 100,
      linkedinMessages,
      messagesLimit: 80,
      connectionRequests,
      invitesLimit: 50,
      profileViews,
      profileViewsLimit: 100,
      inboundRepliesCount,
    },
    conversations: {
      totalConversations: convoDocs.length,
      unreadCount: unreadConversations,
      emailConversations: emailConvos,
      linkedinConversations: linkedinConvos,
    },
    infrastructure: {
      totalMailboxes: mailboxes.length,
      averageDnsScore: infra.averageDnsScore,
      totalDailyCapacity: infra.totalDailyCapacity,
      warmingUpCount: infra.warmingUpCount,
      needsReconnectCount: infra.needsReconnectCount,
      queuedJobsCount: jobCounts.get("queued") || 0,
      processingJobsCount: jobCounts.get("processing") || 0,
      failedJobsCount: jobCounts.get("failed") || 0,
    },
    velocityChart,
    topCampaigns: mapTopCampaigns(topCampaignDocs, facet.byCampaign || []),
    recentActivity,
    teamMembers,
    alerts: generateExecutiveAlerts({
      needsReconnectCount: infra.needsReconnectCount,
      failedJobsCount: jobCounts.get("failed") || 0,
      unreadConversations,
    }),
  };
}
