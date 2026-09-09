"use client";

import { useEffect, useState, useCallback } from "react";
import BellIcon from "@/app/components/ui/BellIcon";
import LeadSourceModal from "@/app/(dashboard)/dashboard/new-campaign/LeadSourceModal";
import LeadDetailModal from "@/app/(dashboard)/dashboard/leads/LeadDetailModal";

function TrashIcon({ onClick }) {
  return (
    <svg
      onClick={onClick}
      className="w-5 h-5 text-gray-400 hover:text-red-400 cursor-pointer transition-colors"
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

const SOURCE_LABELS = {
  manual: "Manual",
  csv_upload: "CSV upload",
  paste_urls: "Pasted URL",
  basic_search: "Basic search",
  sales_navigator: "Sales Navigator",
  recruiter_search: "Recruiter",
  event_members: "Event members",
  group_members: "Group members",
  my_network: "My network",
  inbound_webhook: "Webhook",
};

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [leads, setLeads] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [openImport, setOpenImport] = useState(false);
  const [detailId, setDetailId] = useState(null);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    fetch(`/api/leads?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setLeads(data.items || []);
        setTotal(data.total || 0);
        setLoading(false);
      });
  }, [search]);

  useEffect(() => {
    const timeout = setTimeout(load, 250);
    return () => clearTimeout(timeout);
  }, [load]);

  const deleteLead = async (id) => {
    await fetch(`/api/leads/${id}`, { method: "DELETE" });
    setLeads((prev) => prev.filter((l) => l.id !== id));
  };

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
          Leads
        </h1>

        <button className="p-2 transition-colors rounded-full hover:ring bg-gray-100 hover:ring-gray-200">
          <BellIcon />
        </button>
      </div>

      {/* Toolbar + Table */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-gray-100">
          <div className="relative flex-1 max-w-sm">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search leads"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 text-sm text-gray-700 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-200"
            />
          </div>

          <span className="text-sm text-gray-400">{total} total</span>

          <div className="flex-1" />

          <button
            onClick={() => setOpenImport(true)}
            className="px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 shadow-xs"
            style={{ background: "linear-gradient(to right, #7f64f5, #ae79f8)" }}
          >
            Import leads
          </button>
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[2.2fr_1fr_1.4fr_0.8fr_0.6fr] px-6 py-3 border-b border-gray-100 bg-gray-50/70">
          <span className="text-sm font-medium text-gray-500">Lead</span>
          <span className="text-sm font-medium text-gray-500">Source</span>
          <span className="text-sm font-medium text-gray-500">Tags</span>
          <span className="text-sm font-medium text-gray-500">Campaigns</span>
          <span className="text-sm font-medium text-gray-500 text-right">Actions</span>
        </div>

        {/* Rows */}
        {loading ? (
          <div className="py-16 text-center text-sm text-gray-400">Loading leads...</div>
        ) : leads.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-400">
            No leads found. Import some to get started.
          </div>
        ) : (
          leads.map((lead, idx) => (
            <div
              key={lead.id}
              className={`grid grid-cols-[2.2fr_1fr_1.4fr_0.8fr_0.6fr] px-6 py-4 items-center hover:bg-gray-50/60 transition-colors cursor-pointer ${
                idx !== leads.length - 1 ? "border-b border-gray-100" : ""
              }`}
              onClick={() => setDetailId(lead.id)}
            >
              <div className="flex items-center gap-3 pr-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-bold text-gray-500">
                  {(lead.firstName?.[0] || "?").toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[14px] font-semibold text-gray-700">
                    {`${lead.firstName} ${lead.lastName}`.trim() || "Unnamed lead"}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {lead.jobTitle}
                    {lead.jobTitle && lead.company ? " at " : ""}
                    {lead.company}
                  </p>
                </div>
              </div>

              <span className="text-xs font-medium text-gray-500">
                {SOURCE_LABELS[lead.source] || lead.source}
              </span>

              <div className="flex flex-wrap gap-1 pr-4">
                {(lead.tags || []).slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-violet-50 px-2 py-0.5 text-[11px] font-medium text-violet-500"
                  >
                    {tag}
                  </span>
                ))}
                {(lead.tags || []).length === 0 && <span className="text-xs text-gray-300">—</span>}
              </div>

              <span className="text-sm text-gray-500">—</span>

              <div className="flex justify-end" onClick={(e) => e.stopPropagation()}>
                <TrashIcon onClick={() => deleteLead(lead.id)} />
              </div>
            </div>
          ))
        )}
      </div>

      <LeadSourceModal
        open={openImport}
        onClose={() => setOpenImport(false)}
        campaignId={null}
        onImported={load}
      />

      <LeadDetailModal leadId={detailId} onClose={() => setDetailId(null)} onChanged={load} />
    </div>
  );
}
