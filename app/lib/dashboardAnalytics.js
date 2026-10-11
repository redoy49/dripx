/**
 * Pure analytics helpers and formulas for Unified Executive Pulse Dashboard.
 */

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

export function computePipelineMetrics(totalLeads = 0, enrolledCount = 0, repliedCount = 0) {
  const unassignedCount = Math.max(0, totalLeads - enrolledCount);
  const overallReplyRate = enrolledCount > 0
    ? Number(((repliedCount / enrolledCount) * 100).toFixed(1))
    : 0;

  return {
    totalLeads,
    enrolledCount,
    unassignedCount,
    repliedCount,
    overallReplyRate,
  };
}

export function aggregateTouches({
  emailsSent = 0,
  linkedinMessages = 0,
  connectionRequests = 0,
  profileViews = 0,
} = {}) {
  const totalTouches = emailsSent + linkedinMessages + connectionRequests + profileViews;
  const emailPct = totalTouches > 0 ? Math.round((emailsSent / totalTouches) * 100) : 0;
  const linkedinTouches = linkedinMessages + connectionRequests + profileViews;
  const linkedinPct = totalTouches > 0 ? Math.round((linkedinTouches / totalTouches) * 100) : 0;

  return {
    totalTouches,
    emailsSent,
    linkedinTouches,
    emailPct,
    linkedinPct,
  };
}

export function generateExecutiveAlerts({
  needsReconnectCount = 0,
  failedJobsCount = 0,
  unreadConversations = 0,
} = {}) {
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
  return alerts;
}
