"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  Mail,
  Plus,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Loader2,
  Trash2,
  RefreshCw,
  Server,
  Zap,
  ShieldCheck,
  TrendingUp,
  Activity,
  Flame,
  Info,
} from "lucide-react";
import ConnectEmailModal from "./ConnectEmailModal";
import DnsDiagnosticsModal from "./DnsDiagnosticsModal";
import RampUpSettingsModal from "./RampUpSettingsModal";
import TestEmailModal from "./TestEmailModal";

const PROVIDER_INFO = {
  google: {
    label: "Google Workspace / Gmail",
    badgeClass: "bg-red-50 text-red-600 border-red-200",
    icon: Mail,
  },
  microsoft: {
    label: "Microsoft 365 / Outlook",
    badgeClass: "bg-blue-50 text-blue-600 border-blue-200",
    icon: Mail,
  },
  smtp: {
    label: "Custom SMTP",
    badgeClass: "bg-indigo-50 text-indigo-600 border-indigo-200",
    icon: Server,
  },
  resend: {
    label: "Resend Cloud",
    badgeClass: "bg-gray-100 text-gray-700 border-gray-200",
    icon: Zap,
  },
};

export default function EmailAccountsTab() {
  const searchParams = useSearchParams();
  const [accounts, setAccounts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [testingId, setTestingId] = useState(null);

  // Diagnostics & Settings Modals
  const [dnsModalAccount, setDnsModalAccount] = useState(null);
  const [rampUpModalAccount, setRampUpModalAccount] = useState(null);
  const [testModalAccount, setTestModalAccount] = useState(null);

  const [toast, setToast] = useState(() => {
    const connected = searchParams.get("connected");
    const err = searchParams.get("error");
    const email = searchParams.get("email");

    if (connected) {
      return {
        type: "success",
        message: `Successfully connected ${connected.toUpperCase()} mailbox${email ? ` (${email})` : ""}!`,
      };
    }
    if (err) {
      return {
        type: "error",
        message: `Connection failed: ${decodeURIComponent(err)}`,
      };
    }
    return null;
  });

  const loadData = useCallback(async () => {
    try {
      const [accRes, sumRes] = await Promise.all([
        fetch("/api/email-accounts"),
        fetch("/api/email-accounts/health-summary"),
      ]);
      if (accRes.ok) {
        const accData = await accRes.json();
        setAccounts(accData.items || []);
      }
      if (sumRes.ok) {
        const sumData = await sumRes.json();
        setSummary(sumData);
      }
    } catch (err) {
      console.error("Failed to load email accounts data:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    Promise.all([
      fetch("/api/email-accounts").then((r) => r.json()),
      fetch("/api/email-accounts/health-summary").then((r) => r.json()),
    ])
      .then(([accData, sumData]) => {
        if (!active) return;
        setAccounts(accData.items || []);
        setSummary(sumData);
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error("Init load error:", err);
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleTestConnection = async (id) => {
    setTestingId(id);
    try {
      const res = await fetch(`/api/email-accounts/${id}/test`, { method: "POST" });
      const data = await res.json();

      if (data.success) {
        setToast({
          type: "success",
          message: "Connection verified! Mailbox is authorized and ready to send.",
        });
      } else {
        setToast({
          type: "error",
          message: `Verification issue: ${data.verify?.error || "Reconnection required"}`,
        });
      }
      loadData();
    } catch {
      setToast({ type: "error", message: "Failed to communicate with test endpoint" });
    } finally {
      setTestingId(null);
    }
  };

  const handleDeleteAccount = async (id, email) => {
    if (!confirm(`Are you sure you want to disconnect ${email}? Campaigns using this sender will be paused.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/email-accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        setToast({ type: "success", message: `Disconnected ${email}` });
        setAccounts((prev) => prev.filter((a) => a.id !== id));
        loadData();
      }
    } catch {
      setToast({ type: "error", message: "Failed to disconnect account" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {toast && (
        <div
          className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-semibold shadow-xs transition ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === "success" ? (
              <CheckCircle2 size={16} className="text-emerald-600" />
            ) : (
              <AlertCircle size={16} className="text-rose-600" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-gray-400 hover:text-gray-600 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col gap-4 rounded-[26px] border border-gray-200/90 bg-white p-6 shadow-2xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Email Infrastructure & Deliverability</h2>
          <p className="mt-1 text-xs text-gray-400 max-w-xl">
            Monitor mailbox authentication, automated sending ramp-up (warmup), and DNS health
            (SPF, DKIM, DMARC, MX) to maximize cold outreach inbox placement.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus size={15} />
          <span>Connect Email Account</span>
        </button>
      </div>

      {/* Google OAuth Session Expiry Alert Banner */}
      {accounts.some((a) => a.status === "needs_reconnect") && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-rose-200 bg-rose-50/90 p-4 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">Google OAuth Reconnection Required</h4>
              <p className="text-xs text-rose-700 mt-0.5">
                One or more Google Workspace / Gmail sender sessions have expired. Automatic inbox sync and email dispatches are paused until re-authenticated.
              </p>
            </div>
          </div>
          <Link
            href="/api/email-accounts/google/auth"
            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer shrink-0"
          >
            <RefreshCw size={13} />
            <span>Reconnect Google Account</span>
          </Link>
        </div>
      )}

      {/* Deliverability Health Overview KPIs Bar */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Connected Senders</span>
              <Mail size={16} className="text-gray-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-800">{summary.totalAccounts}</span>
              <span className="text-[11px] font-semibold text-emerald-600">Active</span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Deliverability Index</span>
              <ShieldCheck size={16} className="text-indigo-400" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-indigo-400">
                {summary.averageDnsScore}%
              </span>
              <span className="text-[11px] font-bold text-gray-500">
                {summary.averageDnsScore >= 90
                  ? "Optimal"
                  : summary.averageDnsScore >= 70
                    ? "Good"
                    : "Needs Fix"}
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Daily Capacity</span>
              <Activity size={16} className="text-emerald-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-800">
                {summary.totalDailyCapacity}
              </span>
              <span className="text-[11px] font-semibold text-gray-400">
                {summary.todayTotalSent} sent today
              </span>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-400">Warmup Monitor</span>
              <Flame size={16} className="text-amber-500" />
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-2xl font-black text-gray-800">
                {summary.warmingUpCount}
              </span>
              <span className="text-[11px] font-semibold text-amber-600">
                warming up · {summary.graduatedCount} graduated
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Accounts List */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-16 text-xs text-gray-400">
          <Loader2 size={18} className="animate-spin mr-2 text-indigo-400" />
          <span>Loading sender accounts and deliverability records...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-12 text-center shadow-2xs">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 border border-indigo-100 text-indigo-400">
            <Mail size={24} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-gray-800">No email accounts connected yet</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-gray-400">
            Connect an outreach mailbox via Google Workspace, Microsoft 365, or SMTP to begin warmups and campaign dispatches.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-indigo-400 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Plus size={14} /> Connect your first mailbox
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {accounts.map((acc, accIdx) => {
            const pInfo = PROVIDER_INFO[acc.provider] || PROVIDER_INFO.smtp;
            const Icon = pInfo.icon;
            const isConnected = acc.status === "connected";
            const rampUp = acc.rampUpStatus || {};
            const effectiveCap = rampUp.currentEffectiveLimit || acc.dailyLimit || 40;
            const todaySent = acc.todaySentCount || 0;
            const sentPct = Math.min(100, Math.round((todaySent / effectiveCap) * 100));

            const dnsScore = acc.dnsHealth?.score ?? 100;
            const dnsRating = acc.dnsHealth?.rating ?? "optimal";

            return (
              <div
                key={acc.id ? `${acc.id}-${accIdx}` : accIdx}
                className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-2xs transition hover:border-gray-200 lg:flex-row lg:items-center lg:justify-between"
              >
                {/* Mailbox Identity */}
                <div className="flex items-start gap-3.5 min-w-[260px]">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 text-gray-600 shadow-2xs">
                    <Icon size={22} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-gray-800">{acc.email}</p>
                      <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold ${pInfo.badgeClass}`}>
                        {pInfo.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                      <span>{acc.name ? `Sender: ${acc.name}` : "Personal Outreach"}</span>
                      {acc.smtpConfig && <span>Host: {acc.smtpConfig.host}</span>}
                    </div>
                    {acc.lastError && (
                      <p className="mt-1 flex items-center gap-1 text-[11px] font-medium text-rose-600 truncate max-w-md">
                        <AlertCircle size={12} className="shrink-0" />
                        <span>{acc.lastError}</span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Health & Warmup Diagnostics Center */}
                <div className="flex flex-wrap items-center gap-5 sm:gap-6">
                  {/* Connection & DNS Badges */}
                  <div className="flex items-center gap-2">
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        Connected
                      </span>
                    ) : acc.status === "needs_reconnect" ? (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-bold text-rose-700">
                          <AlertCircle size={12} className="text-rose-500 animate-pulse" />
                          Session Expired
                        </span>
                        {acc.provider === "google" && (
                          <Link
                            href="/api/email-accounts/google/auth"
                            className="inline-flex items-center gap-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white px-3 py-1.5 text-xs font-bold shadow-xs transition active:scale-95 cursor-pointer"
                          >
                            <RefreshCw size={12} />
                            <span>Reconnect Google Account</span>
                          </Link>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                        <AlertTriangle size={12} />
                        Reconnect
                      </span>
                    )}

                    {/* DNS Health Pill */}
                    <button
                      onClick={() => setDnsModalAccount(acc)}
                      title="Click to inspect DNS records"
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold border shadow-2xs transition hover:opacity-90 active:scale-95 cursor-pointer ${
                        dnsRating === "optimal"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : dnsRating === "good"
                            ? "border-blue-200 bg-blue-50 text-blue-700"
                            : dnsRating === "warning"
                              ? "border-amber-200 bg-amber-50 text-amber-700"
                              : "border-rose-200 bg-rose-50 text-rose-700"
                      }`}
                    >
                      <ShieldCheck size={12} />
                      <span>DNS {dnsScore}%</span>
                    </button>
                  </div>

                  {/* Sending Ramp-Up Stage */}
                  <div className="min-w-[130px]">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500 mb-1">
                      <span className="flex items-center gap-1">
                        <Flame size={12} className={rampUp.isWarmingUp ? "text-amber-500" : "text-gray-400"} />
                        {rampUp.isWarmingUp ? `Warmup Day ${rampUp.currentDay}` : "Graduated"}
                      </span>
                      <span className="font-bold text-gray-700">{effectiveCap}/day</span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-indigo-400 transition-all"
                        style={{ width: `${rampUp.progressPct || 100}%` }}
                      />
                    </div>
                  </div>

                  {/* Today's Daily Quota Meter */}
                  <div className="w-32">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1">
                      <span>Today</span>
                      <span className="text-gray-800 font-bold">
                        {todaySent} / {effectiveCap}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full bg-indigo-400 transition-all"
                        style={{ width: `${sentPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    {/* DNS Diagnostics Button */}
                    <button
                      onClick={() => setDnsModalAccount(acc)}
                      title="Inspect SPF, DKIM, DMARC, MX"
                      className="flex items-center gap-1 rounded-full border border-gray-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 active:scale-95 cursor-pointer"
                    >
                      <ShieldCheck size={13} />
                      <span>DNS</span>
                    </button>

                    {/* Ramp-Up Settings Button */}
                    <button
                      onClick={() => setRampUpModalAccount(acc)}
                      title="Adjust sending ramp-up and daily caps"
                      className="flex items-center gap-1 rounded-full border border-gray-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 active:scale-95 cursor-pointer"
                    >
                      <TrendingUp size={13} />
                      <span>Ramp-Up</span>
                    </button>

                    {/* Test & Verify Button */}
                    <button
                      onClick={() => setTestModalAccount(acc)}
                      title="Test real outbound and inbound delivery"
                      className="flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 active:scale-95 cursor-pointer"
                    >
                      <Zap size={13} className="text-indigo-400" />
                      <span>Test & Verify</span>
                    </button>

                    {/* Disconnect Button */}
                    <button
                      onClick={() => handleDeleteAccount(acc.id, acc.email)}
                      title="Disconnect mailbox"
                      className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200/90 bg-white text-gray-400 shadow-2xs transition hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 active:scale-95 cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Google Cloud OAuth Production Mode Documentation Guide */}
      <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-2xs">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-400 border border-indigo-100">
            <Info size={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-gray-800">
              Preventing 7-Day Google OAuth Token Expiration (invalid_grant)
            </h3>
            <p className="mt-1 text-xs text-gray-500 leading-relaxed">
              Google Cloud projects with an OAuth consent screen set to <strong>&ldquo;Testing&rdquo;</strong> status automatically expire refresh tokens after exactly <strong>7 days</strong>. When this happens, Google API calls fail with <code className="bg-gray-100 px-1 py-0.5 rounded text-[11px] font-mono text-rose-600">invalid_grant</code> and synchronization is paused.
            </p>

            <div className="mt-3.5 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Step 1</span>
                <p className="mt-1 text-xs font-semibold text-gray-800">Open Google Cloud Console</p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Go to <strong>APIs &amp; Services</strong> &rarr; <strong>OAuth consent screen</strong>.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Step 2</span>
                <p className="mt-1 text-xs font-semibold text-gray-800">Switch to In Production</p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Under <em>Publishing status</em>, click <strong>&ldquo;PUBLISH APP&rdquo;</strong> and confirm the prompt.
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-gray-50/70 p-3.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400">Step 3</span>
                <p className="mt-1 text-xs font-semibold text-gray-800">Permanent Authorization</p>
                <p className="mt-0.5 text-[11px] text-gray-500">
                  Tokens remain active indefinitely without the 7-day expiration cutoff.
                </p>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-gray-400">
              * Note: Verification by Google is optional for internal workspaces (up to 100 test users). If an &ldquo;unverified app&rdquo; screen appears during consent, click <em>Advanced &rarr; Go to DripX (unsafe)</em> to proceed.
            </p>
          </div>
        </div>
      </div>

      {/* Connect Email Modal */}
      <ConnectEmailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnected={() => {
          loadData();
          setToast({ type: "success", message: "Account connected successfully!" });
        }}
      />

      {/* DNS Diagnostics Modal */}
      {dnsModalAccount && (
        <DnsDiagnosticsModal
          isOpen={Boolean(dnsModalAccount)}
          account={dnsModalAccount}
          onClose={() => setDnsModalAccount(null)}
          onUpdated={loadData}
        />
      )}

      {/* Ramp-Up Settings Modal */}
      {rampUpModalAccount && (
        <RampUpSettingsModal
          isOpen={Boolean(rampUpModalAccount)}
          account={rampUpModalAccount}
          onClose={() => setRampUpModalAccount(null)}
          onUpdated={loadData}
        />
      )}

      {/* Test & Verification Modal */}
      {testModalAccount && (
        <TestEmailModal
          isOpen={Boolean(testModalAccount)}
          account={testModalAccount}
          onClose={() => setTestModalAccount(null)}
          onVerified={loadData}
        />
      )}
    </div>
  );
}
