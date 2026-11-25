"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Check, Sparkles, KeyRound, Search } from "lucide-react";
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
  const [expandedProvider, setExpandedProvider] = useState(null);
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
    (m) => !q || `${m.label} ${m.id} ${m.sourceLabel || m.sourceProviderId || ""}`.toLowerCase().includes(q)
  );

  const providerGroups = Object.values(
    filteredModels.reduce((acc, m) => {
      const id = m.sourceProviderId || "default";
      if (!acc[id]) acc[id] = { id, label: m.sourceLabel || id, models: [] };
      acc[id].models.push(m);
      return acc;
    }, {})
  );

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => (!v && setExpandedProvider(null), !v))}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition cursor-pointer"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${current ? currentBrand.dot : "bg-amber-400"} shrink-0`} />
        <span className="max-w-[160px] truncate">{current ? current.label : "No Active Models"}</span>
        {current?.supportsReasoning && <span className="text-gray-400 font-medium capitalize">{reasoningEffort}</span>}
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
                placeholder="Filter providers or models..."
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

          {providerGroups.length === 0 ? (
            <p className="px-3 py-5 text-center text-xs text-gray-500">
              {availableModels.length === 0 ? "No API keys connected yet." : "No matching models."}
            </p>
          ) : (
            <div className="space-y-1">
              {providerGroups.map((group) => {
                const isExpanded = Boolean(q) || expandedProvider === group.id;
                const hasSelected = group.models.some((m) => m.id === current?.id && m.sourceProviderId === current?.sourceProviderId);
                return (
                  <div key={group.id}>
                    <button
                      type="button"
                      aria-expanded={isExpanded}
                      onClick={() => setExpandedProvider((prev) => (prev === group.id ? null : group.id))}
                      className={`w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition cursor-pointer ${
                        isExpanded || hasSelected ? "bg-gray-50 text-gray-900" : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="flex items-center gap-2 min-w-0">
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${hasSelected ? "bg-indigo-500" : "bg-gray-300"}`} />
                        <span className="text-[11px] font-bold uppercase tracking-wider truncate">{group.label}</span>
                      </span>
                      <span className="inline-flex items-center gap-1.5 shrink-0 text-[10px] font-semibold text-gray-400">
                        {group.models.length}
                        {isExpanded ? <ChevronDown size={13} className="text-gray-500" /> : <ChevronRight size={13} />}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="mt-0.5 ml-2 pl-2 border-l border-gray-200/80 max-h-52 overflow-y-auto space-y-0.5">
                        {group.models.map((m) => {
                          const selected = m.id === current?.id && m.sourceProviderId === current?.sourceProviderId;
                          const brandDot = (BRAND_GROUPS.find((b) => b.id === m.brand) || BRAND_GROUPS[4]).dot;
                          return (
                            <button
                              key={`${m.sourceProviderId}:${m.id}`}
                              type="button"
                              onClick={() => { onChangeModel(m.id, m.sourceProviderId); setOpen(false); setExpandedProvider(null); }}
                              className={`w-full flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left transition cursor-pointer ${
                                selected ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50 text-gray-700"
                              }`}
                            >
                              <span className="flex items-center gap-2 min-w-0">
                                <span className={`w-2 h-2 rounded-full shrink-0 ${brandDot}`} />
                                <span className="text-xs font-semibold truncate">{m.label}</span>
                              </span>
                              {selected && <Check size={13} className="text-indigo-500 shrink-0" />}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
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
