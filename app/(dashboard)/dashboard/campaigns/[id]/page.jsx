"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Play,
  Pause,
  Download,
  Sliders,
  BarChart3,
  Users,
  Activity,
  Loader2,
  RefreshCw,
  Clock,
  FlaskConical,
  Zap,
} from "lucide-react";
import CampaignAnalyticsTab from "./CampaignAnalyticsTab";
import CampaignLeadsTab from "./CampaignLeadsTab";
import CampaignActivityTab from "./CampaignActivityTab";
import CampaignQueueTab from "./CampaignQueueTab";
import CampaignSimulatorModal from "./CampaignSimulatorModal";

const TABS = [
  { id: "analytics", label: "Analytics Overview", icon: BarChart3 },
  { id: "leads", label: "Enrolled Leads", icon: Users },
  { id: "activity", label: "Activity Audit", icon: Activity },
  { id: "queue", label: "Execution Queue", icon: Clock },
];

export default function CampaignCommandCenterPage({ params }) {
  const unwrappedParams = use(params);
  const campaignId = unwrappedParams.id;

  const [activeTab, setActiveTab] = useState("analytics");
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [statusToggling, setStatusToggling] = useState(false);
  const [simulatorOpen, setSimulatorOpen] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchToast, setDispatchToast] = useState(null);

  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/analytics`);
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.error("Failed to load campaign analytics:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [campaignId]);

  useEffect(() => {
    let ignore = false;
    fetch(`/api/campaigns/${campaignId}/analytics`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) {
          setAnalytics(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load campaign analytics:", err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [campaignId]);

  const toggleCampaignStatus = async () => {
    if (!analytics || statusToggling) return;
    setStatusToggling(true);

    const currentStatus = analytics.campaign.status;
    const nextStatus = currentStatus === "active" ? "paused" : "active";

    try {
      const res = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setAnalytics((prev) => ({
          ...prev,
          campaign: { ...prev.campaign, status: nextStatus },
        }));
      }
    } catch (err) {
      console.error("Failed to toggle campaign status:", err);
    } finally {
      setStatusToggling(false);
    }
  };

  const downloadCsv = () => {
    window.location.href = `/api/campaigns/${campaignId}/export`;
  };

  const triggerManualDispatch = async () => {
    if (dispatching) return;
    setDispatching(true);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/dispatch`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ maxJobs: 25 }),
      });
      const data = await res.json();
      if (res.ok) {
        setDispatchToast(
          `Dispatched ${data.processed} jobs (${data.succeeded} succeeded, ${data.failed} failed, ${data.rateLimited || 0} rate-limited)`
        );
        setTimeout(() => setDispatchToast(null), 6000);
        fetchAnalytics();
      } else {
        setDispatchToast(data.message || "Dispatch failed");
        setTimeout(() => setDispatchToast(null), 6000);
      }
    } catch (err) {
      console.error("Dispatch error:", err);
      setDispatchToast("An unexpected error occurred while dispatching jobs.");
      setTimeout(() => setDispatchToast(null), 6000);
    } finally {
      setDispatching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        <span className="text-xs text-gray-400 font-medium">Loading Campaign Command Center...</span>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-500">Campaign not found or error loading data.</p>
        <Link
          href="/dashboard/campaigns"
          className="px-4 py-2 bg-violet-600 text-white rounded-xl text-xs font-semibold"
        >
          Back to Campaigns
        </Link>
      </div>
    );
  }

  const campaign = analytics.campaign;
  const isActive = campaign.status === "active";
  const isPaused = campaign.status === "paused";
  const isDraft = campaign.status === "draft";

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6 space-y-6">
      {/* 1. Header & Quick Controls Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Breadcrumb & Title */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Link
              href="/dashboard/campaigns"
              className="hover:text-gray-600 flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Campaigns
            </Link>
            <span>/</span>
            <span className="text-gray-600 font-medium">{campaign.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">{campaign.name}</h1>

            {/* Status Badge */}
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active
              </span>
            ) : isPaused ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Paused
              </span>
            ) : isDraft ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-600">
                Draft
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-600">
                {campaign.status}
              </span>
            )}
          </div>
        </div>

        {/* Right: Actions Bar */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Refresh Button */}
          <button
            onClick={() => {
              setRefreshing(true);
              fetchAnalytics();
            }}
            disabled={refreshing}
            className="p-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
            title="Refresh metrics"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-violet-500" : ""}`} />
          </button>

          {/* Simulate Button */}
          <button
            onClick={() => setSimulatorOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-violet-200 bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold shadow-2xs transition"
            title="Dry-run simulator (zero real sends)"
          >
            <FlaskConical className="w-3.5 h-3.5 text-violet-600" />
            <span>Simulate</span>
          </button>

          {/* Run Due Jobs Button */}
          {isActive && (
            <button
              onClick={triggerManualDispatch}
              disabled={dispatching}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition"
              title="Execute pending due jobs now"
            >
              {dispatching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Zap className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Run Due Jobs</span>
            </button>
          )}

          {/* Export CSV Button */}
          <button
            onClick={downloadCsv}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs transition"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export Leads</span>
          </button>

          {/* Edit Sequence Link */}
          <Link
            href={`/dashboard/new-campaign?id=${campaignId}&tab=2`}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs transition"
          >
            <Sliders className="w-3.5 h-3.5 text-gray-500" />
            <span>Edit Sequence</span>
          </Link>

          {/* Pause / Resume Campaign Button */}
          {(isActive || isPaused) && (
            <button
              onClick={toggleCampaignStatus}
              disabled={statusToggling}
              className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold shadow-xs transition ${
                isActive
                  ? "bg-amber-500 hover:bg-amber-600 text-white"
                  : "bg-emerald-600 hover:bg-emerald-700 text-white"
              }`}
            >
              {statusToggling ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : isActive ? (
                <Pause className="w-3.5 h-3.5 fill-current" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>{isActive ? "Pause Campaign" : "Resume Campaign"}</span>
            </button>
          )}
        </div>
      </div>

      {/* Dispatch Toast Feedback */}
      {dispatchToast && (
        <div className="p-3.5 rounded-2xl bg-violet-50 border border-violet-100 text-xs text-violet-800 flex items-center justify-between shadow-2xs animate-in fade-in">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-600 shrink-0" />
            <span>{dispatchToast}</span>
          </div>
          <button
            onClick={() => setDispatchToast(null)}
            className="text-violet-400 hover:text-violet-600 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* 2. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-200 px-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold transition border-b-2 -mb-[2px] ${
                active
                  ? "border-[#6367FF] text-[#6367FF]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
              {tab.id === "leads" && analytics.overview.totalLeads > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                  {analytics.overview.totalLeads}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Tab Contents */}
      {activeTab === "analytics" && <CampaignAnalyticsTab analytics={analytics} />}

      {activeTab === "leads" && <CampaignLeadsTab campaignId={campaignId} />}

      {activeTab === "activity" && (
        <CampaignActivityTab activities={analytics.recentActivity || []} />
      )}

      {activeTab === "queue" && (
        <CampaignQueueTab
          campaignId={campaignId}
          onTriggerDispatch={triggerManualDispatch}
          dispatching={dispatching}
        />
      )}

      {/* 4. Sequence Dispatch Simulator Modal */}
      <CampaignSimulatorModal
        campaignId={campaignId}
        isOpen={simulatorOpen}
        onClose={() => setSimulatorOpen(false)}
      />
    </div>
  );
}
