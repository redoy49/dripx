import { computeRampUpStatus } from "@/app/lib/rampUpEngine";

export const ACTIVITY_LABELS = {
  connection_request: "Connection request sent",
  message: "Direct message sent",
  follow_up: "Follow-up message sent",
  inmail: "InMail sent",
  profile_visit: "Profile viewed",
  like_post: "Post liked",
  email: "Cold email dispatched",
};

function toIsoString(val) {
  if (!val) return null;
  return val instanceof Date ? val.toISOString() : String(val);
}

export function summarizeMailboxes(mailboxes = []) {
  let totalDailyCapacity = 0;
  let totalDnsScore = 0;
  let warmingUpCount = 0;
  let needsReconnectCount = 0;

  for (const m of mailboxes) {
    const ramp = computeRampUpStatus(m);
    totalDailyCapacity += ramp.currentEffectiveLimit;
    if (ramp.isWarmingUp) warmingUpCount++;
    if (m.status === "needs_reconnect") needsReconnectCount++;
    totalDnsScore += m.dnsHealth?.score ?? 100;
  }

  return {
    totalDailyCapacity,
    averageDnsScore: mailboxes.length > 0 ? Math.round(totalDnsScore / mailboxes.length) : 100,
    warmingUpCount,
    needsReconnectCount,
  };
}

export function mapTopCampaigns(campaignDocs = [], statsRows = []) {
  const statsMap = new Map(statsRows.map((s) => [s._id?.toString(), s]));

  return campaignDocs.map((c) => {
    const stat = statsMap.get(c._id.toString()) || {};
    const total = stat.total || 0;
    const inProg = stat.inProgress || 0;
    const replied = stat.replied || 0;
    const replyRate = total > 0 ? Number(((replied / total) * 100).toFixed(1)) : 0;
    const progressPct = total > 0 ? Math.min(100, Math.round(((total - inProg) / total) * 100)) : 0;

    return {
      id: c._id.toString(),
      name: c.name || "Untitled Campaign",
      status: c.status || "draft",
      channels: c.channels || ["email", "linkedin"],
      totalLeads: total,
      inProgress: inProg,
      repliedCount: replied,
      replyRate,
      progressPct,
      createdAt: c.createdAt
        ? new Date(c.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })
        : "Recently",
    };
  });
}

export async function hydrateRecentActivity({
  recentLogs,
  fallbackEnrollments,
  leadsCol,
  campaignsMap,
  campaignsCol,
}) {
  const usingLogs = recentLogs.length > 0;
  const rows = usingLogs ? recentLogs : fallbackEnrollments;
  if (!rows.length) return [];

  const leadIds = rows.map((r) => r.leadId).filter(Boolean);
  const missingCampIds = rows
    .map((r) => r.campaignId)
    .filter((id) => id && !campaignsMap.has(id.toString()));

  const [leadDocs, extraCampDocs] = await Promise.all([
    leadIds.length > 0
      ? leadsCol
          .find({ _id: { $in: leadIds } })
          .project({ firstName: 1, lastName: 1, email: 1, company: 1 })
          .toArray()
      : Promise.resolve([]),
    missingCampIds.length > 0
      ? campaignsCol.find({ _id: { $in: missingCampIds } }).project({ name: 1 }).toArray()
      : Promise.resolve([]),
  ]);

  const leadMap = new Map(leadDocs.map((l) => [l._id.toString(), l]));
  for (const c of extraCampDocs) campaignsMap.set(c._id.toString(), c);

  return rows.map((row) => {
    const l = row.leadId ? leadMap.get(row.leadId.toString()) : null;
    const c = row.campaignId ? campaignsMap.get(row.campaignId.toString()) : null;
    const fallbackLabel = usingLogs ? "Lead" : "Prospect";
    const leadName = l ? `${l.firstName || ""} ${l.lastName || ""}`.trim() || l.email : fallbackLabel;

    if (usingLogs) {
      return {
        id: row._id.toString(),
        label: ACTIVITY_LABELS[row.actionType] || row.actionType,
        actionType: row.actionType,
        channel: row.actionType === "email" ? "email" : "linkedin",
        leadId: row.leadId ? row.leadId.toString() : null,
        leadName,
        company: l?.company || "",
        campaignId: row.campaignId ? row.campaignId.toString() : null,
        campaignName: c?.name || "Outreach Campaign",
        occurredAt: toIsoString(row.occurredAt),
      };
    }

    const isReply = row.status === "replied";
    return {
      id: row._id.toString(),
      label: isReply ? "Lead replied" : "Prospect enrolled",
      actionType: isReply ? "message" : "connection_request",
      channel: "linkedin",
      leadId: row.leadId ? row.leadId.toString() : null,
      leadName,
      company: l?.company || "",
      campaignId: row.campaignId ? row.campaignId.toString() : null,
      campaignName: c?.name || "Outreach Campaign",
      occurredAt: toIsoString(row.enrolledAt || row.updatedAt) || new Date().toISOString(),
    };
  });
}

export function buildTeamMembersList({ me, teamDocs, userMap, totalLeads }) {
  const members = [];
  if (me) {
    const meName = me.name || me.email?.split("@")[0] || "Account Owner";
    members.push({
      id: me._id.toString(),
      name: meName,
      email: me.email || "",
      role: "OWNER",
      avatar: meName.charAt(0).toUpperCase(),
      plan: "Advanced",
      connections: totalLeads.toString(),
      active: true,
    });
  }

  for (const tm of teamDocs) {
    if (tm.userId && tm.userId.toString() === me?._id?.toString()) continue;
    const u = tm.userId ? userMap.get(tm.userId.toString()) : null;
    const name = u?.name || tm.invitedEmail?.split("@")[0] || "Teammate";
    members.push({
      id: tm._id.toString(),
      name,
      email: u?.email || tm.invitedEmail || "",
      role: (tm.role || "MEMBER").toUpperCase(),
      avatar: name.charAt(0).toUpperCase(),
      plan: "Pro",
      connections: Math.round(totalLeads / 2).toString(),
      active: tm.status === "active",
    });
  }

  return members;
}
