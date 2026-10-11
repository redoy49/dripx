"use client";

import { useState, useEffect, useCallback } from "react";
import {
  X,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  RefreshCw,
  Loader2,
  ExternalLink,
  HelpCircle,
  Server,
  KeyRound,
  FileText,
  Mail,
} from "lucide-react";

export default function DnsDiagnosticsModal({ isOpen, onClose, account, onUpdated }) {
  const [data, setData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [customSelector, setCustomSelector] = useState("");
  const [copiedKey, setCopiedKey] = useState(null);
  const [activeTab, setActiveTab] = useState("diagnostic"); // "diagnostic" | "records"

  const loading = data === null || refreshing;

  useEffect(() => {
    if (!isOpen || !account?.id) return;
    let ignore = false;
    const selector = account.rampUp?.customDkimSelector || "";
    const url = selector
      ? `/api/email-accounts/${account.id}/dns?selector=${encodeURIComponent(selector)}`
      : `/api/email-accounts/${account.id}/dns`;

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load DNS diagnostics");
        return res.json();
      })
      .then((json) => {
        if (!ignore) {
          setData(json);
          onUpdated?.();
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("DNS fetch error:", err);
          setError("Unable to query DNS records. Verify your domain and internet connection.");
        }
      });

    return () => {
      ignore = true;
    };
  }, [isOpen, account?.id, account?.rampUp?.customDkimSelector, onUpdated]);

  const handleManualCheck = async (selector = null) => {
    if (!account?.id) return;
    setRefreshing(true);
    setError(null);
    try {
      const url = selector
        ? `/api/email-accounts/${account.id}/dns?selector=${encodeURIComponent(selector)}`
        : `/api/email-accounts/${account.id}/dns`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to load DNS diagnostics");
      const json = await res.json();
      setData(json);
      onUpdated?.();
    } catch (err) {
      console.error("DNS fetch error:", err);
      setError("Unable to query DNS records. Verify your domain and internet connection.");
    } finally {
      setRefreshing(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = (key, text) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const score = data?.score ?? 0;
  const rating = data?.rating ?? "critical";

  const getStatusBadge = (status) => {
    if (status === "valid") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[11px] font-bold text-emerald-700 border border-emerald-200">
          <CheckCircle2 size={12} />
          Passed
        </span>
      );
    }
    if (status === "warning") {
      return (
        <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700 border border-amber-200">
          <AlertTriangle size={12} />
          Warning
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2 py-0.5 text-[11px] font-bold text-rose-700 border border-rose-200">
        <XCircle size={12} />
        Missing / Invalid
      </span>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-linear-to-r from-violet-50/50 via-white to-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6367FF]/10 text-[#6367FF]">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-800">DNS & Deliverability Diagnostics</h3>
                {data && (
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      rating === "optimal"
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                        : rating === "good"
                          ? "bg-blue-100 text-blue-800 border border-blue-200"
                          : rating === "warning"
                            ? "bg-amber-100 text-amber-800 border border-amber-200"
                            : "bg-rose-100 text-rose-800 border border-rose-200"
                    }`}
                  >
                    {rating} ({score}/100)
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                Domain: <span className="font-semibold text-gray-600">{data?.domain || account.email}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 bg-gray-50/50 px-6">
          <button
            onClick={() => setActiveTab("diagnostic")}
            className={`border-b-2 py-3 px-4 text-xs font-bold transition ${
              activeTab === "diagnostic"
                ? "border-[#6367FF] text-[#6367FF]"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            Live Records Inspection
          </button>
          <button
            onClick={() => setActiveTab("records")}
            className={`border-b-2 py-3 px-4 text-xs font-bold transition ${
              activeTab === "records"
                ? "border-[#6367FF] text-[#6367FF]"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            Recommended DNS Snippets
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 text-center text-xs text-gray-400 space-y-3">
              <Loader2 size={24} className="animate-spin text-[#6367FF]" />
              <p className="font-medium">Querying authoritative nameservers for SPF, DKIM, DMARC, and MX...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
              {error}
            </div>
          ) : activeTab === "diagnostic" ? (
            <>
              {/* Score Meter Banner */}
              <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-linear-to-r from-violet-500 to-[#6367FF] p-4 text-white shadow-xs">
                <div>
                  <p className="text-xs font-medium text-violet-100">Overall Deliverability Index</p>
                  <h4 className="text-2xl font-black">{score}% Health</h4>
                  <p className="text-[11px] text-violet-100/90 mt-0.5">
                    {score >= 90
                      ? "All major deliverability protocols are verified. Emails reach primary inboxes."
                      : score >= 70
                        ? "Good configuration, but minor improvements recommended to avoid spam folders."
                        : "Deliverability warnings detected. Fix SPF/DMARC to prevent email rejection."}
                  </p>
                </div>
                <button
                  onClick={() => handleManualCheck(customSelector || null)}
                  disabled={loading}
                  className="flex items-center gap-1.5 rounded-xl bg-white/20 hover:bg-white/30 backdrop-blur-xs px-3.5 py-2 text-xs font-bold text-white transition disabled:opacity-50"
                >
                  <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
                  <span>Re-check DNS</span>
                </button>
              </div>

              {/* 1. SPF Check */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-[#6367FF]" />
                    <span className="text-xs font-bold text-gray-800">SPF (Sender Policy Framework)</span>
                  </div>
                  {getStatusBadge(data.spf?.status)}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{data.spf?.message}</p>
                {data.spf?.record && (
                  <div className="rounded-xl bg-gray-50 p-2.5 font-mono text-[11px] text-gray-700 break-all border border-gray-200/60">
                    {data.spf.record}
                  </div>
                )}
                {data.spf?.recommendation && (
                  <p className="text-[11px] font-medium text-rose-600 bg-rose-50/60 p-2 rounded-lg border border-rose-100">
                    Fix: {data.spf.recommendation}
                  </p>
                )}
              </div>

              {/* 2. DKIM Check */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <KeyRound size={16} className="text-[#6367FF]" />
                    <span className="text-xs font-bold text-gray-800">DKIM (DomainKeys Identified Mail)</span>
                  </div>
                  {getStatusBadge(data.dkim?.status)}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{data.dkim?.message}</p>
                {data.dkim?.record && (
                  <div className="rounded-xl bg-gray-50 p-2.5 font-mono text-[11px] text-gray-700 break-all border border-gray-200/60 max-h-24 overflow-y-auto">
                    {data.dkim.record}
                  </div>
                )}

                {/* Custom Selector Input */}
                <div className="pt-1 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder={`Current selector: ${data.dkim?.selector || "google"}`}
                    value={customSelector}
                    onChange={(e) => setCustomSelector(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-[#6367FF]"
                  />
                  <button
                    onClick={() => handleManualCheck(customSelector)}
                    className="rounded-xl bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-200 transition"
                  >
                    Test Selector
                  </button>
                </div>
              </div>

              {/* 3. DMARC Check */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={16} className="text-[#6367FF]" />
                    <span className="text-xs font-bold text-gray-800">DMARC (Anti-Spoofing Policy)</span>
                  </div>
                  {getStatusBadge(data.dmarc?.status)}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{data.dmarc?.message}</p>
                {data.dmarc?.record && (
                  <div className="rounded-xl bg-gray-50 p-2.5 font-mono text-[11px] text-gray-700 break-all border border-gray-200/60">
                    {data.dmarc.record}
                  </div>
                )}
                {data.dmarc?.recommendation && (
                  <p className="text-[11px] font-medium text-amber-700 bg-amber-50/60 p-2 rounded-lg border border-amber-100">
                    Tip: {data.dmarc.recommendation}
                  </p>
                )}
              </div>

              {/* 4. MX Check */}
              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Server size={16} className="text-[#6367FF]" />
                    <span className="text-xs font-bold text-gray-800">MX (Mail Exchange Server)</span>
                  </div>
                  {getStatusBadge(data.mx?.status)}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">{data.mx?.message}</p>
                {data.mx?.records && data.mx.records.length > 0 && (
                  <div className="rounded-xl bg-gray-50 p-2.5 font-mono text-[11px] text-gray-700 border border-gray-200/60 space-y-1">
                    {data.mx.records.map((r, i) => (
                      <div key={i}>{r}</div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Recommended Snippets Tab */
            <div className="space-y-4">
              <p className="text-xs text-gray-500">
                Copy and add the following records to your DNS provider (Cloudflare, GoDaddy, Namecheap, Route 53)
                to achieve optimal deliverability for <span className="font-semibold text-gray-700">{data.domain}</span>:
              </p>

              {(data.remediationGuides || []).map((guide, idx) => (
                <div key={idx} className="rounded-2xl border border-gray-200/80 bg-gray-50/50 p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-violet-100 px-2 py-0.5 text-[10px] font-black text-violet-700 uppercase">
                        {guide.type}
                      </span>
                      <span className="text-xs font-bold text-gray-800">{guide.purpose}</span>
                    </div>
                    <button
                      onClick={() => handleCopy(`val-${idx}`, guide.value)}
                      className="inline-flex items-center gap-1 rounded-lg bg-white border border-gray-200 px-2.5 py-1 text-[11px] font-semibold text-gray-600 hover:bg-gray-50 transition shadow-2xs"
                    >
                      {copiedKey === `val-${idx}` ? (
                        <>
                          <Check size={12} className="text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy size={12} />
                          <span>Copy Value</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-white p-2 rounded-xl border border-gray-200">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">Host / Name</span>
                      <span className="font-mono text-gray-800 font-semibold">{guide.name}</span>
                    </div>
                    <div className="sm:col-span-3 bg-white p-2 rounded-xl border border-gray-200 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Value / Content</span>
                        <span className="font-mono text-gray-800 truncate block">{guide.value}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
          <span className="text-[11px] text-gray-400">
            Evaluated on {data?.evaluatedAt ? new Date(data.evaluatedAt).toLocaleTimeString() : "just now"}
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-gray-800 hover:bg-gray-900 px-5 py-2 text-xs font-bold text-white transition shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
