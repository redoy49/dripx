"use client";

import { useEffect, useState } from "react";
import { KeyRound, CheckCircle2, Trash2, ShieldCheck, Loader2 } from "lucide-react";

const PROVIDER_HINTS = {
  gateway: "One key unlocks Claude, ChatGPT, DeepSeek & Gemini via Vercel AI Gateway",
  anthropic: "Optional direct BYOK key (sk-ant-...) for Anthropic Claude models",
  openai: "Optional direct BYOK key (sk-...) for OpenAI ChatGPT / Codex models",
  deepseek: "Optional direct BYOK key for DeepSeek V4 & R1 models",
  google: "Optional direct BYOK key (AIza...) for Google Gemini 4 models",
};

export default function AiProvidersTab() {
  const [providers, setProviders] = useState([]);
  const [inputs, setInputs] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [forbidden, setForbidden] = useState(false);

  const load = async () => {
    try {
      const res = await fetch("/api/settings/ai-providers");
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setProviders(data.providers || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let ignore = false;
    fetch("/api/settings/ai-providers")
      .then(async (res) => {
        if (ignore) return;
        if (res.status === 403) {
          setForbidden(true);
          return;
        }
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setProviders(data.providers || []);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const saveKeys = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/settings/ai-providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: inputs }),
      });
      if (res.ok) {
        setInputs({});
        setFeedback({ type: "success", text: "Encrypted API keys updated." });
        await load();
      } else {
        const err = await res.json().catch(() => ({}));
        setFeedback({ type: "error", text: err.message || "Failed to save keys." });
      }
    } finally {
      setSaving(false);
    }
  };

  const clearProviderKey = async (id) => {
    setSaving(true);
    try {
      await fetch("/api/settings/ai-providers", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keys: { [id]: "" } }),
      });
      await load();
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-xs text-gray-400 animate-pulse">Loading AI provider configuration...</div>;
  }

  if (forbidden) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        Only workspace <strong>Owners</strong> and <strong>Admins</strong> can configure AI provider keys.
      </div>
    );
  }

  return (
    <form onSubmit={saveKeys} className="p-6 sm:p-8 max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <KeyRound size={18} className="text-indigo-500" />
            AI Providers &amp; BYOK Keys
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Hybrid routing: Workspace BYOK keys override platform AI Gateway credits and are encrypted with AES-256-GCM.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-700 shrink-0">
          <ShieldCheck size={13} /> AES-256 Encrypted
        </span>
      </div>

      {feedback && (
        <div
          className={`rounded-xl px-4 py-2.5 text-xs font-medium border ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {feedback.text}
        </div>
      )}

      <div className="space-y-3">
        {providers.map((p) => (
          <div key={p.id} className="rounded-2xl border border-gray-200/90 bg-gray-50/40 p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-gray-800">{p.label}</span>
                  {p.configured && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 border border-emerald-200/80">
                      <CheckCircle2 size={11} />
                      {p.source === "byok" ? `BYOK (${p.maskedKey})` : "Platform Active"}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-gray-500 mt-0.5">{PROVIDER_HINTS[p.id]}</p>
              </div>
              {p.source === "byok" && (
                <button
                  type="button"
                  onClick={() => clearProviderKey(p.id)}
                  disabled={saving}
                  className="text-xs font-semibold text-rose-500 hover:text-rose-600 inline-flex items-center gap-1 px-2.5 py-1 rounded-full hover:bg-rose-50 transition cursor-pointer"
                >
                  <Trash2 size={13} /> Remove
                </button>
              )}
            </div>

            <input
              type="password"
              autoComplete="off"
              placeholder={p.source === "byok" ? "Enter new key to replace saved BYOK key..." : `Paste ${p.label} API key...`}
              value={inputs[p.id] ?? ""}
              onChange={(e) => setInputs((prev) => ({ ...prev, [p.id]: e.target.value }))}
              className="w-full rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-indigo-400 transition"
            />
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || Object.values(inputs).every((v) => !v?.trim())}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-400 hover:bg-indigo-500 disabled:opacity-50 px-6 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
        >
          {saving && <Loader2 size={14} className="animate-spin" />}
          Save Encrypted Keys
        </button>
      </div>
    </form>
  );
}
