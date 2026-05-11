"use client";

import { useState } from "react";

const campaigns = [
  {
    id: 1,
    name: "CMO - United States",
    allLeads: 0,
    listsOfLeads: 1,
    acceptanceRate: "0%",
    acceptanceCount: null,
    responseRate: "0%",
    responseCount: null,
    active: true,
    date: "Dec 19, 2024",
    totalSlots: 1000,
    progress: [{ color: "bg-purple-400", value: 100 }],
    progressLabels: [{ value: 1000, color: "text-gray-400" }],
  },
  {
    id: 2,
    name: "Engagement with Dripify - Marketing",
    allLeads: 1217,
    listsOfLeads: 3,
    acceptanceRate: "40.7%",
    acceptanceCount: 48,
    responseRate: "0.8%",
    responseCount: 1,
    active: true,
    date: "Aug 29, 2024",
    progress: [
      { color: "bg-green-500", value: 25 },
      { color: "bg-yellow-400", value: 6 },
      { color: "bg-red-400", value: 1 },
      { color: "bg-red-300", value: 68 },
    ],
    progressLabels: [
      { value: 304, color: "text-green-600" },
      { value: 70, color: "text-yellow-500" },
      { value: 11, color: "text-red-500" },
      { value: 832, color: "text-red-300" },
    ],
  },
  {
    id: 3,
    name: "Engagement with Dripify - Sales",
    allLeads: 2500,
    listsOfLeads: 3,
    acceptanceRate: "6.3%",
    acceptanceCount: 13,
    responseRate: "0%",
    responseCount: null,
    active: true,
    date: "Aug 23, 2024",
    progress: [
      { color: "bg-green-500", value: 54 },
      { color: "bg-red-400", value: 3 },
      { color: "bg-red-300", value: 43 },
    ],
    progressLabels: [
      { value: 1345, color: "text-green-600" },
      { value: 75, color: "text-red-500" },
      { value: 1080, color: "text-red-300" },
    ],
  },
  {
    id: 4,
    name: "Lead Generation - United States",
    allLeads: 1969,
    listsOfLeads: 23,
    acceptanceRate: "41.2%",
    acceptanceCount: 28,
    responseRate: "17.2%",
    responseCount: 15,
    active: true,
    date: "Aug 23, 2024",
    progress: [
      { color: "bg-green-500", value: 71 },
      { color: "bg-yellow-400", value: 1 },
      { color: "bg-orange-400", value: 14 },
      { color: "bg-orange-200", value: 13 },
      { color: "bg-red-300", value: 2 },
    ],
    progressLabels: [
      { value: 1407, color: "text-green-600" },
      { value: 15, color: "text-yellow-500" },
      { value: 283, color: "text-orange-500" },
      { value: 264, color: "text-orange-300" },
      { value: 35, color: "text-red-400" },
    ],
  },
  {
    id: 5,
    name: "Head of Marketing - United States",
    allLeads: 1098,
    listsOfLeads: 2,
    acceptanceRate: "10%",
    acceptanceCount: 2,
    responseRate: "0%",
    responseCount: null,
    active: true,
    date: "Aug 23, 2024",
    progress: [
      { color: "bg-green-500", value: 14 },
      { color: "bg-red-400", value: 1 },
      { color: "bg-red-300", value: 85 },
    ],
    progressLabels: [
      { value: 151, color: "text-green-600" },
      { value: 15, color: "text-red-500" },
      { value: 932, color: "text-red-300" },
    ],
  },
  {
    id: 6,
    name: "Startup Outreach - Europe",
    allLeads: 842,
    listsOfLeads: 4,
    acceptanceRate: "22%",
    acceptanceCount: 18,
    responseRate: "5.4%",
    responseCount: 5,
    active: true,
    date: "Jan 10, 2025",
    progress: [
      { color: "bg-green-500", value: 40 },
      { color: "bg-yellow-400", value: 10 },
      { color: "bg-red-300", value: 50 },
    ],
    progressLabels: [
      { value: 336, color: "text-green-600" },
      { value: 84, color: "text-yellow-500" },
      { value: 422, color: "text-red-300" },
    ],
  },
  {
    id: 7,
    name: "Startup Outreach - Europe",
    allLeads: 842,
    listsOfLeads: 4,
    acceptanceRate: "22%",
    acceptanceCount: 18,
    responseRate: "5.4%",
    responseCount: 5,
    active: true,
    date: "Jan 10, 2025",
    progress: [
      { color: "bg-green-500", value: 40 },
      { color: "bg-yellow-400", value: 10 },
      { color: "bg-red-300", value: 50 },
    ],
    progressLabels: [
      { value: 336, color: "text-green-600" },
      { value: 84, color: "text-yellow-500" },
      { value: 422, color: "text-red-300" },
    ],
  },
];

function ProgressBar({ segments }) {
  return (
    <div className="flex w-full h-1.5 rounded-full overflow-hidden gap-px">
      {segments.map((seg, i) => (
        <div
          key={i}
          className={`${seg.color} h-full`}
          style={{ width: `${seg.value}%` }}
        />
      ))}
    </div>
  );
}

function Toggle({ active, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`relative inline-flex h-5.5 w-11 items-center rounded-full transition-colors duration-200 ${
        active ? "bg-violet-500" : "bg-gray-200"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          active ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

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

function SearchIcon() {
  return (
    <svg
      className="w-4 h-4 text-gray-400"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export default function CampaignPage() {
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(false);
  const [campaignList, setCampaignList] = useState(campaigns);

  const toggleCampaign = (id) => {
    setCampaignList((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c)),
    );
  };

  const deleteCampaign = (id) => {
    setCampaignList((prev) => prev.filter((c) => c.id !== id));
  };

  const filtered = campaignList.filter((c) => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());

    const matchesActive = activeOnly ? c.active : true;

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
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 shadow-xs"
            style={{
              background: "linear-gradient(to right, #7f64f5, #ae79f8)",
            }}
          >
            New campaign
          </button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[2fr_1.2fr_1.4fr_0.8fr] px-6 py-3 border-b border-gray-100 bg-gray-50/70">
          <span className="text-sm font-medium text-gray-500">Overview</span>

          <span className="text-sm font-medium text-gray-500">Leads</span>

          <span className="text-sm font-medium text-gray-500">LinkedIn</span>

          <span className="text-sm font-medium text-gray-500 text-right">
            Status
          </span>
        </div>

        {/* Rows */}
        {filtered.length === 0 ? (
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
                <div className="text-[15px] font-semibold text-gray-600 mb-2">
                  {campaign.name}
                </div>

                <ProgressBar segments={campaign.progress} />

                <div className="flex gap-3 mt-2 flex-wrap">
                  {campaign.progressLabels.map((lbl, i) => (
                    <span
                      key={i}
                      className={`text-xs font-medium ${lbl.color}`}
                    >
                      {lbl.value}
                    </span>
                  ))}
                </div>
              </div>

              {/* Leads */}
              <div className="pr-8 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">All leads</span>

                  <span className="text-[15px] font-medium text-violet-500">
                    {campaign.allLeads === 0
                      ? "0"
                      : campaign.allLeads.toLocaleString()}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">Lists of leads</span>

                  <span className="text-[15px] font-medium text-violet-500">
                    {campaign.listsOfLeads}
                  </span>
                </div>
              </div>

              {/* LinkedIn */}
              <div className="pr-8 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">Acceptance rate</span>

                  <div className="flex items-center gap-4">
                    <span className="text-[15px] font-medium text-gray-600">
                      {campaign.acceptanceRate}
                    </span>

                    {campaign.acceptanceCount && (
                      <span className="text-sm font-medium text-violet-500">
                        {campaign.acceptanceCount}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-sm text-gray-500">Response rate</span>

                  <div className="flex items-center gap-4">
                    <span className="text-[15px] font-medium text-gray-600">
                      {campaign.responseRate}
                    </span>

                    {campaign.responseCount && (
                      <span className="text-sm font-medium text-violet-500">
                        {campaign.responseCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status */}
              <div className="flex flex-col items-end gap-3">
                <div className="flex items-center gap-3">
                  <Toggle
                    active={campaign.active}
                    onChange={() => toggleCampaign(campaign.id)}
                  />

                  <TrashIcon onClick={() => deleteCampaign(campaign.id)} />
                </div>

                <span className="text-xs text-gray-400">{campaign.date}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
