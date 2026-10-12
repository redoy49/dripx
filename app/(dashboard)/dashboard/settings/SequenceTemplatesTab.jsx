"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Layers,
  Sparkles,
  Search,
  Mail,
  UserPlus,
  MessageSquare,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Plus,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Eye,
  ThumbsUp,
  GitBranch,
  Zap,
  MoreHorizontal,
  CircleSlash,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";
import { TEMPLATE_CATEGORIES } from "@/app/lib/sequenceTemplates";

function getStepIcon(type) {
  switch (type) {
    case "email":
      return Mail;
    case "connection_request":
      return UserPlus;
    case "message":
    case "follow_up":
      return MessageSquare;
    case "profile_visit":
      return Eye;
    case "like_post":
      return ThumbsUp;
    case "condition":
      return GitBranch;
    default:
      return Zap;
  }
}

export default function SequenceTemplatesTab() {
  const router = useRouter();
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/sequence-templates")
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) {
          setTemplates(data.items || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          console.error("Failed to load templates:", err);
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredTemplates = useMemo(() => {
    return templates.filter((tpl) => {
      const matchCat =
        selectedCategory === "All" ||
        tpl.category?.toLowerCase() === selectedCategory.toLowerCase() ||
        (selectedCategory === "Custom Saved" && !tpl.isSystem);

      const matchSearch =
        !searchQuery.trim() ||
        tpl.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tpl.description.toLowerCase().includes(searchQuery.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [templates, selectedCategory, searchQuery]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete template "${name}"?`)) return;

    setDeletingId(id);
    try {
      const res = await fetch(`/api/sequence-templates/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete template");
      }
      setToast({ type: "success", text: `Template "${name}" deleted.` });
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: "error", text: err.message });
    } finally {
      setDeletingId(null);
    }
  };

  const handleUseInCampaign = (tpl) => {
    router.push(`/dashboard/new-campaign`);
  };

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#6367FF]" />
        <span className="text-xs font-medium text-gray-400">Loading playbooks & templates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Top Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Sequence Templates & Playbooks</h2>
          <p className="mt-1 text-xs text-gray-500">
            Browse built-in multi-channel playbooks or manage custom sequences saved across your workspace.
          </p>
        </div>

        <button
          onClick={() => router.push("/dashboard/new-campaign")}
          className="flex items-center gap-2 rounded-2xl bg-[#6367FF] px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-[#6367FF]/20 transition hover:bg-[#5254e8] active:scale-95 self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>New Sequence Campaign</span>
        </button>
      </div>

      {toast && (
        <div
          className={`flex items-center gap-2 rounded-2xl border p-4 text-xs font-medium ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-1.5">
          {[...TEMPLATE_CATEGORIES, "Custom Saved"].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${
                selectedCategory === cat
                  ? "bg-[#6367FF] text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative min-w-[240px]">
          <Search size={14} className="absolute left-3.5 top-3 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search playbooks..."
            className="w-full rounded-2xl border border-gray-200 bg-white py-2 pl-9 pr-3 text-xs font-medium text-gray-800 outline-none transition focus:border-[#6367FF]"
          />
        </div>
      </div>

      {/* Grid Roster */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {filteredTemplates.map((tpl) => {
          const isExpanded = expandedId === tpl.id;
          const hasBranches = tpl.steps?.some((s) => s.type === "condition");
          const acceptedSteps = tpl.steps?.filter(
            (s) => s.tempId?.includes("accepted") && !s.tempId?.includes("not_accepted"),
          ) || [];
          const notAcceptedSteps = tpl.steps?.filter((s) => s.tempId?.includes("not_accepted")) || [];

          return (
            <div
              key={tpl.id}
              className="flex flex-col justify-between overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-[#6367FF]/30 hover:shadow-md"
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-gray-900">{tpl.name}</h3>
                      {tpl.badge && (
                        <span className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6367FF]">
                          {tpl.badge}
                        </span>
                      )}
                      <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                        {tpl.category}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      {tpl.description}
                    </p>
                  </div>

                  {/* Channel Icons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    {tpl.channels?.includes("linkedin") && (
                      <span title="LinkedIn" className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#0077B5]/10 text-[#0077B5]">
                        <FaLinkedin size={13} />
                      </span>
                    )}
                    {tpl.channels?.includes("email") && (
                      <span title="Email" className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                        <Mail size={13} />
                      </span>
                    )}
                  </div>
                </div>

                {/* Vertical Visual Flow (Matches reference Dripify UI) */}
                {hasBranches && acceptedSteps.length > 0 && notAcceptedSteps.length > 0 ? (
                  <div className="mt-4 rounded-2xl bg-gray-50/60 p-4">
                    {/* Root Card at Top */}
                    <div className="flex flex-col items-center">
                      <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-800 shadow-xs">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6367FF] text-white">
                          <UserPlus size={13} />
                        </div>
                        <span>Send invite</span>
                        <MoreHorizontal size={13} className="text-gray-400 ml-2" />
                      </div>
                      {/* Vertical connector line */}
                      <div className="h-4 w-px border-l-2 border-dashed border-gray-300" />
                    </div>

                    {/* Dual Branch Containers (Two-Card Design) */}
                    <div className="grid grid-cols-2 gap-3">
                      {/* Left: Not Accepted (Coral Container) */}
                      <div className="flex flex-col items-center">
                        <span className="mb-1 text-[11px] font-semibold text-rose-500">
                          Not accepted
                        </span>
                        <div className="w-full rounded-2xl border border-dashed border-rose-300 bg-rose-50/20 p-2.5 space-y-2">
                          {notAcceptedSteps.slice(0, 3).map((s, i) => (
                            <div key={i} className="space-y-1.5">
                              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-2 shadow-2xs">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6367FF] text-white">
                                    <Mail size={12} />
                                  </div>
                                  <span className="truncate text-[11px] font-semibold text-gray-800">
                                    {s.config?.subject ? `Email: ${s.config.subject.slice(0, 16)}...` : "Send email"}
                                  </span>
                                </div>
                                <MoreHorizontal size={12} className="text-gray-400" />
                              </div>
                              {s.delayMinutes > 0 && (
                                <div className="flex justify-center">
                                  <span className="flex items-center gap-1 rounded-full border border-purple-200 bg-[#F4F3FF] px-2 py-0.5 text-[9px] font-semibold text-[#6367FF]">
                                    <Clock size={9} />
                                    <span>{Math.round(s.delayMinutes / 1440)}d</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Right: Accepted (Sky Container) */}
                      <div className="flex flex-col items-center">
                        <span className="mb-1 text-[11px] font-semibold text-emerald-500">
                          Accepted
                        </span>
                        <div className="w-full rounded-2xl border border-dashed border-sky-300 bg-sky-50/20 p-2.5 space-y-2">
                          {acceptedSteps.slice(0, 3).map((s, i) => (
                            <div key={i} className="space-y-1.5">
                              <div className="flex items-center justify-between rounded-lg border border-gray-100 bg-white p-2 shadow-2xs">
                                <div className="flex items-center gap-2">
                                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#6367FF] text-white">
                                    <MessageSquare size={12} />
                                  </div>
                                  <span className="truncate text-[11px] font-semibold text-gray-800">
                                    {s.type === "message" ? "Message" : "Follow-up"}
                                  </span>
                                </div>
                                <MoreHorizontal size={12} className="text-gray-400" />
                              </div>
                              {s.delayMinutes > 0 && (
                                <div className="flex justify-center">
                                  <span className="flex items-center gap-1 rounded-full border border-purple-200 bg-[#F4F3FF] px-2 py-0.5 text-[9px] font-semibold text-[#6367FF]">
                                    <Clock size={9} />
                                    <span>{Math.round(s.delayMinutes / 1440)}d</span>
                                  </span>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Terminal Add/End node */}
                          <div className="flex justify-center pt-1">
                            <div className="flex items-center overflow-hidden rounded-lg border border-gray-200 bg-white shadow-2xs">
                              <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-[#6367FF]">
                                <Plus size={10} className="text-[#6367FF]" />
                                <span>Add</span>
                              </div>
                              <div className="h-3 w-px bg-gray-200" />
                              <div className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-medium text-gray-400">
                                <CircleSlash size={9} className="text-gray-400" />
                                <span>End</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Vertical Linear Sequence Flow */
                  <div className="mt-4 flex flex-col items-center rounded-2xl bg-gray-50/60 p-4">
                    {tpl.steps?.map((st, i) => {
                      const Icon = getStepIcon(st.type);
                      return (
                        <div key={i} className="flex flex-col items-center w-full max-w-sm">
                          <div className="flex w-full items-center justify-between rounded-xl border border-gray-100 bg-white p-2.5 shadow-xs">
                            <div className="flex items-center gap-2.5">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6367FF] text-white shadow-2xs">
                                <Icon size={13} />
                              </div>
                              <span className="text-xs font-semibold text-gray-800">
                                {st.type === "email"
                                  ? (st.config?.subject ? `Email: ${st.config.subject.slice(0, 24)}...` : "Send email")
                                  : st.type.replace(/_/g, " ")}
                              </span>
                            </div>
                            <MoreHorizontal size={13} className="text-gray-400" />
                          </div>
                          {i < tpl.steps.length - 1 && (
                            <div className="flex flex-col items-center my-1">
                              <div className="h-2 w-px border-l-2 border-dashed border-gray-300" />
                              {st.delayMinutes > 0 ? (
                                <span className="my-0.5 flex items-center gap-1 rounded-full border border-purple-200 bg-[#F4F3FF] px-2 py-0.5 text-[9px] font-semibold text-[#6367FF]">
                                  <Clock size={9} />
                                  <span>{Math.round(st.delayMinutes / 1440)} days</span>
                                </span>
                              ) : (
                                <div className="h-1.5 w-px border-l-2 border-dashed border-gray-300" />
                              )}
                              <div className="h-2 w-px border-l-2 border-dashed border-gray-300" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Expanded Details Preview */}
                {isExpanded && (
                  <div className="mt-4 space-y-2 border-t border-gray-100 pt-3 text-xs">
                    {tpl.steps?.map((st, i) => (
                      <div key={i} className="rounded-xl border border-gray-100 bg-gray-50 p-2.5">
                        <span className="font-bold text-[#6367FF] text-[10px] uppercase block mb-1">
                          Step {i + 1}: {st.type}
                        </span>
                        {st.config?.subject && (
                          <p className="font-semibold text-gray-800 text-[11px]">Subject: {st.config.subject}</p>
                        )}
                        {(st.config?.template || st.config?.note) && (
                          <p className="font-mono text-[10px] text-gray-600 whitespace-pre-line mt-1">
                            {st.config?.template || st.config?.note}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Card Footer Controls */}
              <div className="mt-5 flex items-center justify-between border-t border-gray-100 pt-4">
                <button
                  onClick={() => setExpandedId(isExpanded ? null : tpl.id)}
                  className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
                >
                  <span>{isExpanded ? "Hide Details" : "Preview Copy"}</span>
                  {isExpanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                </button>

                <div className="flex items-center gap-2">
                  {!tpl.isSystem && (
                    <button
                      onClick={() => handleDelete(tpl.id, tpl.name)}
                      disabled={deletingId === tpl.id}
                      className="rounded-xl p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600 transition disabled:opacity-40"
                    >
                      {deletingId === tpl.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                    </button>
                  )}

                  <button
                    onClick={() => handleUseInCampaign(tpl)}
                    className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-gray-800"
                  >
                    <span>Use in Campaign</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
