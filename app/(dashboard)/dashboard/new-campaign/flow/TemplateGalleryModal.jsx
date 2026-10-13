"use client";

import { useEffect, useState, useMemo } from "react";
import {
  X,
  Search,
  Sparkles,
  Mail,
  Clock,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Layers,
  Zap,
  Eye,
  ThumbsUp,
  MessageSquare,
  UserPlus,
  GitBranch,
  Plus,
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

export default function TemplateGalleryModal({ open, onClose, onSelectTemplate, currentStepsCount = 0 }) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedTemplateId, setExpandedTemplateId] = useState(null);
  const [confirmingTemplate, setConfirmingTemplate] = useState(null);

  useEffect(() => {
    if (!open) return;
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
  }, [open]);

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

  const handleApplyClick = (template) => {
    if (currentStepsCount > 0) {
      setConfirmingTemplate(template);
    } else {
      onSelectTemplate(template);
      onClose();
    }
  };

  const handleConfirmOverwrite = () => {
    if (confirmingTemplate) {
      onSelectTemplate(confirmingTemplate);
      setConfirmingTemplate(null);
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[4px] sm:p-6">
      <div className="modal-enter flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl border border-gray-100 bg-[#FAF9F6] shadow-2xl">
        {/* Header */}
        <div className="border-b border-gray-100 bg-white px-6 py-5 sm:px-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#6367FF]/10 text-[#6367FF]">
                <Layers size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">Sequence Templates Gallery</h2>
                <p className="text-xs text-gray-400">
                  Select a pre-built multichannel playbook or team template to populate your campaign canvas.
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
            >
              <X size={18} />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {/* Category Pills */}
            <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto no-scrollbar">
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

            {/* Search Input */}
            <div className="relative min-w-[220px]">
              <Search size={14} className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 py-2 pl-9 pr-3 text-xs font-medium text-gray-800 outline-none transition focus:border-[#6367FF] focus:bg-white"
              />
            </div>
          </div>
        </div>

        {/* Content Roster */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8">
          {loading ? (
            <div className="flex h-64 flex-col items-center justify-center gap-3">
              <span className="h-6 w-6 animate-spin rounded-full border-2 border-[#6367FF] border-t-transparent" />
              <span className="text-xs font-medium text-gray-400">Loading playbooks...</span>
            </div>
          ) : filteredTemplates.length === 0 ? (
            <div className="flex h-64 flex-col items-center justify-center text-center">
              <Layers size={36} className="text-gray-300" />
              <p className="mt-3 text-sm font-semibold text-gray-700">No templates found</p>
              <p className="text-xs text-gray-400">Try adjusting your category or search filter.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTemplates.map((tpl) => {
                const isExpanded = expandedTemplateId === tpl.id;
                const hasBranches = tpl.steps.some((s) => s.type === "condition");
                const acceptedSteps = tpl.steps.filter(
                  (s) => s.tempId?.includes("accepted") && !s.tempId?.includes("not_accepted"),
                );
                const notAcceptedSteps = tpl.steps.filter((s) => s.tempId?.includes("not_accepted"));

                return (
                  <div
                    key={tpl.id}
                    className="overflow-hidden rounded-3xl border border-gray-100 bg-white p-6 shadow-sm transition hover:border-[#6367FF]/30 hover:shadow-md"
                  >
                    {/* Top Info Bar */}
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-base font-bold text-gray-900">{tpl.name}</h3>
                          {tpl.badge && (
                            <span className="rounded-lg bg-indigo-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#6367FF]">
                              {tpl.badge}
                            </span>
                          )}
                          <span className="rounded-lg bg-gray-100 px-2 py-0.5 text-[10px] font-semibold text-gray-600">
                            {tpl.category}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                          {tpl.description}
                        </p>
                      </div>

                      {/* Right Meta */}
                      <div className="flex items-center gap-3 self-end sm:self-start">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500">
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
                          <span className="ml-1 text-[11px] text-gray-400">
                            ~{tpl.estimatedDays} days
                          </span>
                        </div>

                        <button
                          onClick={() => handleApplyClick(tpl)}
                          className="flex items-center gap-1.5 rounded-xl bg-[#6367FF] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#6367FF]/20 transition hover:bg-[#5254e8] active:scale-95"
                        >
                          <Sparkles size={14} />
                          <span>Apply to Canvas</span>
                        </button>
                      </div>
                    </div>

                    {/* TWO-CARD BRANCH DESIGN (Inspired by User's Reference Screenshots) */}
                    {hasBranches && acceptedSteps.length > 0 && notAcceptedSteps.length > 0 ? (
                      <div className="mt-5 rounded-2xl bg-gray-50/50 p-4">
                        {/* Root Step Centered at Top with Vertical Line */}
                        <div className="flex flex-col items-center mb-3">
                          <div className="flex items-center gap-2.5 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-800 shadow-xs">
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6367FF] text-white">
                              <UserPlus size={13} />
                            </div>
                            <span>Send invite</span>
                            <MoreHorizontal size={13} className="text-gray-400 ml-2" />
                          </div>
                          <div className="h-4 w-px border-l-2 border-dashed border-gray-300" />
                        </div>

                        {/* Dual Cards: Not Accepted (Coral) vs Accepted (Sky/Blue) */}
                        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          {/* Left Column: Not Accepted (Coral Container) */}
                          <div className="flex flex-col items-center">
                            <span className="mb-2 text-xs font-semibold text-rose-500">
                              Not accepted
                            </span>
                            <div className="w-full rounded-2xl border border-dashed border-rose-300 bg-rose-50/20 p-4 space-y-3">
                              {notAcceptedSteps.map((s, i) => {
                                const Icon = getStepIcon(s.type);
                                return (
                                  <div key={s.tempId || i} className="space-y-2">
                                    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-2.5 shadow-xs">
                                      <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6367FF] text-white shadow-2xs">
                                          <Icon size={14} />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-800">
                                          {s.config?.subject ? `Email: ${s.config.subject.slice(0, 22)}...` : "Send email"}
                                        </span>
                                      </div>
                                      <MoreHorizontal size={14} className="text-gray-400" />
                                    </div>
                                    {s.delayMinutes > 0 && (
                                      <div className="flex justify-center">
                                        <span className="flex items-center gap-1 rounded-full border border-purple-200 bg-[#F4F3FF] px-2.5 py-0.5 text-[10px] font-semibold text-[#6367FF]">
                                          <Clock size={10} />
                                          <span>{Math.round(s.delayMinutes / 1440)} days</span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>

                          {/* Right Column: Accepted (Sky/Emerald Container) */}
                          <div className="flex flex-col items-center">
                            <span className="mb-2 text-xs font-semibold text-emerald-500">
                              Accepted
                            </span>
                            <div className="w-full rounded-2xl border border-dashed border-sky-300 bg-sky-50/20 p-4 space-y-3">
                              {acceptedSteps.map((s, i) => {
                                const Icon = getStepIcon(s.type);
                                return (
                                  <div key={s.tempId || i} className="space-y-2">
                                    <div className="flex items-center justify-between rounded-xl border border-gray-100 bg-white p-2.5 shadow-xs">
                                      <div className="flex items-center gap-2.5">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#6367FF] text-white shadow-2xs">
                                          <Icon size={14} />
                                        </div>
                                        <span className="text-xs font-semibold text-gray-800">
                                          {s.type === "message" ? "Message" : "Follow-up message"}
                                        </span>
                                      </div>
                                      <MoreHorizontal size={14} className="text-gray-400" />
                                    </div>
                                    {s.delayMinutes > 0 && (
                                      <div className="flex justify-center">
                                        <span className="flex items-center gap-1 rounded-full border border-purple-200 bg-[#F4F3FF] px-2.5 py-0.5 text-[10px] font-semibold text-[#6367FF]">
                                          <Clock size={10} />
                                          <span>{Math.round(s.delayMinutes / 1440)} days</span>
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}

                              {/* Terminal (+) Add | (-) End split pill (matches reference image) */}
                              <div className="flex justify-center pt-1">
                                <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs">
                                  <div className="flex items-center gap-1 px-3 py-1 text-[11px] font-semibold text-[#6367FF]">
                                    <Plus size={12} className="text-[#6367FF]" />
                                    <span>Add</span>
                                  </div>
                                  <div className="h-3.5 w-px bg-gray-200" />
                                  <div className="flex items-center gap-1 px-3 py-1 text-[11px] font-medium text-gray-400">
                                    <CircleSlash size={11} className="text-gray-400" />
                                    <span>End</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Linear Flow Visualization (Strictly Vertical) */
                      <div className="mt-4 flex flex-col items-center rounded-2xl bg-gray-50/60 p-4">
                        {tpl.steps.map((st, i) => {
                          const Icon = getStepIcon(st.type);
                          return (
                            <div key={st.tempId || i} className="flex flex-col items-center w-full max-w-sm">
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
                                    <span className="my-0.5 flex items-center gap-1 rounded-full border border-purple-200 bg-[#F4F3FF] px-2.5 py-0.5 text-[9px] font-semibold text-[#6367FF]">
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

                    {/* Expand Details Toggle */}
                    <div className="mt-3 flex items-center justify-between border-t border-gray-100 pt-3">
                      <button
                        onClick={() => setExpandedTemplateId(isExpanded ? null : tpl.id)}
                        className="flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900 transition"
                      >
                        <span>{isExpanded ? "Hide step templates & copy" : "Preview copy & step details"}</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>

                      <span className="text-[11px] text-gray-400 font-medium">
                        {tpl.steps.length} sequence nodes
                      </span>
                    </div>

                    {/* Expanded Drawer: Full Copy Preview */}
                    {isExpanded && (
                      <div className="mt-3 space-y-3 rounded-2xl border border-gray-100 bg-gray-50/50 p-4">
                        {tpl.steps.map((st, i) => (
                          <div key={st.tempId || i} className="rounded-xl border border-gray-100 bg-white p-3 text-xs">
                            <div className="flex items-center justify-between text-gray-400 font-medium text-[11px] mb-1">
                              <span className="uppercase font-bold text-[#6367FF]">Step {i + 1}: {st.type}</span>
                              {st.delayMinutes > 0 && <span>Delay: {Math.round(st.delayMinutes / 1440)} days</span>}
                            </div>
                            {st.config?.subject && (
                              <p className="font-semibold text-gray-800 mb-1">
                                Subject: <span className="font-normal text-gray-600">{st.config.subject}</span>
                              </p>
                            )}
                            {(st.config?.template || st.config?.note) && (
                              <p className="whitespace-pre-line text-gray-600 font-mono text-[11px]">
                                {st.config?.template || st.config?.note}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Confirmation Modal: Replace current canvas */}
        {confirmingTemplate && (
          <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/30 p-4 backdrop-blur-[2px]">
            <div className="w-full max-w-md rounded-3xl border border-gray-100 bg-white p-6 shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Replace current canvas?</h3>
                  <p className="text-xs text-gray-500">
                    Applying &ldquo;{confirmingTemplate.name}&rdquo; will replace your current {currentStepsCount} canvas steps.
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end gap-2.5">
                <button
                  onClick={() => setConfirmingTemplate(null)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmOverwrite}
                  className="rounded-xl bg-[#6367FF] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#5254e8] transition"
                >
                  Confirm & Load Template
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
