"use client";

import { useState } from "react";
import { X, Tag, Plus, Loader2 } from "lucide-react";

export default function BulkTagModal({ isOpen, onClose, selectedLeadIds, onTagsUpdated }) {
  const [mode, setMode] = useState("add"); // "add" or "remove"
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleAddChip = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
      setTagInput("");
    }
  };

  const handleRemoveChip = (t) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSubmit = async () => {
    let finalTags = [...tags];
    if (tagInput.trim() && !finalTags.includes(tagInput.trim().toLowerCase())) {
      finalTags.push(tagInput.trim().toLowerCase());
    }

    if (finalTags.length === 0) {
      setError("Please specify at least one tag");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          operation: mode === "add" ? "add_tags" : "remove_tags",
          leadIds: selectedLeadIds,
          tags: finalTags,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update tags");

      onTagsUpdated?.(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-50/50 to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Manage Tags for Leads</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Apply to {selectedLeadIds.length} selected prospect{selectedLeadIds.length > 1 ? "s" : ""}.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-gray-100 p-1">
            <button
              type="button"
              onClick={() => setMode("add")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                mode === "add" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Add Tags
            </button>
            <button
              type="button"
              onClick={() => setMode("remove")}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
                mode === "remove" ? "bg-white text-gray-900 shadow-2xs" : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Remove Tags
            </button>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-2">
              {mode === "add" ? "Tags to Assign" : "Tags to Remove"}
            </label>
            <div className="flex gap-2 mb-2.5">
              <input
                type="text"
                placeholder="Enter tag (e.g. enterprise, vip)"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddChip();
                  }
                }}
                className="flex-1 px-3.5 py-2 text-xs bg-gray-50 border border-gray-200 rounded-xl text-gray-800 focus:outline-hidden focus:ring-2 focus:ring-violet-400"
              />
              <button
                type="button"
                onClick={handleAddChip}
                className="px-3 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Chips */}
            <div className="flex flex-wrap gap-1.5 min-h-[32px]">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-700 border border-violet-100"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => handleRemoveChip(t)}
                    className="hover:text-violet-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {tags.length === 0 && !tagInput && (
                <span className="text-[11px] text-gray-400 italic">No tags queued yet</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || (tags.length === 0 && !tagInput.trim())}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition disabled:opacity-50"
          >
            {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>
              {mode === "add" ? "Add Tags" : "Remove Tags"}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
