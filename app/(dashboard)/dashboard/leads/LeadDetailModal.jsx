"use client";

import { useEffect, useState } from "react";
import { X, Tag, Plus } from "lucide-react";

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
              <div className="mb-5 flex items-center gap-4">
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

              <dl className="mb-5 space-y-2 text-sm">
                <div className="flex justify-between border-b border-gray-50 py-1.5">
                  <dt className="text-gray-400">Email</dt>
                  <dd className="text-gray-700">{lead.email || "—"}</dd>
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
                <div className="flex justify-between border-b border-gray-50 py-1.5">
                  <dt className="text-gray-400">Campaigns</dt>
                  <dd className="text-gray-700">{lead.campaignCount ?? 0}</dd>
                </div>
                {Object.entries(lead.customFields || {}).map(([key, value]) => (
                  <div key={key} className="flex justify-between border-b border-gray-50 py-1.5">
                    <dt className="text-gray-400">{key}</dt>
                    <dd className="text-gray-700">{String(value)}</dd>
                  </div>
                ))}
              </dl>

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
