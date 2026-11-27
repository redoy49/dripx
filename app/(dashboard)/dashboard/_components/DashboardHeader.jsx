"use client";

import Link from "next/link";
import {
  AlertCircle,
  AlertTriangle,
  Bell,
  CheckCircle2,
  MessageSquare,
  Plus,
  RefreshCw,
  Users,
} from "lucide-react";

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export default function DashboardHeader({
  greetingName,
  unreadMessagesCount,
  creatingCampaign,
  refreshing,
  alerts = [],
  toast,
  onCreateCampaign,
  onRefresh,
}) {
  return (
    <>
      {toast && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-4 py-2 text-xs font-semibold text-emerald-800 shadow-xl animate-in fade-in duration-200">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <span>{toast}</span>
        </div>
      )}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight sm:text-3xl flex items-center gap-2">
            <span>
              {getGreeting()}, {greetingName || "User"}!
            </span>
            <span className="text-2xl">👋</span>
          </h1>
          <p className="mt-1 text-xs text-gray-400">
            Here&apos;s what&apos;s happening with your outreach and campaign flows today
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
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

          <button
            onClick={onCreateCampaign}
            disabled={creatingCampaign}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Plus size={14} />
            <span>{creatingCampaign ? "Creating..." : "New Campaign"}</span>
          </button>

          <Link
            href="/dashboard/leads"
            className="inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200/90 hover:bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <Users size={14} className="text-gray-400" />
            <span>Manage Leads</span>
          </Link>

          <Link
            href="/dashboard/inbox"
            className="relative inline-flex items-center gap-1.5 rounded-full bg-white border border-gray-200/90 hover:bg-gray-50 px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs transition active:scale-95 cursor-pointer"
          >
            <MessageSquare size={14} className="text-indigo-400" />
            <span>Unified Inbox</span>
            {unreadMessagesCount > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black bg-rose-500 text-white">
                {unreadMessagesCount}
              </span>
            )}
          </Link>

          <button
            onClick={onRefresh}
            title="Refresh dashboard metrics"
            className="flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-semibold text-gray-500 bg-white border border-gray-200/90 hover:bg-gray-50 transition shadow-2xs active:scale-95 cursor-pointer"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin text-indigo-400" : ""} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

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
                  <CheckCircle2 size={15} className="text-indigo-400 shrink-0" />
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
    </>
  );
}
