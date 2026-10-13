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
  "bg-violet-500",
  "bg-red-500",
  "bg-amber-400",
  "bg-lime-300",
  "bg-pink-400",
  "bg-cyan-400",
  "bg-green-500",
];

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="text-gray-500"
    >
      <path
        d="M13.6 20H10.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17 10V10C17 7.239 14.761 5 12 5 9.239 5 7 7.239 7 10V12.504C7 12.828 6.817 13.123 6.528 13.268L6.025 13.519C5.397 13.834 5 14.476 5 15.178 5 16.202 5.83 17.032 6.854 17.032H17.146C18.17 17.032 19 16.202 19 15.178 19 14.476 18.603 13.834 17.975 13.52L17.472 13.269C17.183 13.123 17 12.828 17 12.504V10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatCard({ item }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5">
      <div className="flex items-start justify-between mb-5">
        <span className="text-[11px] uppercase tracking-wide font-medium text-gray-400">
          {item.title}
        </span>

        {item.right && (
          <span className="text-xs font-medium text-red-400">{item.right}</span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-semibold text-gray-700">
            {item.value}
          </span>

          {item.badge && (
            <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-500 text-xs font-medium">
              {item.badge}
            </span>
          )}

          {item.icon && <Info className="w-4 h-4 text-gray-400" />}
        </div>

        {item.dropdown && <ChevronDown className="w-4 h-4 text-gray-400" />}

        {item.link && (
          <button className="text-sm font-medium text-violet-500 hover:text-violet-600 transition-colors">
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
      <div className="text-[11px] uppercase tracking-wide leading-[16px] font-medium text-gray-400 whitespace-pre-line mb-4">
        {item.label}
      </div>

      <div className="text-[30px] leading-none font-semibold text-gray-700 tracking-tight">
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
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Top Header */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 mb-4 flex items-center justify-between gap-4">
        <button
          className="text-2xl font-semibold tracking-tight"
          style={{
            background:
              "linear-gradient(90deg, rgb(238, 122, 238) 0%, rgb(254, 155, 133) 100%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          ← Back to Team
        </button>

        <button className="p-2 transition-colors rounded-full hover:ring bg-gray-100 hover:ring-gray-200 ">
          <BellIcon />
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 mb-4 px-6">
        <nav className="flex">
          {[
            { key: "profile", label: "My Profile" },
            { key: "members", label: "Members" },
          ].map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${
                tab === t.key
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              {t.label}
            </button>
          ))}
        </nav>
      </div>

      {tab === "members" && <MembersTab currentRole={me?.role || "member"} />}

      {tab === "profile" && (
      <>
      {/* Profile Section */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        <div className="p-6">
          {/* Top */}
          <div className="flex items-start justify-between gap-6">
            {/* Left */}
            <div className="flex items-center gap-4">
              <img
                alt="avatar"
                className="w-14 h-14 rounded-full object-cover"
                src={
                  profile?.user?.avatarUrl ||
                  me?.user?.avatarUrl ||
                  "https://lh3.googleusercontent.com/a/ACg8ocIu5efqnnF2BwfGfEdCH5P-uuTyrrlV2bMuJhHpUs5SSFne_zwl=s96-c"
                }
              />

              <div className="flex items-center gap-2">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-700 tracking-tight">
                    {profile?.user?.name || me?.user?.name || "Redoy Al Hasan"}
                  </h1>
                  {profile?.user?.headline && (
                    <p className="text-xs text-gray-400 mt-0.5">{profile.user.headline}</p>
                  )}
                </div>

                <button
                  onClick={() => setEditModalOpen(true)}
                  title="Edit profile & LinkedIn link"
                  className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
                >
                  <Pencil className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  const url = profile?.user?.linkedinUrl;
                  if (url) {
                    window.open(url, "_blank", "noopener,noreferrer");
                  } else {
                    setEditModalOpen(true);
                  }
                }}
                className="h-11 px-5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-600"
              >
                View on LinkedIn
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={() => {
                  if (profile?.isLinkedInConnected) {
                    window.location.href = "/dashboard/settings?tab=Integrations";
                  } else {
                    window.location.href = "/api/integrations/unipile/connect";
                  }
                }}
                className="h-11 px-7 rounded-full text-sm font-medium text-white transition-all duration-200 shadow-xs"
                style={{
                  background: "linear-gradient(to right, #7f64f5, #ae79f8)",
                }}
              >
                {profile?.isLinkedInConnected ? "Connected ✓" : "Sign in →"}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            {statsData.map((item, index) => (
              <StatCard key={index} item={item} />
            ))}
          </div>

          {/* Overview */}
          <div className="grid grid-cols-6 border border-gray-100 rounded-xl overflow-hidden mt-4">
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
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden mt-4">
        <div className="p-6">
          {/* Toolbar */}
          <div className="flex items-center justify-between gap-4 mb-8">
            <h2 className="text-full font-semibold text-gray-700 tracking-tight">
              Activity
            </h2>

            <div className="flex items-center gap-3">
              {/* Tabs */}
              <div className="flex items-center border border-gray-100 rounded-full overflow-hidden bg-white">
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
                    className={`px-4 h-11 text-sm font-medium transition-colors border-r border-gray-100 last:border-r-0 ${
                      activeRange === t.key
                        ? "bg-gray-50 text-gray-700"
                        : "text-gray-400 hover:bg-gray-50"
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              {/* Filter */}
              <button className="h-11 px-4 rounded-full border border-gray-200 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium text-gray-500">
                All campaigns
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Export */}
              <button
                onClick={handleExportActivity}
                className="h-11 px-5 rounded-full border border-violet-200 bg-white hover:bg-violet-50 transition-colors flex items-center gap-2 text-sm font-medium text-violet-500"
              >
                Export
                <Download className="w-4 h-4" />
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
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-xs text-white"
        style={{
          background: "linear-gradient(to right, #7f64f5, #ae79f8)",
        }}
      >
        <Mail className="w-5 h-5" />

        <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-400 text-[10px] flex items-center justify-center">
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
