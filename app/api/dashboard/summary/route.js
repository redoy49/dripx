import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";
import { computeRampUpStatus } from "@/app/lib/rampUpEngine";

const ACTIVITY_LABELS = {
  connection_request: "Connection request sent",
  message: "Direct message sent",
  follow_up: "Follow-up message sent",
  inmail: "InMail sent",
  profile_visit: "Profile viewed",
  like_post: "Post liked",
  email: "Cold email dispatched",
};

export function getTimeRangeBounds(range = "7d") {
  const now = new Date();
  let startTime;
  let days = 7;

  switch (range) {
    case "today": {
      startTime = new Date(now);
      startTime.setUTCHours(0, 0, 0, 0);
      days = 1;
      break;
    }
    case "30d": {
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      days = 30;
      break;
    }
    case "90d": {
      startTime = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      days = 90;
      break;
    }
    case "7d":
    default: {
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      days = 7;
      break;
    }
  }

  return { startTime, now, days };
}

export async function GET(req) {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const workspaceId = new ObjectId(session.workspaceId);
    const { searchParams } = new URL(req.url);
    const range = searchParams.get("range") || "7d";
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
    ]);

    const [me, workspace] = await Promise.all([
      users.findOne({ _id: new ObjectId(session.userId) }),
      workspaces.findOne({ _id: workspaceId }),
    ]);

    // 1. PIPELINE METRICS
    const totalLeads = await leads.countDocuments({ workspaceId });
    const allEnrolledLeadIds = await campaignLeads.distinct("leadId");
    const enrolledLeadsInWs = await leads.countDocuments({
      workspaceId,
      _id: { $in: allEnrolledLeadIds },
    });
    const unassignedLeads = Math.max(0, totalLeads - enrolledLeadsInWs);

    const [completedEnrollments, repliedEnrollments] = await Promise.all([
      campaignLeads.countDocuments({ status: "completed" }),
      campaignLeads.countDocuments({ status: "replied" }),
    ]);

    const overallReplyRate = enrolledLeadsInWs > 0
      ? Number(((repliedEnrollments / enrolledLeadsInWs) * 100).toFixed(1))
      : 0;

    // 2. MULTI-CHANNEL OUTREACH ACTIVITY IN RANGE
    const [
      emailsSent,
      linkedinMessages,
      connectionRequests,
      profileViews,
    ] = await Promise.all([
      activityLogs.countDocuments({
        workspaceId,
        actionType: "email",
        occurredAt: { $gte: startTime },
      }),
      activityLogs.countDocuments({
        workspaceId,
        actionType: { $in: ["message", "follow_up", "inmail"] },
        occurredAt: { $gte: startTime },
      }),
      activityLogs.countDocuments({
        workspaceId,
        actionType: "connection_request",
        occurredAt: { $gte: startTime },
      }),
      activityLogs.countDocuments({
        workspaceId,
        actionType: "profile_visit",
        occurredAt: { $gte: startTime },
      }),
    ]);

    const totalTouches = emailsSent + linkedinMessages + connectionRequests + profileViews;

    // Inbound replies received in range
    const convoDocs = await conversations.find({ workspaceId }).project({ _id: 1 }).toArray();
    const convoIds = convoDocs.map((c) => c._id);
    const inboundRepliesCount = convoIds.length > 0
      ? await messages.countDocuments({
          conversationId: { $in: convoIds },
          direction: "inbound",
          sentAt: { $gte: startTime },
        })
      : 0;

    // 3. UNIFIED INBOX & CONVERSATIONS
    const [totalConversations, unreadConversations, emailConvos, linkedinConvos] = await Promise.all([
      conversations.countDocuments({ workspaceId }),
      conversations.countDocuments({ workspaceId, unreadCount: { $gt: 0 } }),
      conversations.countDocuments({ workspaceId, channel: "email" }),
      conversations.countDocuments({ workspaceId, channel: "linkedin" }),
    ]);

    // 4. INFRASTRUCTURE & DELIVERABILITY PULSE
    const mailboxes = await emailAccounts
      .find({ workspaceId, status: { $ne: "disconnected" } })
      .toArray();

    let totalCapacity = 0;
    let totalDnsScore = 0;
    let warmingUpCount = 0;
    let needsReconnectCount = 0;

    for (const m of mailboxes) {
      const ramp = computeRampUpStatus(m);
      totalCapacity += ramp.currentEffectiveLimit;
      if (ramp.isWarmingUp) warmingUpCount++;
      if (m.status === "needs_reconnect") needsReconnectCount++;
      totalDnsScore += m.dnsHealth?.score ?? 100;
    }

    const averageDnsScore = mailboxes.length > 0
      ? Math.round(totalDnsScore / mailboxes.length)
      : 100;

    // Queue health
    const [queuedJobsCount, processingJobsCount, failedJobsCount] = await Promise.all([
      jobs.countDocuments({ workspaceId, status: "queued" }),
      jobs.countDocuments({ workspaceId, status: "processing" }),
      jobs.countDocuments({ workspaceId, status: "failed" }),
    ]);

    // 5. TIME-SERIES VELOCITY CHART DATA
    const velocityChart = [];
    const chartSteps = range === "today" ? 1 : Math.min(days, 14);

    for (let i = chartSteps - 1; i >= 0; i--) {
      const dStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      dStart.setUTCHours(0, 0, 0, 0);
      const dEnd = new Date(dStart.getTime() + 24 * 60 * 60 * 1000);

      const [dayEmails, dayLinkedin, dayReplies] = await Promise.all([
        activityLogs.countDocuments({
          workspaceId,
          actionType: "email",
          occurredAt: { $gte: dStart, $lt: dEnd },
        }),
        activityLogs.countDocuments({
          workspaceId,
          actionType: { $in: ["connection_request", "message", "follow_up", "inmail"] },
          occurredAt: { $gte: dStart, $lt: dEnd },
        }),
        convoIds.length > 0
          ? messages.countDocuments({
              conversationId: { $in: convoIds },
              direction: "inbound",
              sentAt: { $gte: dStart, $lt: dEnd },
            })
          : 0,
      ]);

      velocityChart.push({
        label: dStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        rawDate: dStart.toISOString(),
        emails: dayEmails,
        linkedin: dayLinkedin,
        replies: dayReplies,
        total: dayEmails + dayLinkedin + dayReplies,
      });
    }

    // 6. TOP ACTIVE CAMPAIGNS ROSTER
    const activeCampaignDocs = await campaigns
      .find({ workspaceId })
      .sort({ status: 1, createdAt: -1 })
      .limit(4)
      .toArray();

    const topCampaigns = await Promise.all(
      activeCampaignDocs.map(async (c) => {
        const [total, inProg, replied] = await Promise.all([
          campaignLeads.countDocuments({ campaignId: c._id }),
          campaignLeads.countDocuments({ campaignId: c._id, status: "in_progress" }),
          campaignLeads.countDocuments({ campaignId: c._id, status: "replied" }),
        ]);

        const replyRate = total > 0 ? Number(((replied / total) * 100).toFixed(1)) : 0;
        const progressPct = total > 0 ? Math.min(100, Math.round(((total - inProg) / total) * 100)) : 0;

        return {
          id: c._id.toString(),
          name: c.name,
          status: c.status,
          channels: c.channels || ["email", "linkedin"],
          totalLeads: total,
          inProgress: inProg,
          repliedCount: replied,
          replyRate,
          progressPct,
        };
      }),
    );

    // 7. ENRICHED LIVE ACTIVITY STREAM
    const recentLogs = await activityLogs
      .find({ workspaceId })
      .sort({ occurredAt: -1 })
      .limit(7)
      .toArray();

    const logLeadIds = recentLogs.map((l) => l.leadId).filter(Boolean);
    const logCampaignIds = recentLogs.map((l) => l.campaignId).filter(Boolean);

    const [recentLeadDocs, recentCampDocs] = await Promise.all([
      logLeadIds.length > 0 ? leads.find({ _id: { $in: logLeadIds } }).toArray() : [],
      logCampaignIds.length > 0 ? campaigns.find({ _id: { $in: logCampaignIds } }).toArray() : [],
    ]);

    const leadMap = new Map(recentLeadDocs.map((l) => [l._id.toString(), l]));
    const campMap = new Map(recentCampDocs.map((c) => [c._id.toString(), c]));

    const recentActivity = recentLogs.map((log) => {
      const l = log.leadId ? leadMap.get(log.leadId.toString()) : null;
      const c = log.campaignId ? campMap.get(log.campaignId.toString()) : null;
      const leadName = l ? `${l.firstName || ""} ${l.lastName || ""}`.trim() || l.email : "Lead";
      const channel = log.actionType === "email" ? "email" : "linkedin";

      return {
        id: log._id.toString(),
        label: ACTIVITY_LABELS[log.actionType] || log.actionType,
        actionType: log.actionType,
        channel,
        leadId: log.leadId ? log.leadId.toString() : null,
        leadName,
        company: l?.company || "",
        campaignId: log.campaignId ? log.campaignId.toString() : null,
        campaignName: c?.name || "Outreach Campaign",
        occurredAt: log.occurredAt,
      };
    });

    // 8. CONTEXTUAL EXECUTIVE ALERTS
    const alerts = [];
    if (needsReconnectCount > 0) {
      alerts.push({
        id: "reconnect_needed",
        type: "warning",
        title: `${needsReconnectCount} Mailbox Requires Reconnection`,
        message: "One or more outreach senders lost authorization. Sequences are paused.",
        actionText: "Fix Mailbox",
        href: "/dashboard/settings?tab=Email Accounts",
      });
    }
    if (failedJobsCount > 0) {
      alerts.push({
        id: "failed_jobs",
        type: "danger",
        title: `${failedJobsCount} Sequence Execution Errors`,
        message: "Outreach jobs failed during dispatch. Review execution logs.",
        actionText: "View Queue",
        href: "/dashboard/campaigns",
      });
    }
    if (unreadConversations > 0) {
      alerts.push({
        id: "unread_inbox",
        type: "info",
        title: `${unreadConversations} Unread Lead Replies`,
        message: "New prospect responses are waiting in your Unified Inbox.",
        actionText: "Open Inbox",
        href: "/dashboard/inbox",
      });
    }

    return Response.json({
      workspaceName: workspace?.name || "My Workspace",
      greetingName: me?.name || "Leader",
      range,
      pipeline: {
        totalLeads,
        enrolledCount: enrolledLeadsInWs,
        unassignedCount: unassignedLeads,
        completedCount: completedEnrollments,
        repliedCount: repliedEnrollments,
        overallReplyRate,
      },
      outreach: {
        totalTouches,
        emailsSent,
        linkedinMessages,
        connectionRequests,
        profileViews,
        inboundRepliesCount,
      },
      conversations: {
        totalConversations,
        unreadCount: unreadConversations,
        emailConversations: emailConvos,
        linkedinConversations: linkedinConvos,
      },
      infrastructure: {
        totalMailboxes: mailboxes.length,
        averageDnsScore,
        totalDailyCapacity: totalCapacity,
        warmingUpCount,
        needsReconnectCount,
        queuedJobsCount,
        processingJobsCount,
        failedJobsCount,
      },
      velocityChart,
      topCampaigns,
      recentActivity,
      alerts,
    });
  } catch (error) {
    console.error("Dashboard summary execution failed:", error);
    return Response.json({ message: "Failed to generate dashboard summary" }, { status: 500 });
  }
}
