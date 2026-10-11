"use client";

import { useState } from "react";
import {
  X,
  Mail,
  Server,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  ExternalLink,
} from "lucide-react";

const SMTP_PRESETS = [
  { label: "Custom SMTP", host: "", port: 587, secure: false },
  { label: "Google App Password", host: "smtp.gmail.com", port: 587, secure: false },
  { label: "Microsoft 365 / Outlook", host: "smtp.office365.com", port: 587, secure: false },
  { label: "Zoho Mail", host: "smtp.zoho.com", port: 465, secure: true },
  { label: "Amazon SES", host: "email-smtp.us-east-1.amazonaws.com", port: 587, secure: false },
];

export default function ConnectEmailModal({ open, onClose, onConnected }) {
  const [selectedProvider, setSelectedProvider] = useState(null); // 'google' | 'microsoft' | 'smtp' | 'resend'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // SMTP Form State
  const [presetIndex, setPresetIndex] = useState(0);
  const [smtpForm, setSmtpForm] = useState({
    email: "",
    name: "",
    host: "",
    port: 587,
    secure: false,
    user: "",
    pass: "",
    dailyLimit: 40,
  });

  if (!open) return null;

  const handleSelectPreset = (idx) => {
    setPresetIndex(idx);
    const p = SMTP_PRESETS[idx];
    if (p.host) {
      setSmtpForm((prev) => ({
        ...prev,
        host: p.host,
        port: p.port,
        secure: p.secure,
      }));
    }
  };

  const handleSmtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/email-accounts/smtp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smtpForm),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to verify and save SMTP connection");
      }

      setSuccess(true);
      setTimeout(() => {
        onConnected?.(data);
        onClose();
      }, 1200);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartOAuth = (provider) => {
    setLoading(true);
    window.location.href = `/api/email-accounts/${provider}/auth`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl transition-all">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-6 py-4">
          <div>
            <h3 className="text-base font-bold text-gray-800">Connect Email Account</h3>
            <p className="text-xs text-gray-400">
              Link an outreach mailbox to send personalized drip sequences
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/70 p-3 text-xs font-medium text-rose-700">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-semibold text-emerald-800">
              <CheckCircle2 size={16} className="shrink-0 text-emerald-600" />
              <span>Connection verified successfully! Account ready for campaigns.</span>
            </div>
          )}

          {/* STEP 1: Provider Selection */}
          {!selectedProvider && (
            <div className="space-y-4">
              <p className="text-xs font-medium text-gray-500">
                Choose your email provider or connection protocol:
              </p>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {/* Google Workspace */}
                <button
                  type="button"
                  onClick={() => setSelectedProvider("google")}
                  className="group flex flex-col items-start rounded-2xl border border-gray-200 p-4 text-left transition hover:border-[#6367FF] hover:bg-[#6367FF]/[0.02] hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
                    <Mail size={20} />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Google Workspace / Gmail</span>
                  <span className="mt-1 text-[11px] text-gray-400">
                    Official OAuth 2.0 connection. Recommended for high inbox deliverability.
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#6367FF] group-hover:underline">
                    Connect via Google <ArrowRight size={12} />
                  </span>
                </button>

                {/* Microsoft 365 */}
                <button
                  type="button"
                  onClick={() => setSelectedProvider("microsoft")}
                  className="group flex flex-col items-start rounded-2xl border border-gray-200 p-4 text-left transition hover:border-[#6367FF] hover:bg-[#6367FF]/[0.02] hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Mail size={20} />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Microsoft 365 / Outlook</span>
                  <span className="mt-1 text-[11px] text-gray-400">
                    Official Entra ID OAuth. Ideal for corporate Outlook/Exchange mailboxes.
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#6367FF] group-hover:underline">
                    Connect via Microsoft <ArrowRight size={12} />
                  </span>
                </button>

                {/* Custom SMTP */}
                <button
                  type="button"
                  onClick={() => setSelectedProvider("smtp")}
                  className="group flex flex-col items-start rounded-2xl border border-gray-200 p-4 text-left transition hover:border-[#6367FF] hover:bg-[#6367FF]/[0.02] hover:shadow-md"
                >
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                    <Server size={20} />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Custom SMTP Account</span>
                  <span className="mt-1 text-[11px] text-gray-400">
                    Connect via SMTP host credentials (Zoho, SES, Fastmail, or App Passwords).
                  </span>
                  <span className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-[#6367FF] group-hover:underline">
                    Configure SMTP <ArrowRight size={12} />
                  </span>
                </button>

                {/* Safe Development Mode Note */}
                <div className="flex flex-col justify-between rounded-2xl border border-dashed border-gray-200 bg-gray-50/60 p-4">
                  <div>
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-bold text-gray-700">
                      <ShieldCheck size={16} className="text-emerald-600" />
                      <span>Zero-Cost Testing</span>
                    </div>
                    <p className="text-[11px] text-gray-500">
                      In dev mode, DripX safely simulates sending without sending real emails when unconfigured.
                    </p>
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">Free Tier Ready</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2A: Google OAuth Flow */}
          {selectedProvider === "google" && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100 text-red-600 shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Google Workspace Authorization</h4>
                  <p className="text-xs text-gray-400">
                    You will be redirected to Google&apos;s official sign-in page to authorize sending.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-3.5 text-xs text-gray-600 space-y-1.5">
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                  <ShieldCheck size={14} className="text-[#6367FF]" />
                  <span>Security &amp; Permissions Guarantee:</span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  • We only request minimal permission to dispatch campaign emails on your behalf.
                </p>
                <p className="text-gray-500 text-[11px]">
                  • Your Google account password is never entered into or stored by DripX.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => handleStartOAuth("google")}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-[#6367FF] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#5254e8] disabled:opacity-60"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <span>Sign in with Google</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2B: Microsoft OAuth Flow */}
          {selectedProvider === "microsoft" && (
            <div className="space-y-4 py-2">
              <div className="flex items-center gap-3 rounded-2xl bg-gray-50 p-4 border border-gray-100">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shrink-0">
                  <Mail size={22} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-800">Microsoft 365 Authorization</h4>
                  <p className="text-xs text-gray-400">
                    You will be redirected to Microsoft Entra sign-in to authorize Outlook mail dispatch.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-gray-100 bg-white p-3.5 text-xs text-gray-600 space-y-1.5">
                <div className="flex items-center gap-2 text-gray-700 font-semibold">
                  <ShieldCheck size={14} className="text-[#6367FF]" />
                  <span>Permissions:</span>
                </div>
                <p className="text-gray-500 text-[11px]">
                  • Microsoft Graph Mail.Send scope to send outreach emails from your work mailbox.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => handleStartOAuth("microsoft")}
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-[#6367FF] px-5 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#5254e8] disabled:opacity-60"
                >
                  {loading && <Loader2 size={14} className="animate-spin" />}
                  <span>Sign in with Microsoft</span>
                  <ExternalLink size={12} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2C: SMTP Setup Form */}
          {selectedProvider === "smtp" && (
            <form onSubmit={handleSmtpSubmit} className="space-y-3.5">
              {/* Presets Bar */}
              <div>
                <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                  Quick Provider Preset
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {SMTP_PRESETS.map((p, i) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => handleSelectPreset(i)}
                      className={`rounded-lg px-2.5 py-1 text-xs font-medium transition ${
                        presetIndex === i
                          ? "bg-[#6367FF] text-white"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Sender Email *</label>
                  <input
                    type="email"
                    required
                    value={smtpForm.email}
                    onChange={(e) =>
                      setSmtpForm((prev) => ({
                        ...prev,
                        email: e.target.value,
                        user: prev.user || e.target.value,
                      }))
                    }
                    placeholder="alex@company.com"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#6367FF]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Display Name</label>
                  <input
                    type="text"
                    value={smtpForm.name}
                    onChange={(e) => setSmtpForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Alex Bennett"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#6367FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="mb-1 block text-xs font-semibold text-gray-700">SMTP Host *</label>
                  <input
                    type="text"
                    required
                    value={smtpForm.host}
                    onChange={(e) => setSmtpForm((prev) => ({ ...prev, host: e.target.value }))}
                    placeholder="smtp.example.com"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#6367FF]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Port *</label>
                  <input
                    type="number"
                    required
                    value={smtpForm.port}
                    onChange={(e) => setSmtpForm((prev) => ({ ...prev, port: Number(e.target.value) }))}
                    placeholder="587"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#6367FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">Username *</label>
                  <input
                    type="text"
                    required
                    value={smtpForm.user}
                    onChange={(e) => setSmtpForm((prev) => ({ ...prev, user: e.target.value }))}
                    placeholder="Username or email"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#6367FF]"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-semibold text-gray-700">
                    Password / App Password *
                  </label>
                  <input
                    type="password"
                    required
                    value={smtpForm.pass}
                    onChange={(e) => setSmtpForm((prev) => ({ ...prev, pass: e.target.value }))}
                    placeholder="••••••••••••"
                    className="w-full rounded-xl border border-gray-200 px-3 py-2 text-xs text-gray-800 outline-none focus:border-[#6367FF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-3">
                <button
                  type="button"
                  onClick={() => setSelectedProvider(null)}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-500 hover:bg-gray-100"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-[#6367FF] px-6 py-2.5 text-xs font-semibold text-white shadow-md transition hover:bg-[#5254e8] disabled:opacity-60"
                >
                  {loading && <Loader2 size={13} className="animate-spin" />}
                  <span>{loading ? "Verifying Handshake..." : "Verify & Save Account"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
