import { ObjectId } from "mongodb";
import { dbConnect } from "@/app/lib/mongoDb";
import { requireAuth } from "@/app/lib/session";

const ACTIVITY_LABELS = {
  connection_request: "Connection request was sent to",
  message: "Message was sent to",
  follow_up: "Follow-up was sent to",
  inmail: "InMail was sent to",
  profile_visit: "Profile was visited:",
  like_post: "Post was liked for",
  email: "Email was sent to",
};

function startOfDayUTC(date = new Date()) {
  const d = new Date(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export async function GET() {
  try {
    const { session, unauthorized } = await requireAuth();
    if (unauthorized) return unauthorized;

    const workspaceId = new ObjectId(session.workspaceId);

    const [users, workspaces, teamMembers, campaigns, campaignLeads, activityLogs, leads, conversations] =
      await Promise.all([
        dbConnect("users"),
        dbConnect("workspaces"),
        dbConnect("team_members"),
        dbConnect("campaigns"),
        dbConnect("campaign_leads"),
        dbConnect("activity_logs"),
        dbConnect("leads"),
        dbConnect("conversations"),
      ]);

    const [me, workspace, members] = await Promise.all([
      users.findOne({ _id: new ObjectId(session.userId) }),
      workspaces.findOne({ _id: workspaceId }),
      teamMembers.find({ workspaceId }).toArray(),
    ]);

    const today = startOfDayUTC();
    const [invitesSent, messagesSent, emailsSent, profileViews] = await Promise.all([
      activityLogs.countDocuments({ workspaceId, actionType: "connection_request", occurredAt: { $gte: today } }),
      activityLogs.countDocuments({
        workspaceId,
        actionType: { $in: ["message", "follow_up", "inmail"] },
        occurredAt: { $gte: today },
      }),
      activityLogs.countDocuments({ workspaceId, actionType: "email", occurredAt: { $gte: today } }),
      activityLogs.countDocuments({ workspaceId, actionType: "profile_visit", occurredAt: { $gte: today } }),
    ]);

    const pendingInvitations = await campaignLeads.countDocuments({
      status: { $in: ["pending", "in_progress"] },
    });
    const unreadMessages = await conversations.countDocuments({ workspaceId, unreadCount: { $gt: 0 } });

    // Profile views this week vs the prior week, for the "since last week" stat.
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
    const [thisWeekViews, lastWeekViews] = await Promise.all([
      activityLogs.countDocuments({ workspaceId, actionType: "profile_visit", occurredAt: { $gte: weekAgo } }),
      activityLogs.countDocuments({
        workspaceId,
        actionType: "profile_visit",
        occurredAt: { $gte: twoWeeksAgo, $lt: weekAgo },
      }),
    ]);
    const profileViewsChangePct = lastWeekViews > 0
      ? Math.round(((thisWeekViews - lastWeekViews) / lastWeekViews) * 100)
      : thisWeekViews > 0
        ? 100
        : 0;

    // Recent activity feed (last 5 actions across all campaigns).
    const recentLogs = await activityLogs.find({ workspaceId }).sort({ occurredAt: -1 }).limit(5).toArray();
    const leadIds = [...new Set(recentLogs.map((l) => l.leadId.toString()))].map((id) => new ObjectId(id));
    const campaignIds = [...new Set(recentLogs.map((l) => l.campaignId.toString()))].map((id) => new ObjectId(id));
    const [leadDocs, campaignDocs] = await Promise.all([
      leads.find({ _id: { $in: leadIds } }).toArray(),
      campaigns.find({ _id: { $in: campaignIds } }).toArray(),
    ]);
    const leadById = new Map(leadDocs.map((l) => [l._id.toString(), l]));
    const campaignById = new Map(campaignDocs.map((c) => [c._id.toString(), c]));

    const recentActivity = recentLogs.map((log) => {
      const lead = leadById.get(log.leadId.toString());
      const campaign = campaignById.get(log.campaignId.toString());
      return {
        id: log._id.toString(),
        label: ACTIVITY_LABELS[log.actionType] || log.actionType,
        leadName: lead ? `${lead.firstName} ${lead.lastName}`.trim() || "a lead" : "a lead",
        campaignName: campaign?.name || "Campaign",
        occurredAt: log.occurredAt,
      };
    });

    // Recent campaigns (top 3, newest first) with lead/progress counts.
    const recentCampaignDocs = await campaigns.find({ workspaceId }).sort({ createdAt: -1 }).limit(3).toArray();
    const recentCampaigns = await Promise.all(
      recentCampaignDocs.map(async (c) => {
        const [total, completed, replied] = await Promise.all([
          campaignLeads.countDocuments({ campaignId: c._id }),
          campaignLeads.countDocuments({ campaignId: c._id, status: { $in: ["completed", "in_progress"] } }),
          campaignLeads.countDocuments({ campaignId: c._id, status: "replied" }),
        ]);
        return {
          id: c._id.toString(),
          name: c.name,
          status: c.status,
          totalLeads: total,
          inProgress: completed,
          remaining: Math.max(total - completed, 0),
          repliedCount: replied,
          createdAt: c.createdAt,
        };
      }),
    );

    // Last 7 days of invites/messages, for the activity bar chart. "accepted" stays 0 — the
    // mock LinkedIn connector doesn't simulate a separate async "connection accepted" event.
    const weeklyChart = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = startOfDayUTC(new Date(Date.now() - i * 24 * 60 * 60 * 1000));
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
      const [invites, messages] = await Promise.all([
        activityLogs.countDocuments({
          workspaceId,
          actionType: "connection_request",
          occurredAt: { $gte: dayStart, $lt: dayEnd },
        }),
        activityLogs.countDocuments({
          workspaceId,
          actionType: { $in: ["message", "follow_up", "inmail"] },
          occurredAt: { $gte: dayStart, $lt: dayEnd },
        }),
      ]);
      weeklyChart.push({
        day: dayStart.toLocaleDateString("en-US", { month: "short", day: "2-digit" }),
        invites,
        accepted: 0,
        messages,
      });
    }

    return Response.json({
      greetingName: me?.name || "there",
      weeklyChart,
      statsToday: { invitesSent, messagesSent, emailsSent, profileViews },
      pendingInvitations,
      unreadMessages,
      profileViewsChangePct,
      recentActivity,
      recentCampaigns,
      team: {
        name: workspace?.name || "Default",
        memberCount: members.length,
        firstMember: me ? { name: me.name, initial: (me.name?.[0] || "?").toUpperCase() } : null,
      },
    });
  } catch (error) {
    console.error("Fetching dashboard summary failed:", error);

    return Response.json({ message: "Failed to fetch dashboard summary" }, { status: 500 });
  }
}
