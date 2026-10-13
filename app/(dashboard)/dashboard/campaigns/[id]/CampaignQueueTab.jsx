"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Clock,
  Play,
  CheckCircle2,
  AlertCircle,
  RotateCw,
  Search,
  RefreshCw,
  Loader2,
  Mail,
  Zap,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

function formatRelativeTime(dateString) {
  if (!dateString) return "Immediate";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = date - now;

  if (diffMs <= 0) return "Due Now";

  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 60) return `In ${diffMins}m`;
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) return `In ${diffHours}h`;
  const diffDays = Math.round(diffHours / 24);
  return `In ${diffDays}d`;
}

function getChannelIcon(channel) {
  if (channel === "linkedin") return FaLinkedin;
  if (channel === "email") return Mail;
  return Zap;
}

const STATUS_FILTERS = [
  { key: "all", label: "All Jobs" },
  { key: "queued", label: "Queued" },
  { key: "done", label: "Completed" },
  { key: "failed", label: "Failed" },
  { key: "skipped", label: "Skipped" },
];

export default function CampaignQueueTab({ campaignId, onTriggerDispatch, dispatching }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ counts: {}, items: [] });
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [retryingId, setRetryingId] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      const query = new URLSearchParams();
      if (statusFilter !== "all") query.set("status", statusFilter);
      const res = await fetch(`/api/campaigns/${campaignId}/jobs?${query.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (err) {
      console.error("Failed to load campaign jobs:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [campaignId, statusFilter]);

  useEffect(() => {
    let ignore = false;
    const query = new URLSearchParams();
    if (statusFilter !== "all") query.set("status", statusFilter);

    fetch(`/api/campaigns/${campaignId}/jobs?${query.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (!ignore) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load campaign jobs:", err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [campaignId, statusFilter]);

  const handleRetryJob = async (jobId) => {
    if (retryingId) return;
    setRetryingId(jobId);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/jobs/${jobId}/retry`, {
        method: "POST",
      });
      if (res.ok) {
        await fetchJobs();
      }
    } catch (err) {
      console.error("Failed to retry job:", err);
    } finally {
      setRetryingId(null);
    }
  };

  const counts = data.counts || { queued: 0, processing: 0, done: 0, failed: 0, skipped: 0, total: 0 };
  const filteredItems = (data.items || []).filter((job) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const name = `${job.lead?.firstName || ""} ${job.lead?.lastName || ""}`.toLowerCase();
    const email = (job.lead?.email || "").toLowerCase();
    const step = (job.stepTitle || "").toLowerCase();
    return name.includes(q) || email.includes(q) || step.includes(q);
  });

  return (
    <div className="space-y-6">
      {/* 1. Queue Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Queued Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Queued Steps
            </span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{counts.queued || 0}</span>
            <span className="text-xs font-medium text-gray-500">pending execution</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Scheduled for upcoming execution cycles</p>
        </div>

        {/* Processing Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              In-Flight Active
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Loader2 className={`w-4 h-4 ${counts.processing > 0 ? "animate-spin" : ""}`} />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{counts.processing || 0}</span>
            <span className="text-xs font-medium text-gray-500">in dispatch</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Atomically claimed by runner</p>
        </div>

        {/* Completed Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Completed Steps
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{counts.done || 0}</span>
            <span className="text-xs font-medium text-emerald-600 font-semibold">success</span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Delivered and advanced in sequence</p>
        </div>

        {/* Failed / Skipped Card */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Failed & Skipped
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {(counts.failed || 0) + (counts.skipped || 0)}
            </span>
            <span className="text-xs font-medium text-rose-500">
              {counts.failed ? `${counts.failed} errors` : "0 errors"}
            </span>
          </div>
          <p className="text-[11px] text-gray-400 mt-1">Retryable on-demand with one click</p>
        </div>
      </div>

      {/* 2. Toolbar & Filters */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => {
                setLoading(true);
                setStatusFilter(f.key);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === f.key
                  ? "bg-violet-600 text-white shadow-2xs"
                  : "bg-gray-50 text-gray-600 hover:bg-gray-100"
              }`}
            >
              {f.label}
              {f.key !== "all" && counts[f.key] !== undefined ? ` (${counts[f.key]})` : ""}
            </button>
          ))}
        </div>

        {/* Right: Search, Run Button & Refresh */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search queue..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-violet-400 w-48 sm:w-56"
            />
          </div>

          <button
            onClick={() => {
              setRefreshing(true);
              fetchJobs();
            }}
            disabled={refreshing}
            className="p-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-600 transition"
            title="Refresh queue"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-violet-500" : ""}`} />
          </button>

          {onTriggerDispatch && (
            <button
              onClick={onTriggerDispatch}
              disabled={dispatching}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition"
            >
              {dispatching ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>Run Due Jobs</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Job Roster Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-2 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
            <span className="text-xs">Loading execution queue...</span>
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-xs">
            <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            No execution jobs found matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-5">Prospect</th>
                  <th className="py-3 px-5">Step & Channel</th>
                  <th className="py-3 px-5">Scheduled Run</th>
                  <th className="py-3 px-5">Attempts</th>
                  <th className="py-3 px-5">Status</th>
                  <th className="py-3 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {filteredItems.map((job, idx) => {
                  const lead = job.lead;
                  const fullName = lead
                    ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.email
                    : "Enrolled Prospect";
                  const ChannelIcon = getChannelIcon(job.type?.includes("linkedin") ? "linkedin" : job.type === "email" ? "email" : "general");
                  const isFailed = job.status === "failed";
                  const isSkipped = job.status === "skipped";
                  const isDone = job.status === "done";
                  const isProcessing = job.status === "processing";

                  return (
                    <tr
                      key={job.id ? `${job.id}-${idx}` : idx}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      {/* Prospect Info */}
                      <td className="py-3.5 px-5">
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-[180px]">
                            {fullName}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[180px]">
                            {lead?.email || lead?.company || "Lead in sequence"}
                          </p>
                        </div>
                      </td>

                      {/* Step & Channel */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-gray-100 text-gray-600">
                            <ChannelIcon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-medium text-gray-800 truncate max-w-[190px]">
                            {job.stepTitle}
                          </span>
                        </div>
                      </td>

                      {/* Scheduled Run */}
                      <td className="py-3.5 px-5">
                        <span
                          className={`inline-flex items-center gap-1 font-medium ${
                            formatRelativeTime(job.runAfter) === "Due Now"
                              ? "text-emerald-600 font-semibold"
                              : "text-gray-500"
                          }`}
                        >
                          <Clock className="w-3 h-3 text-gray-400" />
                          {formatRelativeTime(job.runAfter)}
                        </span>
                      </td>

                      {/* Attempts */}
                      <td className="py-3.5 px-5 font-medium text-gray-500">
                        {job.attempts}
                        {isFailed ? "/3" : ""}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-5">
                        {isDone ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Completed
                          </span>
                        ) : isProcessing ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                            <Loader2 className="w-2.5 h-2.5 animate-spin" />
                            Processing
                          </span>
                        ) : isFailed ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-100"
                            title={job.lastError || "Execution failed"}
                          >
                            Failed
                          </span>
                        ) : isSkipped ? (
                          <span
                            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-100"
                            title={job.lastError || "Skipped"}
                          >
                            Skipped
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-700 border border-violet-100">
                            Queued
                          </span>
                        )}
                        {job.lastError && (
                          <p className="text-[10px] text-rose-500 truncate max-w-[200px] mt-0.5">
                            {job.lastError}
                          </p>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 text-right">
                        {(isFailed || isSkipped) && (
                          <button
                            onClick={() => handleRetryJob(job.id)}
                            disabled={retryingId === job.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-[11px] font-semibold transition"
                            title="Reset to queued and retry"
                          >
                            {retryingId === job.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <RotateCw className="w-3 h-3 text-gray-500" />
                            )}
                            <span>Retry</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
