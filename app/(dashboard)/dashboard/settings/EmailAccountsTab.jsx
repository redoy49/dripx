"use client";

import { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import ConnectEmailModal from "./ConnectEmailModal";

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
    badgeClass: "bg-violet-50 text-violet-600 border-violet-200",
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
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [testingId, setTestingId] = useState(null);

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

  const loadAccounts = useCallback(async () => {
    try {
      const res = await fetch("/api/email-accounts");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data.items || []);
      }
    } catch (err) {
      console.error("Failed to load email accounts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/email-accounts")
      .then((res) => res.json())
      .then((data) => {
        if (active) {
          setAccounts(data.items || []);
          setLoading(false);
        }
      })
      .catch(() => {
        if (active) setLoading(false);
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
      loadAccounts();
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
          className={`flex items-center justify-between rounded-2xl border p-4 text-xs font-semibold shadow-sm transition ${
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
      <div className="flex flex-col gap-4 rounded-3xl border border-gray-100 bg-white p-6 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-800">Connected Outreach Mailboxes</h2>
          <p className="mt-1 text-xs text-gray-400 max-w-xl">
            Connect Google Workspace, Microsoft 365, or SMTP mailboxes to send automated cold email sequences.
            Each account adheres to its daily cap to protect domain reputation.
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-[#6367FF] px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5254e8]"
        >
          <Plus size={15} />
          <span>Connect Email Account</span>
        </button>
      </div>

      {/* Accounts List */}
      {loading ? (
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-white py-16 text-xs text-gray-400">
          <Loader2 size={18} className="animate-spin mr-2 text-[#6367FF]" />
          <span>Loading sender accounts...</span>
        </div>
      ) : accounts.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-gray-200 bg-white p-12 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6367FF]/10 text-[#6367FF]">
            <Mail size={24} />
          </div>
          <h3 className="mt-4 text-sm font-bold text-gray-800">No email accounts connected yet</h3>
          <p className="mx-auto mt-1 max-w-md text-xs text-gray-400">
            Connect an outreach mailbox via Google OAuth, Microsoft Entra, or SMTP to start launching email drip campaigns.
          </p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-[#6367FF] px-5 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#5254e8]"
          >
            <Plus size={14} /> Connect your first mailbox
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {accounts.map((acc) => {
            const pInfo = PROVIDER_INFO[acc.provider] || PROVIDER_INFO.smtp;
            const Icon = pInfo.icon;
            const isConnected = acc.status === "connected";
            const sentPct = Math.min(100, Math.round(((acc.todaySentCount || 0) / (acc.dailyLimit || 40)) * 100));

            return (
              <div
                key={acc.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-xs transition hover:border-gray-200 sm:flex-row sm:items-center sm:justify-between"
              >
                {/* Mailbox Identity */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gray-50 border border-gray-100 text-gray-600">
                    <Icon size={20} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-bold text-gray-800">{acc.email}</p>
                      <span className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${pInfo.badgeClass}`}>
                        {pInfo.label}
                      </span>
                    </div>
                    <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                      <span>{acc.name ? `Sender: ${acc.name}` : "Personal Outreach"}</span>
                      {acc.smtpConfig && <span>Host: {acc.smtpConfig.host}</span>}
                    </div>
                  </div>
                </div>

                {/* Health & Daily Sending Meter */}
                <div className="flex flex-wrap items-center gap-6">
                  {/* Status Pill */}
                  <div className="flex items-center gap-1.5">
                    {isConnected ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Connected
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold text-amber-700">
                        <AlertTriangle size={12} />
                        Needs Reconnect
                      </span>
                    )}
                  </div>

                  {/* Daily Sending Progress */}
                  <div className="w-36">
                    <div className="flex justify-between text-[11px] font-semibold text-gray-500 mb-1">
                      <span>Today&apos;s sent</span>
                      <span className="text-gray-700 font-bold">
                        {acc.todaySentCount || 0}/{acc.dailyLimit || 40}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full bg-[#6367FF] transition-all"
                        style={{ width: `${sentPct}%` }}
                      />
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleTestConnection(acc.id)}
                      disabled={testingId === acc.id}
                      title="Test connection handshake"
                      className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-2xs transition hover:bg-gray-50 disabled:opacity-50"
                    >
                      {testingId === acc.id ? (
                        <Loader2 size={13} className="animate-spin" />
                      ) : (
                        <RefreshCw size={13} />
                      )}
                      <span>Test</span>
                    </button>

                    <button
                      onClick={() => handleDeleteAccount(acc.id, acc.email)}
                      title="Disconnect mailbox"
                      className="flex h-8 w-8 items-center justify-center rounded-xl text-gray-400 transition hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Connect Modal */}
      <ConnectEmailModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConnected={() => {
          loadAccounts();
          setToast({ type: "success", message: "Account connected successfully!" });
        }}
      />
    </div>
  );
}
