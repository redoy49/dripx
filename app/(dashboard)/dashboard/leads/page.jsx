"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";
import { getCached, setCached } from "@/app/lib/swrCache";
import {
  Search,
  Download,
  Upload,
  Trash2,
  Tag,
  Megaphone,
  CheckSquare,
  Square,
  MinusSquare,
  MessageSquare,
  Filter,
  X,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Loader2,
  Users,
} from "lucide-react";
import BellIcon from "@/app/components/ui/BellIcon";
import LeadSourceModal from "@/app/(dashboard)/dashboard/new-campaign/LeadSourceModal";
import LeadDetailModal from "@/app/(dashboard)/dashboard/leads/LeadDetailModal";
import BulkEnrollModal from "@/app/(dashboard)/dashboard/leads/BulkEnrollModal";
import BulkTagModal from "@/app/(dashboard)/dashboard/leads/BulkTagModal";

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

const STATUS_OPTIONS = [
  { value: "all", label: "All Outreach Statuses" },
  { value: "in_progress", label: "In Sequence" },
  { value: "replied", label: "Replied" },
  { value: "paused", label: "Paused" },
  { value: "completed", label: "Completed" },
  { value: "pending", label: "Pending Start" },
];

export default function LeadsPage() {
  const [search, setSearch] = useState("");
  const [campaignFilter, setCampaignFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [tagFilter, setTagFilter] = useState("all");

  const [leads, setLeads] = useState(() => {
    const cached = getCached("/api/leads?page=1&limit=25");
    return cached?.items || [];
  });
  const [total, setTotal] = useState(() => {
    const cached = getCached("/api/leads?page=1&limit=25");
    return cached?.total || 0;
  });
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const [loading, setLoading] = useState(() => {
    return !getCached("/api/leads?page=1&limit=25");
  });

  // Workspace campaigns for filter dropdown
  const [campaignList, setCampaignList] = useState([]);
  const [allTags, setAllTags] = useState([]);

  // Modals state
  const [openImport, setOpenImport] = useState(false);
  const [detailId, setDetailId] = useState(null);
  const [openBulkEnroll, setOpenBulkEnroll] = useState(false);
  const [openBulkTag, setOpenBulkTag] = useState(false);

  // Multi-select state
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  // Load available campaigns once for the filter dropdown
  useEffect(() => {
    let ignore = false;
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        if (!ignore && data.items) {
          setCampaignList(data.items);
        }
      })
      .catch((err) => console.error("Failed to load campaigns list:", err));

    return () => {
      ignore = true;
    };
  }, []);

  // Fetch leads based on search, filters, and pagination
  const loadLeads = useCallback(() => {
    let ignore = false;
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });

    if (search.trim()) query.set("search", search.trim());
    if (campaignFilter !== "all") query.set("campaignId", campaignFilter);
    if (statusFilter !== "all") query.set("status", statusFilter);
    if (sourceFilter !== "all") query.set("source", sourceFilter);
    if (tagFilter !== "all") query.set("tag", tagFilter);

    const url = `/api/leads?${query.toString()}`;

    fetch(url)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data) {
          const items = data.items || [];
          setCached(url, data);
          setLeads(items);
          setTotal(data.total || 0);

          // Extract tags from returned items to populate tag filter options
          const tagsSet = new Set();
          for (const item of items) {
            for (const t of item.tags || []) tagsSet.add(t);
          }
          if (tagsSet.size > 0) {
            setAllTags((prev) => [...new Set([...prev, ...Array.from(tagsSet)])]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load leads:", err);
          setLoading(false);
        }
      });

    return () => {
      ignore = true;
    };
  }, [page, limit, search, campaignFilter, statusFilter, sourceFilter, tagFilter]);

  useEffect(() => {
    const cancel = loadLeads();
    return cancel;
  }, [loadLeads]);

  // Selection handlers
  const handleSelectAll = () => {
    if (selectedIds.length === leads.length && leads.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map((l) => l.id));
    }
  };

  const handleToggleRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  // Bulk Delete
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0 || bulkDeleting) return;
    const confirmed = window.confirm(
      `Are you sure you want to delete ${selectedIds.length} lead${selectedIds.length > 1 ? "s" : ""}? All their campaign enrollments and queued sequence jobs will be permanently cancelled.`,
    );
    if (!confirmed) return;

    setBulkDeleting(true);
    try {
      const res = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ operation: "delete", leadIds: selectedIds }),
      });
      const data = await res.json();
      if (res.ok) {
        setToastMessage(`Successfully deleted ${data.deletedCount} leads.`);
        setTimeout(() => setToastMessage(null), 5000);
        setSelectedIds([]);
        loadLeads();
      } else {
        alert(data.message || "Failed to delete leads");
      }
    } catch (err) {
      console.error("Bulk delete error:", err);
    } finally {
      setBulkDeleting(false);
    }
  };

  // Single Delete
  const deleteSingleLead = async (id, e) => {
    e.stopPropagation();
    const confirmed = window.confirm("Are you sure you want to delete this lead?");
    if (!confirmed) return;

    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        setSelectedIds((prev) => prev.filter((item) => item !== id));
        setTotal((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error("Delete lead error:", err);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const query = new URLSearchParams();
    if (search.trim()) query.set("search", search.trim());
    if (campaignFilter !== "all") query.set("campaignId", campaignFilter);
    if (statusFilter !== "all") query.set("status", statusFilter);
    if (sourceFilter !== "all") query.set("source", sourceFilter);
    if (tagFilter !== "all") query.set("tag", tagFilter);

    window.location.href = `/api/leads/export?${query.toString()}`;
  };

  const hasActiveFilters =
    search.trim() !== "" ||
    campaignFilter !== "all" ||
    statusFilter !== "all" ||
    sourceFilter !== "all" ||
    tagFilter !== "all";

  const clearAllFilters = () => {
    setSearch("");
    setCampaignFilter("all");
    setStatusFilter("all");
    setSourceFilter("all");
    setTagFilter("all");
    setPage(1);
  };

  const totalPages = Math.max(1, Math.ceil(total / limit));
  const isAllSelected = leads.length > 0 && selectedIds.length === leads.length;
  const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < leads.length;

  return (
    <div className="min-h-screen bg-gray-50/70 p-4 md:p-6 space-y-4">
      {/* 1. Header */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 p-4 md:p-5 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>Leads</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
              {total} prospects
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Centralized prospect intelligence, multi-channel journey tracking, and cohort management.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Export CSV Button */}
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold shadow-2xs transition"
            title="Download RFC 4180 CSV matching current filters"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Export CSV</span>
          </button>

          {/* Import Leads Button */}
          <button
            onClick={() => setOpenImport(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold text-white shadow-xs transition bg-violet-600 hover:bg-violet-700"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Leads</span>
          </button>

          <button className="p-2 transition-colors rounded-full hover:bg-gray-100 text-gray-500">
            <BellIcon />
          </button>
        </div>
      </div>

      {/* Toast Feedback */}
      {toastMessage && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 flex items-center justify-between shadow-2xs animate-in fade-in">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="font-bold text-emerald-600">
            ✕
          </button>
        </div>
      )}

      {/* 2. Filter Toolbar */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search leads by name, email, company, title..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-4 py-2 text-xs text-gray-700 bg-gray-50 border border-gray-200 rounded-full focus:outline-hidden focus:ring-2 focus:ring-violet-400 transition"
            />
          </div>

          {/* Campaign Filter Dropdown */}
          <div className="min-w-[170px]">
            <select
              value={campaignFilter}
              onChange={(e) => {
                setCampaignFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-violet-400"
            >
              <option value="all">All Campaigns</option>
              <option value="unassigned">Unassigned (Not Enrolled)</option>
              {campaignList.map((c, idx) => (
                <option key={c.id ? `${c.id}-${idx}` : idx} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Outreach Status Dropdown */}
          <div className="min-w-[160px]">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-violet-400"
            >
              {STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Source Dropdown */}
          <div className="min-w-[140px]">
            <select
              value={sourceFilter}
              onChange={(e) => {
                setSourceFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-violet-400"
            >
              <option value="all">All Sources</option>
              {Object.entries(SOURCE_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Tag Dropdown */}
          {allTags.length > 0 && (
            <div className="min-w-[130px]">
              <select
                value={tagFilter}
                onChange={(e) => {
                  setTagFilter(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-violet-400"
              >
                <option value="all">All Tags</option>
                {allTags.map((t) => (
                  <option key={t} value={t}>
                    Tag: {t}
                  </option>
                ))}
              </select>
            </div>
          )}

          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-full transition flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Filters</span>
            </button>
          )}
        </div>
      </div>

      {/* 3. Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="sticky top-4 z-30 bg-white border border-gray-100 text-white rounded-2xl p-3.5 px-5 shadow-xl flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <span className="w-6 h-6 rounded-full bg-violet-600 text-white font-bold text-xs flex items-center justify-center">
              {selectedIds.length}
            </span>
            <span className="text-xs font-semibold text-gray-700">
              Prospect{selectedIds.length > 1 ? "s" : ""} Selected
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bulk Enroll */}
            <button
              onClick={() => setOpenBulkEnroll(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <Megaphone className="w-3.5 h-3.5" />
              <span>Enroll in Campaign</span>
            </button>

            {/* Bulk Tag */}
            <button
              onClick={() => setOpenBulkTag(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-800 hover:bg-gray-700 text-white text-xs font-semibold transition"
            >
              <Tag className="w-3.5 h-3.5 text-gray-400" />
              <span>Manage Tags</span>
            </button>

            {/* Bulk Delete */}
            <button
              onClick={handleBulkDelete}
              disabled={bulkDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-rose-600/90 hover:bg-rose-600 text-white text-xs font-semibold transition disabled:opacity-50"
            >
              {bulkDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
              <span>Delete Selected</span>
            </button>

            {/* Deselect All */}
            <button
              onClick={() => setSelectedIds([])}
              className="px-2.5 py-1.5 text-xs bg-gray-800 rounded-full hover:bg-gray-700 text-white hover:text-white transition font-medium"
            >
              Deselect All
            </button>
          </div>
        </div>
      )}

      {/* 4. Leads Roster Table */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-3 px-4 w-10 text-center">
                    <div className="w-4 h-4 rounded bg-gray-200 mx-auto animate-pulse" />
                  </th>
                  <th className="py-3 px-5">Prospect</th>
                  <th className="py-3 px-5">Source</th>
                  <th className="py-3 px-5">Tags</th>
                  <th className="py-3 px-5">Active Campaigns & Steps</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 animate-pulse">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <tr key={i} className="py-3.5">
                    <td className="py-3.5 px-4 text-center">
                      <div className="w-4 h-4 rounded bg-gray-200 mx-auto" />
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 shrink-0" />
                        <div className="space-y-1.5">
                          <div className="h-3.5 w-32 bg-gray-200 rounded" />
                          <div className="h-3 w-44 bg-gray-100 rounded" />
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="h-5 w-20 bg-gray-100 rounded-full" />
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-1.5">
                        <div className="h-5 w-14 bg-gray-100 rounded-md" />
                        <div className="h-5 w-12 bg-gray-100 rounded-md" />
                      </div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="space-y-1">
                        <div className="h-3.5 w-28 bg-gray-200 rounded" />
                        <div className="h-2.5 w-20 bg-gray-100 rounded" />
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <div className="w-6 h-6 rounded-md bg-gray-100" />
                        <div className="w-6 h-6 rounded-md bg-gray-100" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : leads.length === 0 ? (
          <div className="py-24 text-center text-xs text-gray-400 space-y-2">
            <Users className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="font-medium text-gray-500">No leads found matching your criteria.</p>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-violet-600 hover:underline font-semibold"
              >
                Reset active filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/75 text-gray-400 font-semibold uppercase tracking-wider text-[11px]">
                  {/* Select All Checkbox */}
                  <th className="py-3 px-4 w-10 text-center">
                    <button
                      type="button"
                      onClick={handleSelectAll}
                      className="p-1 rounded text-gray-500 hover:text-violet-600 transition"
                      title={isAllSelected ? "Deselect all" : "Select all on this page"}
                    >
                      {isAllSelected ? (
                        <CheckSquare className="w-4 h-4 text-violet-600" />
                      ) : isPartiallySelected ? (
                        <MinusSquare className="w-4 h-4 text-violet-500" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-300" />
                      )}
                    </button>
                  </th>
                  <th className="py-3 px-5">Prospect</th>
                  <th className="py-3 px-5">Source</th>
                  <th className="py-3 px-5">Tags</th>
                  <th className="py-3 px-5">Active Campaigns & Steps</th>
                  <th className="py-3 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {leads.map((lead, idx) => {
                  const fullName = `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || lead.email || "Unnamed Lead";
                  const initials = fullName
                    .split(" ")
                    .map((n) => n[0])
                    .filter(Boolean)
                    .slice(0, 2)
                    .join("")
                    .toUpperCase() || "?";
                  const isSelected = selectedIds.includes(lead.id);

                  return (
                    <tr
                      key={lead.id ? `${lead.id}-${idx}` : idx}
                      onClick={() => setDetailId(lead.id)}
                      className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${
                        isSelected ? "bg-violet-50/40" : ""
                      }`}
                    >
                      {/* Row Checkbox */}
                      <td
                        className="py-3.5 px-4 text-center"
                        onClick={(e) => handleToggleRow(lead.id, e)}
                      >
                        <button type="button" className="p-1 rounded text-gray-500">
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-violet-600" />
                          ) : (
                            <Square className="w-4 h-4 text-gray-300 hover:text-gray-400" />
                          )}
                        </button>
                      </td>

                      {/* Prospect Info */}
                      <td className="py-3.5 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-violet-50 text-violet-700 font-bold flex items-center justify-center text-xs border border-violet-100 shrink-0">
                            {initials}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 truncate max-w-[170px]">
                              {fullName}
                            </p>
                            <p className="text-[11px] text-gray-400 truncate max-w-[170px]">
                              {lead.jobTitle}
                              {lead.jobTitle && lead.company ? " at " : ""}
                              {lead.company}
                              {!lead.jobTitle && !lead.company ? lead.email : ""}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Source */}
                      <td className="py-3.5 px-5">
                        <span className="text-xs font-medium text-gray-500">
                          {SOURCE_LABELS[lead.source] || lead.source}
                        </span>
                      </td>

                      {/* Tags */}
                      <td className="py-3.5 px-5">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {(lead.tags || []).slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full bg-violet-50 px-2 py-0.5 text-[10px] font-semibold text-violet-600"
                            >
                              {tag}
                            </span>
                          ))}
                          {(lead.tags || []).length > 3 && (
                            <span className="text-[10px] text-gray-400 font-medium">
                              +{lead.tags.length - 3}
                            </span>
                          )}
                          {(lead.tags || []).length === 0 && (
                            <span className="text-xs text-gray-300">—</span>
                          )}
                        </div>
                      </td>

                      {/* Active Campaigns Badges Column */}
                      <td className="py-3.5 px-5">
                        {lead.campaigns && lead.campaigns.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5 max-w-[240px]">
                            {lead.campaigns.map((camp, cIdx) => (
                              <Link
                                key={camp.enrollmentId || (camp.id ? `${camp.id}-${cIdx}` : cIdx)}
                                href={`/dashboard/campaigns/${camp.id}`}
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-violet-50/80 text-violet-700 hover:bg-violet-100 border border-violet-100 transition shadow-2xs"
                                title={`${camp.name} · ${camp.currentStepTitle} (${camp.enrollmentStatus})`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                    camp.enrollmentStatus === "replied"
                                      ? "bg-emerald-500"
                                      : camp.campaignStatus === "active"
                                        ? "bg-emerald-500 animate-pulse"
                                        : "bg-amber-400"
                                  }`}
                                />
                                <span className="truncate max-w-[110px]">{camp.name}</span>
                              </Link>
                            ))}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium text-gray-400 bg-gray-50 border border-gray-100">
                            Unassigned
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-5 text-right">
                        <div
                          className="flex items-center justify-end gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {lead.conversationId && (
                            <Link
                              href="/dashboard/inbox"
                              className="p-1.5 text-gray-400 hover:text-violet-600 transition"
                              title="Open conversation in Unified Inbox"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </Link>
                          )}
                          <button
                            type="button"
                            onClick={(e) => deleteSingleLead(lead.id, e)}
                            className="p-1.5 text-gray-400 hover:text-rose-500 transition"
                            title="Delete lead"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* 5. Pagination Bar */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-3 text-xs text-gray-500">
          <div>
            Showing{" "}
            <span className="font-semibold text-gray-800">
              {total === 0 ? 0 : (page - 1) * limit + 1}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-800">
              {Math.min(total, page * limit)}
            </span>{" "}
            of <span className="font-semibold text-gray-800">{total}</span> prospects
          </div>

          <div className="flex items-center gap-3">
            {/* Rows per page */}
            <div className="flex items-center gap-1.5">
              <span>Per page:</span>
              <select
                value={limit}
                onChange={(e) => {
                  setLimit(Number(e.target.value));
                  setPage(1);
                }}
                className="px-2 py-1 bg-white border border-gray-200 rounded-full text-xs font-semibold text-gray-700"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition"
                title="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="px-2 font-semibold text-gray-700">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-1.5 rounded-full border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-40 transition"
                title="Next page"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      {openImport && (
        <LeadSourceModal
          isOpen={openImport}
          onClose={() => setOpenImport(false)}
          onImported={() => loadLeads()}
        />
      )}

      {detailId && (
        <LeadDetailModal
          leadId={detailId}
          onClose={() => setDetailId(null)}
          onChanged={() => loadLeads()}
        />
      )}

      {openBulkEnroll && (
        <BulkEnrollModal
          isOpen={openBulkEnroll}
          onClose={() => setOpenBulkEnroll(false)}
          selectedLeadIds={selectedIds}
          onEnrolled={(res) => {
            setToastMessage(`Enrolled ${res.enrolled} prospects into campaign.`);
            setTimeout(() => setToastMessage(null), 5000);
            setSelectedIds([]);
            loadLeads();
          }}
        />
      )}

      {openBulkTag && (
        <BulkTagModal
          isOpen={openBulkTag}
          onClose={() => setOpenBulkTag(false)}
          selectedLeadIds={selectedIds}
          onTagsUpdated={(res) => {
            setToastMessage(`Updated tags on ${res.modifiedCount} leads.`);
            setTimeout(() => setToastMessage(null), 5000);
            loadLeads();
          }}
        />
      )}
    </div>
  );
}
