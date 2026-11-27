"use client";

import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck, RefreshCw, Trash2, CheckCircle2, AlertTriangle } from "lucide-react";
import AiProviderAddForm from "./AiProviderAddForm";
import { AiProvidersSkeleton } from "./_components/SettingsTabSkeletons";

export default function AiProvidersTab() {
  const [connected, setConnected] = useState([]);
  const [platformGateway, setPlatformGateway] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [forbidden, setForbidden] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async () => {
    try {
      const res = await fetch("/api/settings/ai-providers");
      if (res.status === 403) {
        setForbidden(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        setConnected(data.connectedProviders || []);
        setPlatformGateway(Boolean(data.platformGateway));
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
        if (res.status === 403) return setForbidden(true);
        if (res.ok) {
          const data = await res.json();
          if (!ignore) {
            setConnected(data.connectedProviders || []);
            setPlatformGateway(Boolean(data.platformGateway));
          }
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });
    return () => {
      ignore = true;
    };
  }, []);

  const refreshModels = async (providerId) => {
    setBusyId(providerId);
    setToast(null);
    try {
      const res = await fetch("/api/settings/ai-providers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providerId }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setToast({ type: "error", text: data.message || "Refresh failed" });
      } else {
        setToast({ type: "success", text: `Synced ${data.modelCount} live models.` });
        await load();
      }
    } finally {
      setBusyId(null);
    }
  };

  const removeProvider = async (providerId) => {
    setBusyId(providerId);
    try {
      await fetch(`/api/settings/ai-providers?providerId=${encodeURIComponent(providerId)}`, { method: "DELETE" });
      await load();
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <AiProvidersSkeleton />;
  if (forbidden) {
    return (
      <div className="p-10 text-center text-sm text-gray-500">
        Only workspace <strong>Owners</strong> and <strong>Admins</strong> can manage AI provider keys.
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8 max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <KeyRound size={18} className="text-indigo-500" />
            AI Providers &amp; Live Model Discovery
          </h2>
          <p className="text-xs text-gray-500 mt-1">
            Add River AI, OpenRouter, Groq, Vercel AI Gateway, or direct keys. DripX verifies the key and shows only models available on it.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-[11px] font-semibold text-emerald-700">
          <ShieldCheck size={13} /> AES-256 Encrypted
        </span>
      </div>

      <AiProviderAddForm onConnected={load} />

      {toast && (
        <div
          className={`rounded-xl px-4 py-2.5 text-xs font-medium border ${
            toast.type === "success" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
          }`}
        >
          {toast.text}
        </div>
      )}

      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Connected Workspace Keys ({connected.length})
        </h3>

        {connected.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-200 p-6 text-center text-xs text-gray-400">
            {platformGateway
              ? "Using platform AI Gateway fallback. Add a workspace BYOK key above to unlock custom providers."
              : "No workspace keys connected yet. Add an API key above to unlock models in AI Agent."}
          </div>
        ) : (
          connected.map((p) => (
            <div key={p.providerId} className="rounded-2xl border border-gray-200/90 bg-white p-4 space-y-3 shadow-2xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-900">{p.label}</span>
                    {p.modelCount > 0 ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <CheckCircle2 size={11} /> {p.modelCount} models active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2.5 py-0.5 text-[11px] font-semibold text-amber-700">
                        <AlertTriangle size={11} /> 0 models synced (Re-verify or Remove)
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    Key: {p.maskedKey} · Endpoint: {p.baseUrl}
                  </p>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    disabled={busyId === p.providerId}
                    onClick={() => refreshModels(p.providerId)}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-3 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    <RefreshCw size={12} className={busyId === p.providerId ? "animate-spin" : ""} />
                    Sync
                  </button>
                  <button
                    type="button"
                    disabled={busyId === p.providerId}
                    onClick={() => removeProvider(p.providerId)}
                    className="inline-flex items-center gap-1 rounded-full border border-rose-200 px-3 py-1 text-[11px] font-semibold text-rose-500 hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>

              {p.syncedModels?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {p.syncedModels.slice(0, 12).map((m) => (
                    <span
                      key={m.id}
                      className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[10.5px] font-medium text-gray-600"
                    >
                      {m.label}
                    </span>
                  ))}
                  {p.syncedModels.length > 12 && (
                    <span className="text-[10.5px] font-semibold text-indigo-500 px-1.5 py-0.5">
                      +{p.syncedModels.length - 12} more
                    </span>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
