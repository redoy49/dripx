"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Users,
  Send,
  MessageSquare,
  ShieldCheck,
  Plus,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  RefreshCw,
  Loader2,
  Mail,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  ExternalLink,
  Flame,
  Activity,
  Layers,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

const RANGE_TABS = [
  { key: "today", label: "Today" },
  { key: "7d", label: "Last 7 Days" },
  { key: "30d", label: "Last 30 Days" },
  { key: "90d", label: "Last 90 Days" },
];

export default function DashboardPage() {
  const [range, setRange] = useState("7d");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSummary = useCallback(async (selectedRange = range) => {
    try {
      const res = await fetch(`/api/dashboard/summary?range=${selectedRange}`);
      if (res.ok) {
        const data = await res.json();
        setSummary(data);
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
    fetch(`/api/dashboard/summary?range=${range}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) {
          setSummary(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Init summary load failed:", err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [range]);

  const handleRangeChange = (newRange) => {
    setRange(newRange);
    setRefreshing(true);
    loadSummary(newRange);
  };

  const pipeline = summary?.pipeline || {};
  const outreach = summary?.outreach || {};
  const conversations = summary?.conversations || {};
  const infrastructure = summary?.infrastructure || {};
  const velocityChart = summary?.velocityChart || [];
  const topCampaigns = summary?.topCampaigns || [];
  const recentActivity = summary?.recentActivity || [];
  const alerts = summary?.alerts || [];

  return (
    <div className="min-h-screen bg-[#F8F9FC] p-6 lg:p-8 space-y-7 max-w-7xl mx-auto">
      {/* ── 1. Executive Command Header ────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-violet-100/70 text-[#6367FF] border border-violet-200">
              <span className="w-1.5 h-1.5 rounded-full bg-[#6367FF] animate-pulse" />
              {summary?.workspaceName || "Active Workspace"}
            </span>
            <span className="text-xs text-gray-400">· Executive Pulse</span>
          </div>
          <h1 className="mt-1 text-2xl font-black text-gray-900 tracking-tight sm:text-3xl">
            {getGreeting()}, {summary?.greetingName || "Leader"}!
          </h1>
          <p className="mt-1 text-xs text-gray-500">
            Real-time multi-channel outreach telemetry across Email sequences and LinkedIn flows.
          </p>
        </div>

        {/* Quick Launch Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            href="/dashboard/new-campaign"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-[#6367FF] hover:bg-[#5254e8] px-4 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95"
          >
            <Plus size={15} />
            <span>New Campaign</span>
          </Link>
          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-1.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 shadow-2xs transition active:scale-95"
          >
            <Users size={14} className="text-gray-500" />
            <span>Manage Leads</span>
          </Link>
          <Link
            href="/dashboard/inbox"
            className="relative inline-flex items-center gap-1.5 rounded-2xl bg-white border border-gray-200 hover:bg-gray-50 px-4 py-2.5 text-xs font-bold text-gray-700 shadow-2xs transition active:scale-95"
          >
            <MessageSquare size={14} className="text-[#6367FF]" />
            <span>Unified Inbox</span>
            {conversations.unreadCount > 0 && (
              <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {conversations.unreadCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* ── 2. Contextual System Alerts ────────────────────────────────────── */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.id}
              className={`flex items-center justify-between p-4 rounded-2xl border text-xs shadow-2xs transition ${
                alert.type === "danger"
                  ? "bg-rose-50 border-rose-200 text-rose-800"
                  : alert.type === "warning"
                    ? "bg-amber-50 border-amber-200 text-amber-800"
                    : "bg-violet-50 border-violet-200 text-violet-800"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {alert.type === "danger" ? (
                  <AlertCircle size={16} className="text-rose-600 shrink-0" />
                ) : alert.type === "warning" ? (
                  <AlertTriangle size={16} className="text-amber-600 shrink-0" />
                ) : (
                  <CheckCircle2 size={16} className="text-[#6367FF] shrink-0" />
                )}
                <div className="min-w-0">
                  <span className="font-bold">{alert.title}</span> —{" "}
                  <span className="opacity-90">{alert.message}</span>
                </div>
              </div>
              <Link
                href={alert.href}
                className="shrink-0 ml-3 font-bold underline hover:opacity-80 text-xs"
              >
                {alert.actionText} →
              </Link>
            </div>
          ))}
        </div>
      )}

      {/* ── 3. Time Range Filter Strip ────────────────────────────────────── */}
      <div className="flex items-center justify-between border-b border-gray-200/70 pb-3">
        <div className="flex items-center gap-1.5 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/60">
          {RANGE_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => handleRangeChange(tab.key)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                range === tab.key
                  ? "bg-white text-gray-900 shadow-2xs border border-gray-100"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => {
            setRefreshing(true);
            loadSummary();
          }}
          title="Refresh dashboard metrics"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 transition shadow-2xs"
        >
          <RefreshCw size={13} className={refreshing ? "animate-spin text-[#6367FF]" : ""} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-28 text-center text-xs text-gray-400 space-y-3">
          <Loader2 size={28} className="animate-spin text-[#6367FF]" />
          <p className="font-semibold text-gray-500">Aggregating multi-channel telemetry...</p>
        </div>
      ) : (
        <>
          {/* ── 4. Four Hero Executive KPI Pulse Cards ───────────────────────── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* KPI 1: Pipeline Conversion & Leads */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-2xs space-y-3 transition hover:shadow-xs hover:border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Lead Pipeline
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-[#6367FF]">
                  <Users size={17} />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-gray-900 tracking-tight">
                  {pipeline.totalLeads?.toLocaleString() || 0}
                </span>
                <span className="text-xs font-bold text-gray-400 ml-1.5">Total Leads</span>
              </div>
              <div className="pt-1 text-xs text-gray-500 flex justify-between border-t border-gray-50">
                <span>
                  <strong className="text-gray-800">{pipeline.enrolledCount || 0}</strong> active in sequence
                </span>
                <span className="font-bold text-emerald-600">
                  {pipeline.overallReplyRate || 0}% Reply Rate
                </span>
              </div>
            </div>

            {/* KPI 2: Multi-Channel Outreach Volume */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-2xs space-y-3 transition hover:shadow-xs hover:border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Outreach Volume
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <Send size={16} />
                </div>
              </div>
              <div>
                <span className="text-3xl font-black text-gray-900 tracking-tight">
                  {outreach.totalTouches?.toLocaleString() || 0}
                </span>
                <span className="text-xs font-bold text-gray-400 ml-1.5">Touches Dispatched</span>
              </div>
              <div className="pt-1 text-xs text-gray-500 flex justify-between border-t border-gray-50">
                <span className="flex items-center gap-1 text-gray-700 font-medium">
                  <Mail size={12} className="text-[#6367FF]" />
                  <span>{outreach.emailsSent || 0}</span>
                  <span className="text-gray-300">·</span>
                  <FaLinkedin className="text-[#0A66C2] text-xs" />
                  <span>{(outreach.linkedinMessages || 0) + (outreach.connectionRequests || 0)}</span>
                </span>
                <span className="font-semibold text-gray-400">
                  {outreach.inboundRepliesCount || 0} Replies
                </span>
              </div>
            </div>

            {/* KPI 3: Unified Conversations & Inbox */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-2xs space-y-3 transition hover:shadow-xs hover:border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Unified Inbox
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <MessageSquare size={16} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900 tracking-tight">
                  {conversations.totalConversations || 0}
                </span>
                {conversations.unreadCount > 0 ? (
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-600 border border-rose-200">
                    {conversations.unreadCount} unread
                  </span>
                ) : (
                  <span className="text-xs font-medium text-emerald-600">All read</span>
                )}
              </div>
              <div className="pt-1 text-xs text-gray-500 flex justify-between border-t border-gray-50">
                <span>{conversations.emailConversations || 0} Email threads</span>
                <span>{conversations.linkedinConversations || 0} LinkedIn threads</span>
              </div>
            </div>

            {/* KPI 4: Deliverability & Infrastructure Radar */}
            <div className="rounded-3xl border border-gray-100 bg-white p-5 shadow-2xs space-y-3 transition hover:shadow-xs hover:border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Deliverability Health
                </span>
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <ShieldCheck size={18} />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-gray-900 tracking-tight">
                  {infrastructure.averageDnsScore || 100}%
                </span>
                <span className="text-xs font-bold text-emerald-600">
                  {infrastructure.averageDnsScore >= 90 ? "Optimal" : "Attention"}
                </span>
              </div>
              <div className="pt-1 text-xs text-gray-500 flex justify-between border-t border-gray-50">
                <span>
                  <strong className="text-gray-800">{infrastructure.totalMailboxes || 0}</strong> mailboxes
                </span>
                <span className="font-semibold text-gray-600">
                  {infrastructure.totalDailyCapacity || 40} cap/day
                </span>
              </div>
            </div>
          </div>

          {/* ── 5. Multi-Channel Activity Velocity Chart ────────────────────── */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-2xs space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Multi-Channel Outreach Velocity & Response Flow
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  Volume of outbound touches and incoming prospect responses over time.
                </p>
              </div>
              {/* Legend */}
              <div className="flex items-center gap-4 text-xs font-semibold">
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6367FF]" />
                  <span>Cold Email</span>
                </span>
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#0A66C2]" />
                  <span>LinkedIn Outreach</span>
                </span>
                <span className="flex items-center gap-1.5 text-gray-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <span>Inbound Replies</span>
                </span>
              </div>
            </div>

            {/* Custom SVG Bar / Trend Chart */}
            {velocityChart.length === 0 ? (
              <div className="py-16 text-center text-xs text-gray-400">
                No activity logs recorded in this time range.
              </div>
            ) : (
              <div className="overflow-x-auto pt-4">
                <div className="min-w-[620px]">
                  <div className="h-48 flex items-end gap-3 sm:gap-4 px-2 border-b border-gray-100">
                    {(() => {
                      const maxVal = Math.max(
                        ...velocityChart.map((d) => Math.max(d.emails, d.linkedin, d.replies, 1)),
                      );

                      return velocityChart.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center h-full justify-end group">
                          {/* Value tooltip hover indicator */}
                          <div className="opacity-0 group-hover:opacity-100 transition text-[10px] font-bold bg-gray-900 text-white rounded-md px-1.5 py-0.5 mb-1 pointer-events-none whitespace-nowrap">
                            E:{d.emails} · L:{d.linkedin} · R:{d.replies}
                          </div>

                          {/* Bars container */}
                          <div className="w-full max-w-[42px] flex items-end justify-center gap-1 h-36">
                            {/* Email bar */}
                            <div
                              className="w-2.5 rounded-t-md bg-[#6367FF] transition-all duration-300"
                              style={{ height: `${Math.max(4, (d.emails / maxVal) * 100)}%` }}
                              title={`Email: ${d.emails}`}
                            />
                            {/* LinkedIn bar */}
                            <div
                              className="w-2.5 rounded-t-md bg-[#0A66C2] transition-all duration-300"
                              style={{ height: `${Math.max(4, (d.linkedin / maxVal) * 100)}%` }}
                              title={`LinkedIn: ${d.linkedin}`}
                            />
                            {/* Replies bar */}
                            <div
                              className="w-2.5 rounded-t-md bg-emerald-500 transition-all duration-300"
                              style={{ height: `${Math.max(4, (d.replies / maxVal) * 100)}%` }}
                              title={`Replies: ${d.replies}`}
                            />
                          </div>

                          <span className="text-[11px] font-semibold text-gray-400 mt-2 truncate w-full text-center">
                            {d.label}
                          </span>
                        </div>
                      ));
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── 6. Bottom Split: Active Campaigns & Live Activity Feed ───────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Active Campaigns Command Center */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Active Campaigns</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Top performing outreach journeys</p>
                </div>
                <Link
                  href="/dashboard/campaigns"
                  className="text-xs font-bold text-[#6367FF] hover:underline flex items-center gap-1"
                >
                  <span>View All</span>
                  <ArrowRight size={13} />
                </Link>
              </div>

              {topCampaigns.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl p-6">
                  <p className="font-semibold text-gray-600">No campaigns launched yet</p>
                  <p className="mt-1">Create an automated sequence to begin dispatching leads.</p>
                  <Link
                    href="/dashboard/new-campaign"
                    className="inline-flex items-center gap-1 mt-3 text-xs font-bold text-[#6367FF] hover:underline"
                  >
                    + Create first campaign
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {topCampaigns.map((camp) => (
                    <Link
                      key={camp.id}
                      href={`/dashboard/campaigns/${camp.id}`}
                      className="block p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-violet-50/30 hover:border-violet-100 transition shadow-2xs group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-gray-800 group-hover:text-[#6367FF] transition truncate max-w-[200px]">
                            {camp.name}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              camp.status === "active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {camp.status}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600">
                          {camp.replyRate}% Reply
                        </span>
                      </div>

                      {/* Progress Bar & Substats */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-gray-500">
                          <span className="flex items-center gap-1.5 text-gray-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" />
                            <span>{camp.totalLeads} Leads</span>
                          </span>
                          <span>{camp.progressPct}% complete</span>
                        </div>
                        <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-linear-to-r from-[#6367FF] to-violet-400 transition-all"
                            style={{ width: `${camp.progressPct}%` }}
                          />
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Live Outreach Activity Stream */}
            <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-2xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-gray-900">Live Outreach Stream</h3>
                  <p className="text-xs text-gray-400 mt-0.5">Real-time dispatches and lead events</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-gray-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Real-time</span>
                </div>
              </div>

              {recentActivity.length === 0 ? (
                <div className="py-12 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl p-6">
                  No activity logs recorded yet. Once campaigns start dispatching, live touches will appear here.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentActivity.map((act) => {
                    const isEmail = act.channel === "email";
                    return (
                      <div
                        key={act.id}
                        className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-white transition shadow-2xs text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${
                              isEmail ? "bg-violet-100 text-[#6367FF]" : "bg-blue-100 text-[#0A66C2]"
                            }`}
                          >
                            {isEmail ? <Mail size={15} /> : <FaLinkedin size={15} />}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-gray-800 truncate">
                              {act.label} →{" "}
                              <span className="text-[#6367FF] font-semibold">{act.leadName}</span>
                            </p>
                            <p className="text-[11px] text-gray-400 truncate">
                              Campaign: {act.campaignName}
                            </p>
                          </div>
                        </div>

                        <span className="shrink-0 text-[11px] text-gray-400 font-medium ml-2">
                          {act.occurredAt
                            ? new Date(act.occurredAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })
                            : "Just now"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
