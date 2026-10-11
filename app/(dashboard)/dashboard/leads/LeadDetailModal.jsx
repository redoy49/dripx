"use client";

import { useEffect, useState } from "react";
import { X, Tag, Plus, MessageSquare, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function LeadDetailModal({ leadId, onClose, onChanged }) {
  const [lead, setLead] = useState(null);
  const [newTag, setNewTag] = useState("");

  // Derived so switching leads never shows the previous lead's stale details.
  const loading = !lead || lead.id !== leadId;

  useEffect(() => {
    if (!leadId) return;
    fetch(`/api/leads/${leadId}`)
      .then((res) => res.json())
      .then((data) => setLead(data));
  }, [leadId]);

  if (!leadId) return null;

  const addTag = async () => {
    if (!newTag.trim()) return;
    const res = await fetch(`/api/leads/${leadId}/tags`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tag: newTag.trim() }),
    });
    if (res.ok) {
      setLead(await res.json());
      setNewTag("");
      onChanged?.();
    }
  };

  const removeTag = async (tag) => {
    const res = await fetch(`/api/leads/${leadId}/tags?tag=${encodeURIComponent(tag)}`, {
      method: "DELETE",
    });
    if (res.ok) {
      setLead(await res.json());
      onChanged?.();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-6 backdrop-blur-[3px]">
      <div className="modal-enter w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/60 px-6 py-4">
          <h2 className="text-sm font-semibold text-gray-800">Lead details</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-700"
          >
            <X size={16} strokeWidth={2.2} />
          </button>
        </div>

        <div className="p-6">
          {loading || !lead ? (
            <p className="py-10 text-center text-sm text-gray-400">Loading...</p>
          ) : (
            <>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-lg font-bold text-gray-500">
                    {(lead.firstName?.[0] || "?").toUpperCase()}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-800">
                      {`${lead.firstName} ${lead.lastName}`.trim() || "Unnamed lead"}
                    </p>
                    <p className="text-xs text-gray-400">
                      {lead.jobTitle}
                      {lead.jobTitle && lead.company ? " at " : ""}
                      {lead.company}
                    </p>
                  </div>
                </div>

                {lead.conversationId && (
                  <Link
                    href={`/dashboard/inbox`}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-50 hover:bg-violet-100 text-violet-700 text-xs font-semibold transition shrink-0"
                    title="View conversation thread in Unified Inbox"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Open Inbox</span>
                  </Link>
                )}
              </div>

              <dl className="mb-5 space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-50 py-1.5">
                  <dt className="text-gray-400">Email</dt>
                  <dd className="text-gray-700 font-medium">{lead.email || "—"}</dd>
                </div>
                <div className="flex justify-between border-b border-gray-50 py-1.5">
                  <dt className="text-gray-400">LinkedIn</dt>
                  <dd className="max-w-[240px] truncate text-gray-700">
                    {lead.linkedinUrl ? (
                      <a href={lead.linkedinUrl} target="_blank" rel="noreferrer" className="text-[#6367FF] hover:underline">
                        {lead.linkedinUrl}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
                <div className="flex justify-between border-b border-gray-50 py-1.5">
                  <dt className="text-gray-400">Source</dt>
                  <dd className="capitalize text-gray-700">{lead.source?.replace(/_/g, " ")}</dd>
                </div>
                {Object.entries(lead.customFields || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-gray-50 py-1.5">
                    <dt className="text-gray-400">{key}</dt>
                    <dd className="text-gray-700">{String(value)}</dd>
                  </div>
                ))}
              </dl>

              {/* Active Campaigns Section */}
              <div className="mb-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Enrolled Campaigns ({lead.campaigns?.length || 0})
                </p>
                {lead.campaigns && lead.campaigns.length > 0 ? (
                  <div className="space-y-2">
                    {lead.campaigns.map((camp, cIdx) => (
                      <div
                        key={camp.enrollmentId || (camp.id ? `${camp.id}-${cIdx}` : cIdx)}
                        className="flex items-center justify-between p-2.5 rounded-xl border border-gray-100 bg-gray-50/70 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-800">{camp.name}</span>
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold capitalize ${
                              camp.enrollmentStatus === "replied"
                                ? "bg-emerald-50 text-emerald-700"
                                : camp.enrollmentStatus === "in_progress"
                                  ? "bg-violet-50 text-violet-700"
                                  : camp.enrollmentStatus === "paused"
                                    ? "bg-amber-50 text-amber-700"
                                    : "bg-gray-100 text-gray-600"
                            }`}>
                              {camp.enrollmentStatus}
                            </span>
                          </div>
                          <p className="text-[11px] text-gray-400 mt-0.5">{camp.currentStepTitle}</p>
                        </div>

                        <Link
                          href={`/dashboard/campaigns/${camp.id}`}
                          className="p-1.5 text-gray-400 hover:text-violet-600 transition"
                          title="View campaign analytics"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                    Not enrolled in any campaign yet.
                  </p>
                )}
              </div>

              <div>
                <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-gray-500">
                  <Tag size={12} /> Tags
                </p>
                <div className="mb-2 flex flex-wrap gap-1.5">
                  {(lead.tags || []).map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 rounded-full bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-500"
                    >
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-violet-300 hover:text-violet-600">
                        <X size={11} />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addTag()}
                    placeholder="Add a tag"
                    className="flex-1 rounded-lg border border-gray-200 px-3 py-1.5 text-xs text-gray-700 outline-none focus:border-[#6367FF]/40"
                  />
                  <button
                    onClick={addTag}
                    className="flex items-center gap-1 rounded-lg bg-[#6367FF] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#5254e8]"
                  >
                    <Plus size={12} /> Add
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
