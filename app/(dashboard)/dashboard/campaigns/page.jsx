"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import BellIcon from "@/app/components/ui/BellIcon";
import ProgressBar from "@/app/components/ui/ProgressBar";
import { ToggleViolet } from "@/app/components/ui/Toggle";

function TrashIcon({ onClick }) {
  return (
    <svg
      onClick={onClick}
      className="w-5.5 h-5.5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
      />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function campaignProgress(breakdown, leadCount) {
  if (!leadCount) return [{ color: "bg-gray-200", value: 100 }];

  const segments = [];
  if (breakdown.completed) segments.push({ color: "bg-green-500", value: (breakdown.completed / leadCount) * 100 });
  if (breakdown.replied) segments.push({ color: "bg-cyan-400", value: (breakdown.replied / leadCount) * 100 });
  if (breakdown.inProgress) segments.push({ color: "bg-orange-400", value: (breakdown.inProgress / leadCount) * 100 });
  if (breakdown.pending) segments.push({ color: "bg-gray-200", value: (breakdown.pending / leadCount) * 100 });

  return segments.length ? segments : [{ color: "bg-gray-200", value: 100 }];
}

export default function CampaignPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [campaignList, setCampaignList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  const load = useCallback(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        setCampaignList(data.items || []);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const toggleCampaign = async (campaign) => {
    if (campaign.status === "active") {
      await fetch(`/api/campaigns/${campaign.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "paused" }),
      });
    } else {
      await fetch(`/api/campaigns/${campaign.id}/activate`, { method: "POST" });
    }
    load();
  };

  const deleteCampaign = async (id) => {
    setCampaignList((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
  };

  const createCampaign = async () => {
    setCreating(true);
    const res = await fetch("/api/campaigns", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: "Untitled Campaign" }),
    });
    const data = await res.json();
    setCreating(false);
    if (res.ok) router.push(`/dashboard/new-campaign?id=${data.id}`);
  };

  const filtered = campaignList.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesActive = activeOnly ? c.status === "active" : true;
    return matchesSearch && matchesActive;
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 mb-4 flex items-center justify-between gap-4">
        <h1
          className="text-2xl font-semibold"
          style={{
            background: "linear-gradient(90deg, #ee7aee 0%, #fe9b85 100%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Campaigns
        </h1>

        <button className="p-2 transition-colors rounded-full hover:ring bg-gray-100 hover:ring-gray-200 ">
          <BellIcon />
        </button>
      </div>

      {/* Toolbar + Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden ">
        {/* Toolbar */}
        <div className="grid grid-cols-[2fr_1.2fr_1.4fr_0.8fr] items-center gap-4 px-6 py-4 border-b border-gray-100">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </div>

            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>

          {/* Active Only */}
          <label className="flex items-center gap-2 text-sm text-gray-500">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={() => setActiveOnly(!activeOnly)}
              className="rounded border-gray-300 text-violet-500 focus:ring-violet-200"
            />
            Active only
          </label>

          <div className="flex-1" />

          {/* Button */}
          <button
            onClick={createCampaign}
            disabled={creating}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 shadow-xs disabled:opacity-60"
            style={{
              background: "linear-gradient(to right, #7f64f5, #ae79f8)",
            }}
          >
            {creating ? "Creating..." : "New campaign"}
          </button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1.2fr_1.4fr_0.8fr] px-6 py-3 border-b border-gray-100 bg-gray-50/70">
          <span className="text-sm font-medium text-gray-500">Overview</span>

          <span className="text-sm font-medium text-gray-500">Leads</span>

          <span className="text-sm font-medium text-gray-500">Progress</span>

          <span className="text-sm font-medium text-gray-500 text-right">
            Status
          </span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading campaigns...</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No campaigns found.
          </div>
        ) : (
          filtered.map((campaign, idx) => (
            <div
              key={campaign.id}
              className={`grid grid-cols-[2fr_1.2fr_1.4fr_0.8fr] px-6 py-5 items-center hover:bg-gray-50/60 transition-colors ${
                idx !== filtered.length - 1 ? "border-b border-gray-100" : ""
              }`}
            >
              {/* Overview */}
              <div className="pr-8">
                <button
                  onClick={() => router.push(`/dashboard/new-campaign?id=${campaign.id}`)}
                  className="text-[15px] font-semibold text-gray-600 mb-2 hover:text-[#6367FF] transition-colors text-left"
                >
                  {campaign.name}
                </button>

                <ProgressBar segments={campaignProgress(campaign.statusBreakdown, campaign.leadCount)} />

                <div className="flex gap-3 mt-2 flex-wrap text-xs text-gray-400">
                  <span>{campaign.statusBreakdown.completed} completed</span>
                  <span>{campaign.statusBreakdown.inProgress} in progress</span>
                </div>
              </div>

              {/* Leads */}
              <div className="pr-8 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">All leads</span>
                  <span className="text-[15px] font-medium text-violet-500">{campaign.leadCount}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">Channels</span>
                  <span className="text-sm font-medium text-gray-600 capitalize">
                    {campaign.channels.join(", ")}
                  </span>
                </div>
              </div>

              {/* Progress detail */}
              <div className="pr-8 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">Replied</span>
                  <span className="text-[15px] font-medium text-gray-600">{campaign.repliedCount}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">Completed</span>
                  <span className="text-[15px] font-medium text-gray-600">
                    {campaign.statusBreakdown.completed}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-3">
                  <ToggleViolet active={campaign.status === "active"} onChange={() => toggleCampaign(campaign)} />
                  <TrashIcon onClick={() => deleteCampaign(campaign.id)} />
                </div>

                <span className="text-xs text-gray-400 capitalize">{campaign.status}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
