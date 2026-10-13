"use client";

import { useState } from "react";
import { X, BookmarkPlus, Loader2, CheckCircle2, AlertCircle, Layers } from "lucide-react";
import { TEMPLATE_CATEGORIES } from "@/app/lib/sequenceTemplates";

export default function SaveTemplateModal({ open, onClose, currentSteps = [], onSaved }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Multi-Channel");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  if (!open) return null;

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Please enter a template name.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const res = await fetch("/api/sequence-templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          category,
          steps: currentSteps,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to save template");
      }

      if (onSaved) onSaved(data);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-[3px]">
      <div className="modal-enter w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6367FF]/10 text-[#6367FF]">
              <BookmarkPlus size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Save Sequence as Template</h3>
              <p className="text-[11px] text-gray-400">Save for reuse across future campaigns.</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X size={17} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">
              Template Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. B2B Multi-Channel Enterprise Follow-up"
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs font-semibold text-gray-800 outline-none transition focus:border-[#6367FF] focus:bg-white"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs font-semibold text-gray-800 outline-none transition focus:border-[#6367FF] focus:bg-white"
            >
              {TEMPLATE_CATEGORIES.filter((c) => c !== "All").map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-gray-700">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the cadence, goal, or target persona for this sequence..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-3.5 py-2.5 text-xs text-gray-800 outline-none transition focus:border-[#6367FF] focus:bg-white resize-none"
            />
          </div>

          <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 flex items-center justify-between text-xs text-gray-500">
            <span>Steps in current sequence:</span>
            <span className="font-bold text-[#6367FF]">{currentSteps.length} steps</span>
          </div>

          {/* Footer Buttons */}
          <div className="flex justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded-xl border border-gray-200 px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              className="flex items-center gap-1.5 rounded-xl bg-[#6367FF] px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-[#5254e8] transition disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <BookmarkPlus size={14} />}
              <span>{saving ? "Saving..." : "Save Template"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
