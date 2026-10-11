"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import {
  Search,
  Copy,
  Check,
  Mail,
  Linkedin,
  Pause,
  Play,
  Trash2,
  ExternalLink,
  MessageSquare,
  Clock,
  Loader2,
} from "lucide-react";

const STATUS_FILTERS = [
  { key: "all", label: "All Leads" },
  { key: "in_progress", label: "In Sequence" },
  { key: "replied", label: "Replied" },
  { key: "paused", label: "Paused" },
  { key: "completed", label: "Completed" },
];

export default function CampaignLeadsTab({ campaignId }) {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [actionPendingId, setActionPendingId] = useState(null);

  const fetchLeads = useCallback(async () => {
    const query = new URLSearchParams();
    if (statusFilter !== "all") query.set("status", statusFilter);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/leads?${query.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setLeads(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load campaign leads:", err);
    } finally {
      setLoading(false);
    }
  }, [campaignId, statusFilter]);

  useEffect(() => {
    let ignore = false;
    const query = new URLSearchParams();
    if (statusFilter !== "all") query.set("status", statusFilter);

    fetch(`/api/campaigns/${campaignId}/leads?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) {
          setLeads(data.items || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load campaign leads:", err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [campaignId, statusFilter]);

  const copyToClipboard = (text, id) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const toggleLeadStatus = async (leadId, currentStatus) => {
    if (actionPendingId) return;
    setActionPendingId(leadId);

    const nextStatus = currentStatus === "paused" ? "in_progress" : "paused";

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        setLeads((prev) =>
          prev.map((e) => (e.leadId === leadId ? { ...e, status: nextStatus } : e)),
        );
      }
    } catch (err) {
      console.error("Failed to toggle lead status:", err);
    } finally {
      setActionPendingId(null);
    }
  };

  const removeLead = async (leadId) => {
    if (!confirm("Are you sure you want to remove this lead from the campaign?")) return;
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/leads/${leadId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setLeads((prev) => prev.filter((e) => e.leadId !== leadId));
      }
    } catch (err) {
      console.error("Failed to remove lead:", err);
    }
  };

  const filteredLeads = leads.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = item.lead
      ? `${item.lead.firstName || ""} ${item.lead.lastName || ""}`.toLowerCase()
      : "";
    const email = (item.lead?.email || "").toLowerCase();
    const company = (item.lead?.company || "").toLowerCase();
    return name.includes(q) || email.includes(q) || company.includes(q);
  });

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
      {/* Toolbar */}
      <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative max-w-sm w-full">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search leads by name, email, company..."
            className="w-full h-10 pl-10 pr-3.5 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300 transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          {STATUS_FILTERS.map((f) => {
            const active = statusFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  active
                    ? "bg-[#6367FF] text-white shadow-xs"
                    : "bg-gray-50 text-gray-500 hover:bg-gray-100 hover:text-gray-700"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Leads Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-xs text-gray-400 gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-violet-500" />
          <span>Loading campaign leads...</span>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="py-20 text-center text-xs text-gray-400 space-y-1">
          <p className="font-semibold text-gray-600 text-sm">No leads match criteria</p>
          <p>Try clearing your search or switching status filters.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold">
              <tr>
                <th className="py-3 px-5">Prospect</th>
                <th className="py-3 px-5">Contact Details</th>
                <th className="py-3 px-5">Current Step</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5">Enrolled</th>
                <th className="py-3 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-gray-700">
              {filteredLeads.map((item) => {
                const lead = item.lead;
                const fullName = lead
                  ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.email
                  : "Unknown Lead";
                const initials = fullName
                  .split(" ")
                  .map((n) => n[0])
                  .filter(Boolean)
                  .slice(0, 2)
                  .join("")
                  .toUpperCase() || "?";

                const isPaused = item.status === "paused";
                const isReplied = item.status === "replied";
                const isInProgress = item.status === "in_progress";

                return (
                  <tr key={item.leadId} className="hover:bg-gray-50/50 transition-colors">
                    {/* Prospect Info */}
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-violet-50 text-violet-700 font-bold flex items-center justify-center text-xs border border-violet-100 shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-900 truncate max-w-[160px]">
                            {fullName}
                          </p>
                          <p className="text-[11px] text-gray-400 truncate max-w-[160px]">
                            {lead?.jobTitle || lead?.headline || "Prospect"}
                            {lead?.company ? ` · ${lead.company}` : ""}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact Details */}
                    <td className="py-3.5 px-5">
                      <div className="space-y-1">
                        {lead?.email ? (
                          <div className="flex items-center gap-1.5 text-gray-600">
                            <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                            <span className="truncate max-w-[140px] font-medium" title={lead.email}>
                              {lead.email}
                            </span>
                            <button
                              onClick={() => copyToClipboard(lead.email, item.leadId)}
                              className="text-gray-400 hover:text-gray-700 p-0.5 rounded transition"
                              title="Copy email"
                            >
                              {copiedId === item.leadId ? (
                                <Check className="w-3 h-3 text-emerald-500" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">No email</span>
                        )}

                        {lead?.linkedinUrl && (
                          <a
                            href={lead.linkedinUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-[#0A66C2] text-[11px] hover:underline"
                          >
                            <Linkedin className="w-3 h-3" />
                            <span>LinkedIn Profile</span>
                            <ExternalLink className="w-2.5 h-2.5 opacity-70" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Current Step */}
                    <td className="py-3.5 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-gray-50 border border-gray-100 text-gray-700">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="truncate max-w-[150px]" title={item.currentStepTitle}>
                          {item.currentStepTitle}
                        </span>
                      </span>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-5">
                      {isReplied ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          Replied
                        </span>
                      ) : isInProgress ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-violet-50 text-violet-600 border border-violet-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
                          In Sequence
                        </span>
                      ) : isPaused ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Paused
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-600 border border-gray-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                          {item.status}
                        </span>
                      )}
                    </td>

                    {/* Enrolled Date */}
                    <td className="py-3.5 px-5 text-gray-400">
                      {item.enrolledAt ? new Date(item.enrolledAt).toLocaleDateString() : "—"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Direct Unified Inbox link */}
                        <Link
                          href="/dashboard/inbox"
                          className="p-1.5 rounded-lg text-gray-400 hover:text-violet-600 hover:bg-violet-50 transition"
                          title="Open conversation in Unified Inbox"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </Link>

                        {/* Pause / Resume Lead */}
                        {(isInProgress || isPaused) && (
                          <button
                            onClick={() => toggleLeadStatus(item.leadId, item.status)}
                            disabled={actionPendingId === item.leadId}
                            className={`p-1.5 rounded-lg transition ${
                              isPaused
                                ? "text-emerald-600 hover:bg-emerald-50"
                                : "text-amber-500 hover:bg-amber-50"
                            }`}
                            title={isPaused ? "Resume outreach for lead" : "Pause outreach for lead"}
                          >
                            {actionPendingId === item.leadId ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : isPaused ? (
                              <Play className="w-3.5 h-3.5 fill-current" />
                            ) : (
                              <Pause className="w-3.5 h-3.5 fill-current" />
                            )}
                          </button>
                        )}

                        {/* Remove Lead */}
                        <button
                          onClick={() => removeLead(item.leadId)}
                          className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition"
                          title="Remove from campaign"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
