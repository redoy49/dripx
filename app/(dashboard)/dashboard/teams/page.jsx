/* eslint-disable @next/next/no-img-element */
// app/teams/page.jsx
"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ChevronDown,
  Download,
  ExternalLink,
  Info,
  Mail,
  Pencil,
} from "lucide-react";
import MembersTab from "@/app/(dashboard)/dashboard/teams/MembersTab";
import EditProfileModal from "@/app/(dashboard)/dashboard/teams/EditProfileModal";

const fallbackStats = [
  {
    title: "Pricing plan",
    value: "Trial",
    badge: "Active",
  },
  {
    title: "Email finder",
    value: "XL - Monthly",
    badge: "Active",
    right: "Used: 0/1200",
    link: "Upgrade",
  },
  {
    title: "Role",
    value: "Owner",
    icon: true,
    dropdown: true,
  },
  {
    title: "Profile rating",
    value: "Expert",
  },
];

const fallbackOverview = [
  {
    label: "Unread messages",
    value: "0",
  },
  {
    label: "Active campaigns",
    value: "1",
  },
  {
    label: "Connections",
    value: "3,224",
  },
  {
    label: "Pending invites\nreceived",
    value: "6",
  },
  {
    label: "Profile views\nsince last week",
    value: "0",
  },
  {
    label: "Weekly search\nappearances",
    value: "23",
  },
];

const colors = [
  "bg-indigo-400",
  "bg-violet-400",
  "bg-sky-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-slate-400",
];

function BellIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-gray-500"
    >
      <path d="M10.268 21a2 2 0 0 0 3.464 0" />
      <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
    </svg>
  );
}

function StatCard({ item }) {
  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 shadow-2xs">
      <div className="flex items-start justify-between mb-4">
        <span className="text-[11px] uppercase tracking-wide font-bold text-gray-400">
          {item.title}
        </span>

        {item.right && (
          <span className="text-xs font-semibold text-rose-500">{item.right}</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-gray-800">
            {item.value}
          </span>

          {item.badge && (
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-500 text-xs font-bold">
              {item.badge}
            </span>
          )}

          {item.icon && <Info className="w-3.5 h-3.5 text-gray-400" />}
        </div>

        {item.dropdown && <ChevronDown className="w-4 h-4 text-gray-400" />}

        {item.link && (
          <button className="text-xs font-bold text-indigo-400 hover:text-indigo-500 transition-colors cursor-pointer">
            {item.link}
          </button>
        )}
      </div>
    </div>
  );
}

function OverviewCard({ item, border }) {
  return (
    <div className={`p-5 ${border ? "border-r border-gray-100" : ""}`}>
      <div className="text-[11px] uppercase tracking-wide leading-[16px] font-bold text-gray-400 whitespace-pre-line mb-3">
        {item.label}
      </div>

      <div className="text-2xl font-bold text-gray-800 tracking-tight">
        {item.value}
      </div>
    </div>
  );
}

export default function TeamsPage() {
  const [tab, setTab] = useState("profile");
  const [me, setMe] = useState(null);
  const [profile, setProfile] = useState(null);
  const [activeRange, setActiveRange] = useState("7");
  const [editModalOpen, setEditModalOpen] = useState(false);

  const loadProfile = useCallback((range = activeRange) => {
    fetch(`/api/team/profile?range=${range}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setProfile(data);
      });
  }, [activeRange]);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then(setMe);

    loadProfile("7");
  }, [loadProfile]);

  const handleRangeChange = (rangeKey) => {
    setActiveRange(rangeKey);
    loadProfile(rangeKey);
  };

  const handleExportActivity = () => {
    if (!profile?.activity?.length) return;
    const rows = [
      ["Date", "Connect Requests", "Direct Messages", "InMails", "Profile Visits", "Post Likes", "Follows", "Emails"],
    ];
    profile.activity.forEach((act) => {
      rows.push([
        act.dateLabel,
        act.heights[0],
        act.heights[1],
        act.heights[2],
        act.heights[3],
        act.heights[4],
        act.heights[5],
        act.heights[6],
      ]);
    });
    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `dripx_linkedin_activity_${activeRange}d.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const statsData = profile?.stats || fallbackStats;
  const overviewData = profile?.overview || fallbackOverview;
  const activityData = profile?.activity || [];

  return (
    <div className="flex flex-col min-h-screen bg-transparent p-4 sm:p-6 space-y-6">
      {/* Top Header */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 p-4 sm:p-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">
            Team & Identity
          </h1>
          <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-500">
            Workspace
          </span>
        </div>

        <button
          title="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/90 bg-white text-gray-500 shadow-2xs transition hover:bg-gray-50 active:scale-95 cursor-pointer"
        >
          <BellIcon />
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="inline-flex p-1 rounded-full border border-gray-200/90 bg-white shadow-2xs gap-1">
          {[
            { key: "profile", label: "My Profile" },
            { key: "members", label: "Members" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`rounded-full px-5 py-2 text-xs font-bold transition cursor-pointer ${
                tab === t.key
                  ? "bg-indigo-400 text-white shadow-xs"
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "members" && <MembersTab currentRole={me?.role || "member"} />}

      {tab === "profile" && (
      <>
      {/* Profile Section */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
        <div className="p-6">
          {/* Top */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left */}
            <div className="flex items-center gap-4">
              <img
                alt="avatar"
                className="w-14 h-14 rounded-full object-cover border border-gray-200/90 shadow-2xs"
                src={
                  profile?.user?.avatarUrl ||
                  me?.user?.avatarUrl ||
                  "https://lh3.googleusercontent.com/a/ACg8ocIu5efqnnF2BwfGfEdCH5P-uuTyrrlV2bMuJhHpUs5SSFne_zwl=s96-c"
                }
              />

              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-gray-900 tracking-tight">
                    {profile?.user?.name || me?.user?.name || "Redoy Al Hasan"}
                  </h2>

                  <button
                    onClick={() => setEditModalOpen(true)}
                    title="Edit profile & LinkedIn link"
                    className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-200/90 bg-white text-gray-400 hover:text-gray-700 shadow-2xs transition active:scale-95 cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
                {profile?.user?.headline && (
                  <p className="text-xs text-gray-400 mt-0.5">{profile.user.headline}</p>
                )}
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2.5 flex-wrap">
              <button
                onClick={() => {
                  const url = profile?.user?.linkedinUrl;
                  if (url) {
                    window.open(url, "_blank", "noopener,noreferrer");
                  } else {
                    setEditModalOpen(true);
                  }
                }}
                className="rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 shadow-2xs active:scale-95 transition flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                <span>View on LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => {
                  if (profile?.isLinkedInConnected) {
                    window.location.href = "/dashboard/settings?tab=Integrations";
                  } else {
                    window.location.href = "/api/integrations/unipile/connect";
                  }
                }}
                className="rounded-full bg-indigo-400 hover:bg-indigo-500 px-6 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
              >
                {profile?.isLinkedInConnected ? "Connected ✓" : "Sign in →"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            {statsData.map((item, index) => (
              <StatCard key={index} item={item} />
            ))}
          </div>

          {/* Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-gray-200/90 rounded-2xl bg-white shadow-2xs overflow-hidden mt-4">
            {overviewData.map((item, index) => (
              <OverviewCard
                key={index}
                item={item}
                border={index !== overviewData.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Activity */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
        <div className="p-6">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h2 className="text-base font-bold text-gray-900 tracking-tight">
              Outreach Activity
            </h2>

            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Tabs */}
              <div className="inline-flex p-1 rounded-full border border-gray-200/90 bg-white shadow-2xs gap-1">
                {[
                  { key: "today", label: "Today" },
                  { key: "yesterday", label: "Yesterday" },
                  { key: "7", label: "7 days" },
                  { key: "30", label: "30 days" },
                  { key: "90", label: "90 days" },
                  { key: "pick", label: "Pick dates" },
                ].map((t) => (
                  <button
                    key={t.key}
                    onClick={() => handleRangeChange(t.key)}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                      activeRange === t.key
                        ? "bg-indigo-400 text-white shadow-xs font-bold"
                        : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Filter */}
              <button className="rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 shadow-2xs active:scale-95 transition flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 cursor-pointer">
                <span>All campaigns</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Export */}
              <button
                onClick={handleExportActivity}
                className="rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 shadow-2xs active:scale-95 transition flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 cursor-pointer"
              >
                <span>Export CSV</span>
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chart */}
          <div className="relative overflow-x-auto">
            {/* Grid */}
            <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="border-t border-gray-100" />
              ))}
            </div>

            {/* Y Axis */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between pb-6 text-xs text-gray-400">
              {[150, 125, 100, 75, 50, 25, 0].map((n) => (
                <span key={n}>{n}</span>
              ))}
            </div>

            {/* Bars */}
            <div className="ml-10 min-w-[950px] h-[360px] flex items-end justify-between relative">
              {activityData.map((item, idx) => (
                <div key={idx} className="flex flex-col items-center gap-3">
                  <div className="h-[300px] flex items-end gap-1.5">
                    {item.heights.map((h, i) => (
                      <div
                        key={i}
                        className={`w-[10px] rounded-full ${colors[i]}`}
                        style={{
                          height: `${Math.min(280, h * 2)}px`,
                        }}
                      />
                    ))}
                  </div>

                  <span className="text-xs text-gray-400 font-medium">
                    {item.dateLabel}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      </>
      )}

      {/* Floating Chat */}
      <button
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full flex items-center justify-center bg-indigo-400 hover:bg-indigo-500 shadow-md text-white transition active:scale-95 cursor-pointer"
        title="Team Chat"
      >
        <Mail className="w-5 h-5" />

        <span className="absolute top-0 right-0 w-4 h-4 rounded-full bg-rose-400 text-[10px] font-bold flex items-center justify-center text-white">
          1
        </span>
      </button>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        user={profile?.user}
        onUpdated={() => loadProfile(activeRange)}
      />
    </div>
  );
}
