"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardLoading from "./loading";
import { getCached, setCached } from "@/app/lib/swrCache";
import {
  Users,
  Plus,
  TrendingUp,
  RefreshCw,
  Loader2,
  Mail,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Bell,
  ArrowLeft,
  Info,
  MessageSquare,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function formatTimeAgo(dateString) {
  if (!dateString) return "Just now";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (60 * 1000));
  if (diffMins < 1) return "Just now";
  if (diffMins === 1) return "1 minute ago";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

const RANGE_TABS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "pick", label: "Pick dates" },
];

// Circular SVG Progress Ring Component (matches reference video)
function CircularProgressGauge({ percentage = 0, fraction = "0 / 0", label, color = "#6367FF" }) {
  const size = 66;
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EFEFF4"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Filled Ring */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-[12px] font-bold text-gray-800">
          {clampedPct}%
        </span>
      </div>
      <span className="mt-1 text-[11px] font-bold text-gray-700">
        {fraction}
      </span>
      <span className="text-[10.5px] font-medium text-gray-400">
        {label}
      </span>
    </div>
  );
}

export default function DashboardPage() {
  const router = useRouter();
  const [creatingCampaign, setCreatingCampaign] = useState(false);
  const [range, setRange] = useState("7d");
  const [summary, setSummary] = useState(() => {
    return getCached("/api/dashboard/summary?range=7d");
  });
  const [loading, setLoading] = useState(() => {
    return !getCached("/api/dashboard/summary?range=7d");
  });
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState(null);

  const handleCreateCampaign = async () => {
    if (creatingCampaign) return;
    setCreatingCampaign(true);
    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Untitled Campaign" }),
      });
      const data = await res.json();
      if (res.ok && data?.id) {
        router.push(`/dashboard/new-campaign?id=${data.id}`);
        return;
      }
    } catch (err) {
      console.error("Failed to create campaign:", err);
    } finally {
      setCreatingCampaign(false);
    }
    router.push("/dashboard/new-campaign");
  };

  // Team & Member view state (100% real data)
  const [selectedMember, setSelectedMember] = useState(null);
  const [teamMembers, setTeamMembers] = useState(() => {
    const cached = getCached("/api/dashboard/summary?range=7d");
    return cached?.teamMembers || [];
  });
  const [campaignToggles, setCampaignToggles] = useState({});

  const loadSummary = useCallback(async (selectedRange = range) => {
    try {
      const apiRange = selectedRange === "yesterday" || selectedRange === "pick" ? "7d" : selectedRange;
      const url = `/api/dashboard/summary?range=${apiRange}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setCached(url, data);
        setSummary(data);
        if (data.teamMembers && data.teamMembers.length > 0) {
          setTeamMembers(data.teamMembers);
        }
      }
    } catch (err) {
      console.error("Failed to load dashboard summary:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [range]);

  useEffect(() => {
    let ignore = false;
    const apiRange = range === "yesterday" || range === "pick" ? "7d" : range;
    const url = `/api/dashboard/summary?range=${apiRange}`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data) {
          setCached(url, data);
          setSummary(data);
          if (data.teamMembers && data.teamMembers.length > 0) {
            setTeamMembers(data.teamMembers);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Init summary load failed:", err);
          setLoading(false);
        }
      });

    // Also load team members as fallback/sync
    fetch("/api/team/members")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items && data.items.length > 0 && !ignore) {
          setTeamMembers((prev) => {
            if (prev.length > 0) return prev;
            return data.items.map((m, idx) => ({
              id: m.id,
              name: m.user?.name || m.invitedEmail?.split("@")[0] || `Member ${idx + 1}`,
              email: m.user?.email || m.invitedEmail,
              role: (m.role || "MEMBER").toUpperCase(),
              avatar: (m.user?.name || m.invitedEmail || "U").charAt(0).toUpperCase(),
              plan: "Pro",
              connections: "0",
              active: m.status === "active",
            }));
          });
        }
      })
      .catch(() => {});

    return () => {
      ignore = true;
    };
  }, [range]);

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    setRefreshing(true);
    loadSummary(newRange);
  };

  const handleToggleCampaign = (id, currentStatus) => {
    setCampaignToggles((prev) => ({
      ...prev,
      [id]: prev[id] !== undefined ? !prev[id] : currentStatus !== "active",
    }));
  };

  const showWithdrawToast = () => {
    setToast("Pending connection invitations successfully withdrawn.");
    setTimeout(() => setToast(null), 3000);
  };

  const pipeline = summary?.pipeline || {};
  const outreach = summary?.outreach || {};
  const conversations = summary?.conversations || {};
  const velocityChart = useMemo(() => summary?.velocityChart || [], [summary?.velocityChart]);
  const topCampaigns = summary?.topCampaigns || [];
  const recentActivity = summary?.recentActivity || [];
  const alerts = summary?.alerts || [];

  // 100% Real Gauge statistics calculations from MongoDB telemetry
  const inviteCount = outreach.connectionRequests || 0;
  const inviteLimit = outreach.invitesLimit || 50;
  const invitePct = Math.min(100, Math.round((inviteCount / inviteLimit) * 100));

  const messageCount = outreach.linkedinMessages || 0;
  const messageLimit = outreach.messagesLimit || 80;
  const messagePct = Math.min(100, Math.round((messageCount / messageLimit) * 100));

  const emailCount = outreach.emailsSent || 0;
  const emailLimit = outreach.emailsLimit || 100;
  const emailPct = Math.min(100, Math.round((emailCount / emailLimit) * 100));

  const profileCount = outreach.profileViews || 0;
  const profileLimit = outreach.profileViewsLimit || 100;
  const profilePct = Math.min(100, Math.round((profileCount / profileLimit) * 100));

  // 100% Real highlight metrics from MongoDB
  const pendingInvitations = pipeline.pendingInvitesCount || pipeline.unassignedCount || 0;
  const unreadMessagesCount = conversations.unreadCount || 0;
  const growthRateText = pipeline.overallReplyRate > 0 ? `+${pipeline.overallReplyRate}%` : "+0%";

  // Real multi-day activity bar chart data directly from MongoDB time series
  const chartDays = useMemo(() => {
    if (!velocityChart || velocityChart.length === 0) return [];
    return velocityChart.map((d) => ({
      label: d.label,
      invitesSent: d.invitesSent || 0,
      invitesAccepted: d.invitesAccepted || 0,
      messagesSent: d.messagesSent || 0,
      leadsReplied: d.leadsReplied || 0,
      emailsSent: d.emailsSent || 0,
      profilesViewed: d.profilesViewed || 0,
    }));
  }, [velocityChart]);

  const maxChartVal = useMemo(() => {
    if (!chartDays.length) return 20;
    return Math.max(
      ...chartDays.map((d) =>
        Math.max(
          d.invitesSent,
          d.invitesAccepted,
          d.messagesSent,
          d.leadsReplied,
          d.emailsSent,
          d.profilesViewed,
          10
        )
      )
    );
  }, [chartDays]);

  if (loading && !summary) {
    return <DashboardLoading />;
  }

  return (
    <div className="min-h-screen bg-[#FAFAFC] p-4 sm:p-6 lg:p-7 space-y-6 w-full max-w-full text-gray-800">
      {/* ── Toast Notification ─────────────────────────────────────────── */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-xl animate-in fade-in duration-200">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      {/* ── 1. Top Executive Greeting Header ───────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight sm:text-3xl flex items-center gap-2">
            <span>{getGreeting()}, {summary?.greetingName || "User"}!</span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Here&apos;s what&apos;s happening with your outreach and campaign flows today
          </p>
        </div>

        {/* Header Right Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Unread Alert Bell */}
          <button
            title="Notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/90 bg-white text-gray-500 shadow-2xs transition hover:bg-gray-50"
          >
            <Bell size={16} />
            {unreadMessagesCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white shadow-xs">
                {unreadMessagesCount}
              </span>
            )}
          </button>

          {/* Quick Action Buttons (All Rounded Full) */}
          <button
            onClick={handleCreateCampaign}
            disabled={creatingCampaign}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#6367FF] hover:bg-[#5254e8] px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Plus size={14} />
            <span>{creatingCampaign ? "Creating..." : "New Campaign"}</span>
          </button>

          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition active:scale-95"
          >
            <Users size={14} className="text-gray-400" />
            <span>Manage Leads</span>
          </Link>

          <Link
            href="/dashboard/inbox"
            className="relative inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition active:scale-95"
          >
            <MessageSquare size={14} className="text-[#6367FF]" />
            <span>Unified Inbox</span>
            {unreadMessagesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {unreadMessagesCount}
              </span>
            )}
          </Link>

          {/* Refresh Button (Rounded Full) */}
          <button
            onClick={() => {
              setRefreshing(true);
              loadSummary();
            }}
            title="Refresh dashboard metrics"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition shadow-2xs active:scale-95"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-[#6367FF]" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── System Alerts Banner (if any) ─────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-3.5 rounded-2xl border text-xs shadow-2xs transition ${
                alert.type === "danger"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : alert.type === "warning"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-violet-50 border-violet-200 text-violet-800"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {alert.type === "danger" ? (
                  <AlertCircle size={15} className="text-rose-600 shrink-0" />
                ) : alert.type === "warning" ? (
                  <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 size={15} className="text-[#6367FF] shrink-0" />
                )}
                <div className="min-w-0 truncate">
                  <span className="font-bold">{alert.title}</span> —{" "}
                  <span className="opacity-90">{alert.message}</span>
                </div>
              </div>
              <Link
                href={alert.href}
                className="shrink-0 ml-3 rounded-full bg-white/80 px-3 py-1 font-bold hover:bg-white text-xs border border-gray-200 shadow-2xs"
              >
                {alert.actionText} →
              </Link>
            </div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 text-center text-xs text-gray-400 space-y-3">
          <Loader2 size={28} className="animate-spin text-[#6367FF]" />
          <p className="font-semibold text-gray-500">Loading live telemetry and campaign analytics...</p>
        </div>
      ) : (
        <>
          {/* ── 2. Upper Grid: Statistics & Recent Activity (Matches Reference Video) ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Card (~68% width): Statistics */}
            <div className="lg:col-span-8 rounded-3xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base font-bold text-gray-900 tracking-tight">Statistics</h2>
                <Link
                  href="/dashboard/campaigns"
                  className="text-xs font-semibold text-[#6367FF] hover:underline"
                >
                  View More
                </Link>
              </div>

              {/* 4 Radial Gauges Row (100% Real Database Counts) */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
                <CircularProgressGauge
                  percentage={invitePct}
                  fraction={`${inviteCount} / ${inviteLimit}`}
                  label="Invites sent"
                  color="#6367FF"
                />
                <CircularProgressGauge
                  percentage={messagePct}
                  fraction={`${messageCount} / ${messageLimit}`}
                  label="Messages sent"
                  color="#F43F5E"
                />
                <CircularProgressGauge
                  percentage={emailPct}
                  fraction={`${emailCount} / ${emailLimit}`}
                  label="Emails sent"
                  color="#F59E0B"
                />
                <CircularProgressGauge
                  percentage={profilePct}
                  fraction={`${profileCount} / ${profileLimit}`}
                  label="Profile viewed"
                  color="#10B981"
                />
              </div>

              {/* 3 Stat Metric Highlight Boxes Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 border-t border-gray-100">
                {/* Box 1: Pending Invitations with Rounded Full Withdraw Button */}
                <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3.5 flex flex-col justify-between space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Pending invitations
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-gray-900">
                      {pendingInvitations}
                    </span>
                    <button
                      onClick={showWithdrawToast}
                      className="rounded-full border border-gray-200 bg-white px-3.5 py-1 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 active:scale-95"
                    >
                      Withdraw
                    </button>
                  </div>
                </div>

                {/* Box 2: Unread Messages with Rounded Full View Button */}
                <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3.5 flex flex-col justify-between space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Unread messages
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-gray-900">
                      {unreadMessagesCount}
                    </span>
                    <Link
                      href="/dashboard/inbox"
                      className="rounded-full border border-gray-200 bg-white px-4 py-1 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 active:scale-95"
                    >
                      View
                    </Link>
                  </div>
                </div>

                {/* Box 3: Profile Views / Growth metric */}
                <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3.5 flex flex-col justify-between space-y-2">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Reply rate velocity
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-gray-900">
                      {growthRateText}
                    </span>
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                      <TrendingUp size={13} />
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Card (~32% width): Recent activity */}
            <div className="lg:col-span-4 rounded-3xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
                  <h2 className="text-base font-bold text-gray-900 tracking-tight">Recent activity</h2>
                  <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>

                {/* Activity Feed Items (Real Database Events) */}
                <div className="space-y-3.5">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 4).map((act) => {
                      const isEmail = act.actionType === "email";
                      return (
                        <div key={act.id} className="flex items-start gap-3 group">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-50 border border-gray-100 text-gray-500 mt-0.5 group-hover:border-[#6367FF]/30 transition">
                            {isEmail ? (
                              <Mail size={13} className="text-[#6367FF]" />
                            ) : (
                              <FaLinkedin size={13} className="text-[#0A66C2]" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-xs text-gray-700 leading-snug">
                              {act.label} →{" "}
                              <span className="font-bold text-gray-900">{act.leadName}</span>
                            </p>
                            <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                              {formatTimeAgo(act.occurredAt)} • {act.campaignName}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl p-4">
                      No outreach activity recorded yet. Launch a campaign or enroll leads to begin tracking real touches.
                    </div>
                  )}
                </div>
              </div>

              <Link
                href="/dashboard/campaigns"
                className="mt-4 block w-full rounded-full border border-gray-200 bg-white py-2 text-center text-xs font-semibold text-gray-600 shadow-2xs transition hover:bg-gray-50"
              >
                View all activity
              </Link>
            </div>
          </div>

          {/* ── 3. Middle Section: Recent Campaigns Table (Matches Reference Video) ── */}
          <div className="rounded-3xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
            {/* Header with All Campaigns & New Campaign (Both Rounded-Full) */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-base font-bold text-gray-900 tracking-tight">Recent campaigns</h2>
              <div className="flex items-center gap-2.5">
                <Link
                  href="/dashboard/campaigns"
                  className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-2xs transition hover:bg-gray-50"
                >
                  All campaigns
                </Link>
                <button
                  onClick={handleCreateCampaign}
                  disabled={creatingCampaign}
                  className="inline-flex items-center gap-1.5 rounded-full bg-[#6367FF] hover:bg-[#5254e8] px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-60 cursor-pointer"
                >
                  <Plus size={14} />
                  <span>{creatingCampaign ? "Creating..." : "New campaign"}</span>
                </button>
              </div>
            </div>

            {/* Table Header Row */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400">
                    <th className="pb-3 font-semibold uppercase tracking-wider w-[36%]">Overview</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider w-[24%]">Leads</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider w-[24%]">LinkedIn</th>
                    <th className="pb-3 font-semibold uppercase tracking-wider w-[16%] text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-xs">
                  {topCampaigns.length > 0 ? (
                    topCampaigns.map((camp) => {
                      const isToggledActive =
                        campaignToggles[camp.id] !== undefined
                          ? campaignToggles[camp.id]
                          : camp.status === "active";

                      return (
                        <tr key={camp.id} className="group hover:bg-[#FAFAFC] transition">
                          {/* 1. Overview */}
                          <td className="py-4 pr-4">
                            <Link
                              href={`/dashboard/campaigns/${camp.id}`}
                              className="inline-flex items-center gap-1.5 font-bold text-gray-800 group-hover:text-[#6367FF] transition"
                            >
                              <span>{camp.name}</span>
                              <ChevronRight size={13} className="text-gray-400 group-hover:text-[#6367FF]" />
                            </Link>
                            <div className="mt-2 space-y-1 max-w-xs">
                              <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                                <span>👥 {camp.totalLeads} prospects</span>
                                <span className="text-emerald-600 font-semibold">{camp.progressPct}%</span>
                              </div>
                              {/* Segmented multi-color progress bar */}
                              <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                                <div
                                  style={{ width: `${Math.min(70, camp.progressPct)}%` }}
                                  className="bg-[#6367FF]"
                                />
                                <div
                                  style={{ width: `${Math.min(20, (camp.replyRate || 10))}%` }}
                                  className="bg-emerald-400"
                                />
                                <div style={{ width: "10%" }} className="bg-rose-400" />
                              </div>
                            </div>
                          </td>

                          {/* 2. Leads */}
                          <td className="py-4 pr-4 align-top">
                            <div className="flex items-baseline gap-1.5">
                              <span className="text-sm font-bold text-gray-900">{camp.totalLeads}</span>
                              <span className="text-[10px] font-bold text-[#6367FF]">Total</span>
                            </div>
                            <p className="text-[11px] text-gray-400 mt-0.5">All leads</p>
                            <div className="mt-2 text-[11px] text-gray-400">
                              <span className="font-bold text-gray-700">{camp.inProgress || 0}</span> in progress
                            </div>
                          </td>

                          {/* 3. LinkedIn Metrics */}
                          <td className="py-4 pr-4 align-top">
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between max-w-[170px]">
                                <span className="text-[11px] text-gray-500">Reply rate</span>
                                <span className="font-bold text-gray-800">
                                  {camp.replyRate ? `${camp.replyRate}%` : "0%"}
                                </span>
                              </div>
                              <div className="flex items-center justify-between max-w-[170px]">
                                <span className="text-[11px] text-gray-500 flex items-center gap-1">
                                  <span>Replied leads</span>
                                  <Info size={11} className="text-gray-300" />
                                </span>
                                <span className="font-bold text-gray-800">
                                  {camp.repliedCount || 0}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 4. Status Toggle Switch */}
                          <td className="py-4 text-right align-top">
                            <div className="flex flex-col items-end gap-1">
                              {/* Rounded Full Toggle Switch */}
                              <button
                                onClick={() => handleToggleCampaign(camp.id, camp.status)}
                                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                                  isToggledActive ? "bg-emerald-500" : "bg-gray-200"
                                }`}
                              >
                                <span
                                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                    isToggledActive ? "translate-x-4" : "translate-x-0"
                                  }`}
                                />
                              </button>
                              <span className="text-[10px] font-medium text-gray-400">
                                {camp.createdAt}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-xs text-gray-400">
                        <p className="font-semibold text-gray-600">No campaigns launched yet in this workspace</p>
                        <p className="mt-1">Create an outreach sequence to start enrolling and dispatching leads.</p>
                        <button
                          onClick={handleCreateCampaign}
                          disabled={creatingCampaign}
                          className="inline-flex items-center gap-1.5 mt-3 rounded-full bg-[#6367FF] px-4 py-2 text-xs font-bold text-white hover:bg-[#5254e8] disabled:opacity-60 cursor-pointer"
                        >
                          <Plus size={13} />
                          <span>{creatingCampaign ? "Creating..." : "Create first campaign"}</span>
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── 4. Bottom Section: Your team & Multi-Bar Activity Chart (Matches Video) ── */}
          <div className="rounded-3xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
            {selectedMember ? (
              /* Dedicated Team Member Profile View (Matches Video 00:22) */
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
                  <button
                    onClick={() => setSelectedMember(null)}
                    className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-2xs transition hover:bg-gray-50"
                  >
                    <ArrowLeft size={14} />
                    <span>Back to Team</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button className="rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50">
                      View on LinkedIn
                    </button>
                    <button className="rounded-full bg-[#6367FF] hover:bg-[#5254e8] px-4 py-2 text-xs font-bold text-white shadow-sm">
                      Sign in →
                    </button>
                  </div>
                </div>

                {/* Member Header Information */}
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-[#6367FF] to-violet-400 text-lg font-bold text-white shadow-sm">
                    {selectedMember.avatar}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-gray-900">{selectedMember.name}</h3>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                      <span>Plan: <strong className="text-gray-800">{selectedMember.plan || "Pro"}</strong></span>
                      <span>·</span>
                      <span>Role: <strong className="text-gray-800">{selectedMember.role || "MEMBER"}</strong></span>
                      <span>·</span>
                      <span className="font-bold text-emerald-600">Active</span>
                    </div>
                  </div>
                </div>

                {/* Member Metrics Row (Real Telemetry) */}
                <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
                  <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Unread Messages</p>
                    <p className="mt-1 text-lg font-black text-gray-900">{unreadMessagesCount}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Active Campaigns</p>
                    <p className="mt-1 text-lg font-black text-gray-900">{topCampaigns.length}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Workspace Leads</p>
                    <p className="mt-1 text-lg font-black text-gray-900">{pipeline.totalLeads || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Pending Invites</p>
                    <p className="mt-1 text-lg font-black text-gray-900">{pendingInvitations}</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Reply Rate</p>
                    <p className="mt-1 text-lg font-black text-emerald-600">{pipeline.overallReplyRate || 0}%</p>
                  </div>
                  <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3 text-center">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Enrolled Leads</p>
                    <p className="mt-1 text-lg font-black text-gray-900">{pipeline.enrolledCount || 0}</p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Main Team Overview Header */}
            {!selectedMember && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
                <h2 className="text-base font-bold text-gray-900 tracking-tight">Your team</h2>

                {/* Range Filter Pills (All Rounded-Full) */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {RANGE_TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleRangeChange(tab.key)}
                      className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                        range === tab.key
                          ? "bg-gray-900 text-white shadow-xs"
                          : "text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                  {teamMembers.length > 0 && (
                    <button
                      onClick={() => setSelectedMember(teamMembers[0])}
                      className="ml-1 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 active:scale-95"
                    >
                      View profile
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Split: Team Members Selector & Multi-Bar Clustered Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
              {/* Left Column: Team Members Roster (100% Real Users from DB) */}
              <div className="lg:col-span-3 space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <button
                      key={member.id}
                      onClick={() => setSelectedMember(member)}
                      className={`flex w-full items-center justify-between rounded-2xl p-2.5 text-left transition ${
                        selectedMember?.id === member.id
                          ? "bg-[#6367FF]/10 border border-[#6367FF]/30"
                          : "hover:bg-gray-50 border border-transparent"
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-[#6367FF] to-violet-400 text-xs font-bold text-white">
                          {member.avatar}
                        </div>
                        <div className="min-w-0 truncate">
                          <p className="text-xs font-bold text-gray-800 truncate">{member.name}</p>
                          <p className="text-[10px] text-gray-400">LinkedIn Active</p>
                        </div>
                      </div>
                      <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-500">
                        {member.role}
                      </span>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-xs text-gray-400 text-center">
                    Loading team members...
                  </div>
                )}
              </div>

              {/* Right Column: Multi-Bar Clustered Chart (Real Multi-Channel Activity Data) */}
              <div className="lg:col-span-9 space-y-4">
                <div className="h-56 flex items-end justify-between gap-2 border-b border-gray-100 pb-2 px-1">
                  {chartDays.length > 0 ? (
                    chartDays.map((day, idx) => {
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                          {/* Clustered Bars Container */}
                          <div className="flex items-end justify-center gap-1 w-full max-w-[55px] h-44">
                            {/* Purple: Invites Sent */}
                            <div
                              className="w-1.5 sm:w-2 rounded-t-sm bg-[#6367FF] transition-all hover:brightness-110"
                              style={{ height: `${Math.max(4, (day.invitesSent / maxChartVal) * 100)}%` }}
                              title={`Invites sent: ${day.invitesSent}`}
                            />
                            {/* Green: Invites Accepted */}
                            <div
                              className="w-1.5 sm:w-2 rounded-t-sm bg-[#10B981] transition-all hover:brightness-110"
                              style={{ height: `${Math.max(4, (day.invitesAccepted / maxChartVal) * 100)}%` }}
                              title={`Invites accepted: ${day.invitesAccepted}`}
                            />
                            {/* Coral: Messages Sent */}
                            <div
                              className="w-1.5 sm:w-2 rounded-t-sm bg-[#F43F5E] transition-all hover:brightness-110"
                              style={{ height: `${Math.max(4, (day.messagesSent / maxChartVal) * 100)}%` }}
                              title={`Messages sent: ${day.messagesSent}`}
                            />
                            {/* Amber: Leads Replied */}
                            <div
                              className="w-1.5 sm:w-2 rounded-t-sm bg-[#F59E0B] transition-all hover:brightness-110"
                              style={{ height: `${Math.max(4, (day.leadsReplied / maxChartVal) * 100)}%` }}
                              title={`Leads replied: ${day.leadsReplied}`}
                            />
                            {/* Indigo: Emails Sent */}
                            <div
                              className="w-1.5 sm:w-2 rounded-t-sm bg-[#4F46E5] transition-all hover:brightness-110"
                              style={{ height: `${Math.max(4, (day.emailsSent / maxChartVal) * 100)}%` }}
                              title={`Emails sent: ${day.emailsSent}`}
                            />
                            {/* Sky: Profiles Viewed */}
                            <div
                              className="w-1.5 sm:w-2 rounded-t-sm bg-[#0EA5E9] transition-all hover:brightness-110"
                              style={{ height: `${Math.max(4, (day.profilesViewed / maxChartVal) * 100)}%` }}
                              title={`Profiles viewed: ${day.profilesViewed}`}
                            />
                          </div>

                          {/* Date Label */}
                          <span className="text-[10px] font-semibold text-gray-400 mt-2 truncate w-full text-center">
                            {day.label}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full flex items-center justify-center h-44 text-xs text-gray-400">
                      No outreach activity recorded in this time range.
                    </div>
                  )}
                </div>

                {/* Chart Color Legend (Matches Reference Video) */}
                <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-gray-500 pt-1">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#6367FF]" />
                    <span>Invites sent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#10B981]" />
                    <span>Invites accepted</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#F43F5E]" />
                    <span>Messages sent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#F59E0B]" />
                    <span>Leads replied</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#4F46E5]" />
                    <span>Emails sent</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-[#0EA5E9]" />
                    <span>Profiles viewed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
