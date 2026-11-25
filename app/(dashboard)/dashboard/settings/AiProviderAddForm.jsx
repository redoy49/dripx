"use client";

import { useState } from "react";
import { Loader2, PlusCircle, Sparkles } from "lucide-react";
import { PROVIDER_PRESETS, detectProviderFromKey, getProviderPreset } from "@/app/lib/ai/providers";

export default function AiProviderAddForm({ onConnected }) {
  const [providerId, setProviderId] = useState("river");
  const [apiKey, setApiKey] = useState("");
  const [baseUrl, setBaseUrl] = useState("https://api.river.ai/v1");
  const [customName, setCustomName] = useState("");
  const [manualModels, setManualModels] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const preset = getProviderPreset(providerId) || PROVIDER_PRESETS[0];

  const handleProviderChange = (nextId) => {
    setProviderId(nextId);
    const p = getProviderPreset(nextId);
    setBaseUrl(p?.defaultBaseUrl || "");
    setFeedback(null);
  };

  const handleKeyChange = (val) => {
    setApiKey(val);
    const guessed = detectProviderFromKey(val);
    if (guessed && guessed !== providerId) {
      const p = getProviderPreset(guessed);
      setProviderId(guessed);
      setBaseUrl(p?.defaultBaseUrl || "");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!apiKey.trim()) return;
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch("/api/settings/ai-providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId, apiKey, baseUrl, customName, manualModels }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setFeedback({ type: "error", text: data.message || "Key verification failed." });
        return;
      }

      setApiKey("");
      setCustomName("");
      setManualModels("");
      setFeedback({
        type: "success",
        text: `Verified ${preset.label}! ${data.modelCount} available models synced.`,
      });
      onConnected?.();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-indigo-200/80 bg-indigo-50/30 p-5 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <PlusCircle size={16} className="text-indigo-500" />
          Connect New AI Key &amp; Auto-Discover Models
        </h3>
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600">
          <Sparkles size={12} /> Auto-detects key prefix
        </span>
      </div>

      {feedback && (
        <div
          className={`rounded-xl px-3.5 py-2.5 text-xs font-medium border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">Provider / Hub</label>
          <select
            value={providerId}
            onChange={(e) => handleProviderChange(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-800 focus:outline-none focus:border-indigo-400"
          >
            {PROVIDER_PRESETS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold text-gray-600 mb-1">API Key</label>
          <input
            type="password"
            autoComplete="off"
            value={apiKey}
            onChange={(e) => handleKeyChange(e.target.value)}
            placeholder={preset.placeholder}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400"
          />
        </div>
      </div>

      {preset.allowCustomBaseUrl && (
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">
                Base URL ({preset.kind === "anthropic-compatible" ? "Anthropic" : "OpenAI v1"})
              </label>
              <input
                type="url"
                value={baseUrl}
                onChange={(e) => setBaseUrl(e.target.value)}
                placeholder={preset.kind === "anthropic-compatible" ? "https://coarena.ai/api" : "https://coarena.ai/api/v1"}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-400"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-600 mb-1">Display Label (optional)</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder={preset.label}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>
          <div>
            <label className="block text-[11px] font-bold text-gray-600 mb-1">
              Manual Model IDs (optional fallback if /models returns empty)
            </label>
            <input
              type="text"
              value={manualModels}
              onChange={(e) => setManualModels(e.target.value)}
              placeholder="e.g. claude-sonnet-4-5, gpt-4o, deepseek-chat"
              className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400"
            />
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
        <p className="text-[11px] text-gray-500">{preset.hint}</p>
        <button
          type="submit"
          disabled={submitting || !apiKey.trim()}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-400 hover:bg-indigo-500 disabled:opacity-50 px-5 py-2 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer shrink-0"
        >
          {submitting && <Loader2 size={13} className="animate-spin" />}
          Verify &amp; Sync Models
        </button>
      </div>
    </form>
  );
}
