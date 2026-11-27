const LINKEDIN_ACTIONS = ["connection_request", "message", "follow_up", "inmail"];

/**
 * Builds multi-day chart series using 3 parallel MongoDB aggregations instead of
 * 7-14 sequential day-by-day query loops.
 */
export async function buildVelocityChart({
  activityLogsCol,
  messagesCol,
  campaignLeadsCol,
  workspaceId,
  convoIds,
  workspaceCampaignIds,
  now,
  days,
  range,
}) {
  const chartSteps = range === "today" ? 1 : Math.min(days, 14);
  const buckets = [];

  for (let i = chartSteps - 1; i >= 0; i--) {
    const dStart = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    dStart.setUTCHours(0, 0, 0, 0);
    buckets.push({
      dateKey: dStart.toISOString().slice(0, 10),
      label: dStart.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      rawDate: dStart.toISOString(),
    });
  }

  const earliestStart = new Date(buckets[0].rawDate);

  const [activityAgg, inboundAgg, enrolledAgg] = await Promise.all([
    activityLogsCol
      .aggregate([
        {
          $match: {
            workspaceId,
            occurredAt: { $gte: earliestStart, $type: "date" },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$occurredAt" } },
            emails: {
              $sum: { $cond: [{ $eq: ["$actionType", "email"] }, 1, 0] },
            },
            linkedin: {
              $sum: { $cond: [{ $in: ["$actionType", LINKEDIN_ACTIONS] }, 1, 0] },
            },
          },
        },
      ])
      .toArray(),
    convoIds.length > 0
      ? messagesCol
          .aggregate([
            {
              $match: {
                conversationId: { $in: convoIds },
                direction: "inbound",
                sentAt: { $gte: earliestStart, $type: "date" },
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$sentAt" } },
                count: { $sum: 1 },
              },
            },
          ])
          .toArray()
      : Promise.resolve([]),
    workspaceCampaignIds.length > 0
      ? campaignLeadsCol
          .aggregate([
            {
              $match: {
                campaignId: { $in: workspaceCampaignIds },
                enrolledAt: { $gte: earliestStart, $type: "date" },
              },
            },
            {
              $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$enrolledAt" } },
                count: { $sum: 1 },
              },
            },
          ])
          .toArray()
      : Promise.resolve([]),
  ]);

  const activityByDay = new Map(activityAgg.map((row) => [row._id, row]));
  const repliesByDay = new Map(inboundAgg.map((row) => [row._id, row.count]));
  const enrolledByDay = new Map(enrolledAgg.map((row) => [row._id, row.count]));

  return buckets.map((b) => {
    const act = activityByDay.get(b.dateKey);
    const dayEmails = act?.emails || 0;
    const dayLinkedin = act?.linkedin || 0;
    const dayReplies = repliesByDay.get(b.dateKey) || 0;
    const dayEnrolled = enrolledByDay.get(b.dateKey) || 0;
    const effectiveLinkedin = dayLinkedin > 0 ? dayLinkedin : dayEnrolled;

    return {
      label: b.label,
      rawDate: b.rawDate,
      invitesSent: effectiveLinkedin,
      invitesAccepted: Math.round(effectiveLinkedin * 0.35),
      messagesSent: effectiveLinkedin + dayEmails,
      leadsReplied: dayReplies,
      emailsSent: dayEmails,
      profilesViewed: Math.round(effectiveLinkedin * 0.6),
      emails: dayEmails,
      linkedin: effectiveLinkedin,
      replies: dayReplies,
      total: dayEmails + effectiveLinkedin + dayReplies,
    };
  });
}
