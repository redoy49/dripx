"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronDown, Check, Sparkles, KeyRound } from "lucide-react";
import { AI_MODELS } from "@/app/lib/ai/models";

const PROVIDER_META = {
  anthropic: { label: "Anthropic (Claude)", dot: "bg-orange-500" },
  openai: { label: "OpenAI (ChatGPT)", dot: "bg-emerald-500" },
  deepseek: { label: "DeepSeek", dot: "bg-sky-500" },
  google: { label: "Google (Gemini)", dot: "bg-indigo-500" },
};

const REASONING_LEVELS = [
  { id: "low", label: "Low" },
  { id: "medium", label: "Med" },
  { id: "high", label: "High" },
];

export default function AgentModelPicker({
  modelId,
  reasoningEffort,
  onChangeModel,
  onChangeReasoning,
  hasGateway,
  configuredProviders = [],
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const current = AI_MODELS.find((m) => m.id === modelId) || AI_MODELS[0];
  const providerStyle = PROVIDER_META[current.provider] || PROVIDER_META.anthropic;

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

  const grouped = Object.keys(PROVIDER_META).map((pid) => ({
    id: pid,
    ...PROVIDER_META[pid],
    models: AI_MODELS.filter((m) => m.provider === pid),
  }));

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 shadow-2xs transition cursor-pointer"
      >
        <span className={`w-2.5 h-2.5 rounded-full ${providerStyle.dot} shrink-0`} />
        <span>{current.shortLabel}</span>
        {current.supportsReasoning && (
          <span className="text-gray-400 font-medium capitalize">{reasoningEffort}</span>
        )}
        <ChevronDown size={13} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-80 max-h-[380px] overflow-y-auto rounded-2xl border border-gray-200 bg-white p-2 shadow-xl z-50 space-y-2">
          <div className="flex items-center justify-between px-2.5 py-1.5 border-b border-gray-100">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Reasoning Effort
            </span>
            <div className="flex items-center gap-1 rounded-full bg-gray-100 p-0.5">
              {REASONING_LEVELS.map((lvl) => (
                <button
                  key={lvl.id}
                  type="button"
                  onClick={() => onChangeReasoning(lvl.id)}
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition cursor-pointer ${
                    reasoningEffort === lvl.id
                      ? "bg-white text-indigo-600 shadow-2xs"
                      : "text-gray-500 hover:text-gray-800"
                  }`}
                >
                  {lvl.label}
                </button>
              ))}
            </div>
          </div>

          {grouped.map((group) => {
            const ready = hasGateway || configuredProviders.includes(group.id);
            return (
              <div key={group.id} className="space-y-0.5">
                <div className="flex items-center justify-between px-2.5 py-1">
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                    <span className={`w-2 h-2 rounded-full ${group.dot}`} />
                    {group.label}
                  </span>
                  {!ready && (
                    <span className="text-[10px] font-medium text-amber-600">Needs key</span>
                  )}
                </div>

                {group.models.map((m) => {
                  const selected = m.id === current.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => {
                        onChangeModel(m.id);
                        setOpen(false);
                      }}
                      className={`w-full flex items-start justify-between gap-2 rounded-xl px-2.5 py-2 text-left transition cursor-pointer ${
                        selected ? "bg-indigo-50 text-indigo-700" : "hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold">{m.label}</span>
                          <span className="rounded-full bg-gray-100 px-1.5 py-0.5 text-[9px] font-semibold text-gray-500">
                            {m.badge}
                          </span>
                        </div>
                        <p className="text-[10.5px] text-gray-400 truncate mt-0.5">{m.description}</p>
                      </div>
                      {selected && <Check size={14} className="text-indigo-500 shrink-0 mt-0.5" />}
                    </button>
                  );
                })}
              </div>
            );
          })}

          <div className="border-t border-gray-100 pt-1.5 px-1">
            <Link
              href="/dashboard/settings?tab=AI%20Providers"
              className="flex items-center justify-between rounded-xl px-2.5 py-2 text-[11px] font-semibold text-indigo-600 hover:bg-indigo-50 transition"
            >
              <span className="inline-flex items-center gap-1.5">
                <KeyRound size={12} /> Configure BYOK API Keys
              </span>
              <Sparkles size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
