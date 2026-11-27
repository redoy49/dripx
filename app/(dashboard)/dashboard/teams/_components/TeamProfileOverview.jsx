/* eslint-disable @next/next/no-img-element */
"use client";

import { ChevronDown, ExternalLink, Info, Pencil } from "lucide-react";

function StatCard({ item }) {
  return (
    <div className="rounded-2xl border border-gray-200/90 bg-white p-5 flex flex-col justify-between shadow-2xs hover:shadow-md transition">
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="font-semibold uppercase tracking-wider text-[10px] text-gray-400">
          {item.title}
        </span>

        {item.link && (
          <a href="/pricing" className="text-indigo-400 font-bold hover:underline">
            {item.link}
          </a>
        )}
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-900">{item.value}</span>
          {item.dropdown && <ChevronDown className="w-4 h-4 text-gray-400" />}
        </div>

        {item.badge && (
          <span className="px-2.5 py-0.5 text-[10px] rounded-full bg-emerald-50 text-emerald-600 font-bold">
            {item.badge}
          </span>
        )}

        {item.right && (
          <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
            {item.right}
            <Info className="w-3.5 h-3.5" />
          </span>
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
      <div className="text-2xl font-bold text-gray-800 tracking-tight">{item.value}</div>
    </div>
  );
}

export default function TeamProfileOverview({
  profile,
  statsData,
  overviewData,
  onEditOpen,
}) {
  const userName =
    profile?.user?.name || profile?.user?.email?.split("@")[0] || "Account";
  const avatarUrl = profile?.user?.avatarUrl || null;
  const initials = (userName || "U")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();

  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            {avatarUrl ? (
              <img
                alt={userName}
                className="w-14 h-14 rounded-full object-cover border border-gray-200/90 shadow-2xs"
                src={avatarUrl}
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white font-bold text-lg border border-gray-200/90 shadow-2xs">
                {initials}
              </div>
            )}

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-gray-900 tracking-tight">{userName}</h2>
                <button
                  onClick={onEditOpen}
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

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                const url = profile?.user?.linkedinUrl;
                if (url) window.open(url, "_blank", "noopener,noreferrer");
                else onEditOpen();
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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {statsData.map((item, index) => (
            <StatCard key={index} item={item} />
          ))}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 border border-gray-200/90 rounded-2xl bg-white shadow-2xs overflow-hidden mt-4">
          {overviewData.map((item, index) => (
            <OverviewCard key={index} item={item} border={index !== overviewData.length - 1} />
          ))}
        </div>
      </div>
    </div>
  );
}
