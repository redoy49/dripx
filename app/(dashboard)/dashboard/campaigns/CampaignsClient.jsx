"use client";

import { useEffect, useState, useCallback, useOptimistic, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { getCached, setCached } from "@/app/lib/swrCache";
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

export default function CampaignsClient({ initialCampaigns = null }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [campaignList, setCampaignList] = useState(() => {
    if (initialCampaigns) return initialCampaigns;
    const cached = getCached("/api/campaigns");
    return cached?.items || [];
  });
  const [loading, setLoading] = useState(() => {
    return !initialCampaigns && !getCached("/api/campaigns");
  });
  const [creating, setCreating] = useState(false);
  const [, startTransition] = useTransition();
  const skipInitialLoadRef = useRef(Boolean(initialCampaigns));

  useEffect(() => {
    if (initialCampaigns) {
      setCached("/api/campaigns", { items: initialCampaigns });
    }
  }, [initialCampaigns]);

  const [optimisticCampaigns, setOptimisticCampaigns] = useOptimistic(
    campaignList,
    (currentList, update) => {
      if (update.type === "toggle") {
        return currentList.map((c) =>
          c.id === update.id
            ? { ...c, status: c.status === "active" ? "paused" : "active" }
            : c
        );
      }
      if (update.type === "delete") {
        return currentList.filter((c) => c.id !== update.id);
      }
      return currentList;
    }
  );

  const load = useCallback(() => {
    fetch("/api/campaigns")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.items) {
          setCached("/api/campaigns", data);
          setCampaignList(data.items);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (skipInitialLoadRef.current) {
      skipInitialLoadRef.current = false;
      return;
    }
    load();
  }, [load]);

  const toggleCampaign = (campaign) => {
    startTransition(async () => {
      setOptimisticCampaigns({ type: "toggle", id: campaign.id });
      try {
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
      } catch (err) {
        console.error("Failed to toggle campaign:", err);
        load();
      }
    });
  };

  const deleteCampaign = (id) => {
    startTransition(async () => {
      setOptimisticCampaigns({ type: "delete", id });
      try {
        const res = await fetch(`/api/campaigns/${id}`, { method: "DELETE" });
        if (res.ok) {
          setCampaignList((prev) => prev.filter((c) => c.id !== id));
        } else {
          load();
        }
      } catch (err) {
        console.error("Failed to delete campaign:", err);
        load();
      }
    });
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

  const filtered = optimisticCampaigns.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesActive = activeOnly ? c.status === "active" : true;
    return matchesSearch && matchesActive;
  });

  return (
    <div className="min-h-screen bg-[#F2F2F6] p-4">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 p-4 mb-4 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
          Campaigns
        </h1>

        <button
          title="Notifications"
          className="relative flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/90 bg-white text-gray-500 shadow-2xs transition hover:bg-gray-50 active:scale-95 cursor-pointer"
        >
          <BellIcon />
        </button>
      </div>

      {/* Toolbar + Table */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
        {/* Toolbar */}
        <div className="grid grid-cols-[2fr_1.2fr_1.4fr_0.8fr] items-center gap-4 px-6 py-4 border-b border-gray-100">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </div>

            <input
              type="text"
              placeholder="Search campaigns..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs text-gray-700 bg-white border border-gray-200/90 rounded-full shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-indigo-400/40 transition"
            />
          </div>

          {/* Active Only */}
          <label className="flex items-center gap-2 text-xs font-medium text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={activeOnly}
              onChange={() => setActiveOnly(!activeOnly)}
              className="rounded-sm border-gray-300 text-indigo-400 focus:ring-indigo-400/40 cursor-pointer"
            />
            Active only
          </label>

          <div className="flex-1" />

          {/* Button */}
          <button
            onClick={createCampaign}
            disabled={creating}
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-indigo-400 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <span>{creating ? "Creating..." : "New campaign"}</span>
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
          <div className="divide-y divide-gray-100 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="grid grid-cols-[2fr_1.2fr_1.4fr_0.8fr] px-6 py-5 items-center gap-4"
              >
                {/* Overview & Progress Bar */}
                <div className="pr-8 space-y-2.5">
                  <div className="h-4 w-44 bg-gray-200/80 rounded" />
                  <div className="h-2 w-full max-w-sm bg-gray-100 rounded-full overflow-hidden flex gap-0.5">
                    <div className="h-full w-2/5 bg-emerald-200/80" />
                    <div className="h-full w-1/5 bg-cyan-200/80" />
                    <div className="h-full w-1/5 bg-orange-200/80" />
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="h-3 w-20 bg-gray-200/60 rounded" />
                    <span className="text-gray-300">·</span>
                    <div className="h-3 w-20 bg-gray-200/60 rounded" />
                    <span className="text-gray-300">·</span>
                    <div className="h-3 w-24 bg-indigo-200/70 rounded" />
                  </div>
                </div>

                {/* Leads & Channels */}
                <div className="pr-8 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-3.5 w-14 bg-gray-200/60 rounded" />
                    <div className="h-4 w-10 bg-indigo-200/80 rounded" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-3.5 w-14 bg-gray-200/60 rounded" />
                    <div className="h-3.5 w-24 bg-gray-200/70 rounded" />
                  </div>
                </div>

                {/* Progress Detail */}
                <div className="pr-8 space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-3.5 w-14 bg-gray-200/60 rounded" />
                    <div className="h-4 w-8 bg-gray-200/80 rounded" />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <div className="h-3.5 w-16 bg-gray-200/60 rounded" />
                    <div className="h-4 w-8 bg-gray-200/80 rounded" />
                  </div>
                </div>

                {/* Status Toggle & Badge */}
                <div className="flex flex-col items-end gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-9 bg-gray-200/80 rounded-full" />
                    <div className="w-5 h-5 bg-gray-100 rounded" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3.5 w-12 bg-gray-200/60 rounded" />
                    <span className="text-gray-300">·</span>
                    <div className="h-3.5 w-8 bg-gray-200/60 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                  onClick={() =>
                    router.push(
                      campaign.status === "draft"
                        ? `/dashboard/new-campaign?id=${campaign.id}`
                        : `/dashboard/campaigns/${campaign.id}`,
                    )
                  }
                  className="text-[15px] font-semibold text-gray-800 mb-2 hover:text-indigo-400 transition-colors text-left cursor-pointer"
                >
                  {campaign.name}
                </button>

                <ProgressBar segments={campaignProgress(campaign.statusBreakdown, campaign.leadCount)} />

                <div className="flex gap-2.5 mt-2.5 flex-wrap text-xs text-gray-400 items-center">
                  <span>{campaign.statusBreakdown.completed} completed</span>
                  <span>·</span>
                  <span>{campaign.statusBreakdown.inProgress} in progress</span>
                  <span>·</span>
                  <button
                    onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                    className="text-indigo-400 hover:text-indigo-500 font-semibold transition cursor-pointer"
                  >
                    View Analytics →
                  </button>
                </div>
              </div>

              {/* Leads */}
              <div className="pr-8 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">All leads</span>
                  <span className="text-[15px] font-semibold text-indigo-400">{campaign.leadCount}</span>
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

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 capitalize">{campaign.status}</span>
                  <span className="text-gray-300">·</span>
                  <button
                    onClick={() => router.push(`/dashboard/new-campaign?id=${campaign.id}&tab=2`)}
                    className="text-xs font-semibold text-gray-500 hover:text-indigo-400 transition cursor-pointer"
                    title="Edit campaign sequence in canvas"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
