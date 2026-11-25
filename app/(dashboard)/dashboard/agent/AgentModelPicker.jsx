"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Check, Sparkles, KeyRound, Search } from "lucide-react";
import { BRAND_GROUPS } from "@/app/lib/ai/models";

const REASONING_LEVELS = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Med" },
  { id: "high", label: "High" },
];

export default function AgentModelPicker({
  modelId,
  sourceProviderId,
  reasoningEffort,
  onChangeModel,
  onChangeReasoning,
  availableModels = [],
}) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("");
  const rootRef = useRef(null);

  const current =
    availableModels.find((m) => m.id === modelId && (!sourceProviderId || m.sourceProviderId === sourceProviderId)) ||
    availableModels[0] ||
    null;

  const currentBrand = BRAND_GROUPS.find((b) => b.id === current?.brand) || BRAND_GROUPS[4];

  useEffect(() => {
    const onDown = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const q = filter.trim().toLowerCase();
  const filteredModels = availableModels.filter(
    (m) => !q || m.label.toLowerCase().includes(q) || m.id.toLowerCase().includes(q)
  );

  const populatedGroups = BRAND_GROUPS.map((g) => ({
    ...g,
    models: filteredModels.filter((m) => (m.brand || "other") === g.id),
  })).filter((g) => g.models.length > 0);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition cursor-pointer"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${current ? currentBrand.dot : "bg-amber-400"} shrink-0`} />
        <span className="max-w-[160px] truncate">
          {current ? current.label : "No Active Models"}
        </span>
        {current?.supportsReasoning && (
          <span className="text-gray-400 font-medium capitalize">{reasoningEffort}</span>
        )}
        <ChevronDown size={13} className="text-gray-400 shrink-0" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 max-h-[400px] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-xl z-50 space-y-2">
          {availableModels.length > 6 && (
            <div className="relative px-1">
              <Search size={12} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Filter available models..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50 pl-8 pr-3 py-1.5 text-xs text-gray-700 focus:outline-none focus:border-indigo-400"
              />
            </div>
          )}

          {current?.supportsReasoning && (
            <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-gray-100">
              <span className="text-[10.5px] font-bold text-gray-500 uppercase tracking-wider">Reasoning</span>
              <div className="flex items-center gap-1 rounded-full bg-gray-100 p-0.5">
                {REASONING_LEVELS.map((lvl) => (
                  <button
                    key={lvl.id}
                    type="button"
                    onClick={() => onChangeReasoning(lvl.id)}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                      reasoningEffort === lvl.id ? "bg-white text-indigo-600 shadow-2xs" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    {lvl.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {populatedGroups.length === 0 ? (
            <div className="px-3 py-5 text-center text-xs text-gray-500 space-y-2">
              <p>{availableModels.length === 0 ? "No API keys connected yet." : "No matching models."}</p>
            </div>
          ) : (
            populatedGroups.map((group) => (
              <div key={group.id} className="space-y-0.5">
                <div className="px-2.5 py-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span className={`w-2 h-2 rounded-full ${group.dot}`} />
                  {group.label}
                </div>

                {group.models.map((m) => {
                  const selected = m.id === current?.id && m.sourceProviderId === current?.sourceProviderId;
                  return (
                    <button
                      key={`${m.sourceProviderId}:${m.id}`}
                      type="button"
                      onClick={() => {
                        onChangeModel(m.id, m.sourceProviderId);
                        setOpen(false);
                      }}
                      className={`w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition cursor-pointer ${
                        selected ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-xs font-bold truncate">{m.label}</div>
                        <div className="text-[10px] text-gray-400 truncate">
                          via {m.sourceLabel || m.sourceProviderId}
                        </div>
                      </div>
                      {selected && <Check size={14} className="text-indigo-500 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            ))
          )}

          <div className="border-t border-gray-100 pt-1.5 px-1">
            <Link
              href="/dashboard/settings?tab=AI%20Providers"
              className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 transition"
            >
              <span className="inline-flex items-center gap-1.5">
                <KeyRound size={12} /> Manage Keys &amp; Sync Models
              </span>
              <Sparkles size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
