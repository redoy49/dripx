"use client";

import { useState } from "react";
import {
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Inbox,
  ShieldCheck,
  Zap,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

export default function TestEmailModal({ isOpen, onClose, account, onVerified }) {
  const [recipient, setRecipient] = useState(account?.email || "");
  const [activeStep, setActiveStep] = useState(null); // 'handshake' | 'outbound' | 'inbound' | 'full'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [handshakeResult, setHandshakeResult] = useState(null);
  const [outboundResult, setOutboundResult] = useState(null);
  const [inboundResult, setInboundResult] = useState(null);

  if (!isOpen || !account) return null;

  const handleTestHandshake = async () => {
    setLoading(true);
    setActiveStep("handshake");
    setError(null);
    try {
      const res = await fetch(`/api/email-accounts/${account.id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "handshake" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Handshake verification failed");

      setHandshakeResult(data.handshake);
      onVerified?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setActiveStep(null);
    }
  };

  const handleSendTestEmail = async (e) => {
    e?.preventDefault();
    if (!recipient.trim()) return;

    setLoading(true);
    setActiveStep("outbound");
    setError(null);
    try {
      const res = await fetch(`/api/email-accounts/${account.id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send_test",
          sendTestTo: recipient.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Outbound email test failed");

      setOutboundResult(data.outbound);
      onVerified?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setActiveStep(null);
    }
  };

  const handleTestInbound = async () => {
    setLoading(true);
    setActiveStep("inbound");
    setError(null);
    try {
      const res = await fetch(`/api/email-accounts/${account.id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "inbound_test" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Inbound loopback test failed");

      setInboundResult(data.inbound);
      onVerified?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setActiveStep(null);
    }
  };

  const handleRunFullAudit = async () => {
    setLoading(true);
    setActiveStep("full");
    setError(null);
    try {
      const res = await fetch(`/api/email-accounts/${account.id}/test`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "full_audit",
          sendTestTo: recipient.trim() || account.email,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Full diagnostic audit failed");

      setHandshakeResult(data.handshake);
      setOutboundResult(data.outbound);
      setInboundResult(data.inbound);
      onVerified?.();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setActiveStep(null);
    }
  };

  const isAllReady =
    (handshakeResult?.success || account.status === "connected") &&
    outboundResult?.success &&
    inboundResult?.success;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 bg-linear-to-r from-violet-50/60 to-white p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6367FF]/10 text-[#6367FF]">
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Pre-Campaign Mailbox Verification</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Verify sending, receiving, and authentication for{" "}
                <span className="font-semibold text-gray-700">{account.email}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        </div>

        {/* Modal Scroll Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {error && (
            <div className="flex items-start gap-2.5 rounded-2xl border border-rose-200 bg-rose-50/80 p-3.5 text-xs text-rose-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Readiness Banner */}
          {isAllReady ? (
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">100% Ready for Campaigns</p>
                <p className="text-[11px] text-emerald-700 mt-0.5">
                  Outbound dispatch and inbox receiving are verified. Your mailbox is authorized and safe to launch.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/80 p-3.5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#6367FF]" />
                <span className="text-xs font-semibold text-gray-700">Pre-Flight Test Suite</span>
              </div>
              <button
                type="button"
                onClick={handleRunFullAudit}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#6367FF] px-4 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-[#5254e8] disabled:opacity-50"
              >
                {loading && activeStep === "full" ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Zap size={13} />
                )}
                <span>Run Full 3-in-1 Audit</span>
              </button>
            </div>
          )}

          {/* Step 1: Authentication & API Handshake */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-50 text-[#6367FF]">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">1. Authentication & API Handshake</h4>
                  <p className="text-[11px] text-gray-400">Verifies OAuth credentials and sending permissions</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTestHandshake}
                disabled={loading}
                className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                {loading && activeStep === "handshake" ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Zap size={12} />
                )}
                <span>Check Handshake</span>
              </button>
            </div>

            {handshakeResult && (
              <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50/60 p-2.5 text-[11px] font-medium text-emerald-800">
                <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                <span>
                  Authorized successfully via {account.provider.toUpperCase()} (Email: {handshakeResult.details?.emailAddress || account.email})
                </span>
              </div>
            )}
          </div>

          {/* Step 2: Outbound Send Verification */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4.5 shadow-2xs">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                <Send size={14} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">2. Real Outbound Delivery Test</h4>
                <p className="text-[11px] text-gray-400">Send an authentic email to verify external delivery</p>
              </div>
            </div>

            <form onSubmit={handleSendTestEmail} className="mt-3.5 flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                placeholder="Enter destination email address"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="flex-1 rounded-full border border-gray-200 px-4 py-2 text-xs text-gray-800 outline-none transition focus:border-[#6367FF] focus:ring-2 focus:ring-[#6367FF]/10"
              />
              <button
                type="submit"
                disabled={loading || !recipient.trim()}
                className="inline-flex items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-[#7f64f5] to-[#ae79f8] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:opacity-95 disabled:opacity-50"
              >
                {loading && activeStep === "outbound" ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <Send size={13} />
                )}
                <span>Send Real Test Email</span>
              </button>
            </form>

            {outboundResult && (
              <div className="mt-3 rounded-xl bg-emerald-50/70 p-3 text-[11px] text-emerald-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>Delivered to {outboundResult.recipient}</span>
                  {outboundResult.latencyMs && (
                    <span className="text-gray-400 font-normal">({outboundResult.latencyMs}ms)</span>
                  )}
                </div>
                {outboundResult.providerMessageId && (
                  <p className="text-[10px] text-gray-500 font-mono truncate">
                    Provider ID: {outboundResult.providerMessageId}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Step 3: Inbound Loopback Test */}
          <div className="rounded-2xl border border-gray-100 bg-white p-4.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <Inbox size={14} />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800">3. Inbound Receiving & Reply Verification</h4>
                  <p className="text-[11px] text-gray-400">
                    Dispatches a diagnostic ping to confirm replies arrive in your inbox
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleTestInbound}
                disabled={loading}
                className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
              >
                {loading && activeStep === "inbound" ? (
                  <Loader2 size={12} className="animate-spin" />
                ) : (
                  <Clock size={12} />
                )}
                <span>Test Inbound</span>
              </button>
            </div>

            {inboundResult && (
              <div className="mt-3 rounded-xl bg-emerald-50/70 p-3 text-[11px] text-emerald-800 space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                  <span>
                    Inbound delivery verified in {inboundResult.folder}
                    {inboundResult.roundTripMs ? ` (${inboundResult.roundTripMs}ms round-trip)` : ""}
                  </span>
                </div>
                <p className="text-[10px] text-gray-500">
                  {inboundResult.details || "Your mailbox is ready to capture prospect replies."}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 flex items-center justify-between">
          <p className="text-[11px] text-gray-400">
            {account.status === "connected" ? "Status: Operational" : "Status: Reconnection Required"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-gray-200 bg-white px-5 py-2 text-xs font-semibold text-gray-600 transition hover:bg-gray-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full bg-[#6367FF] px-5 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-[#5254e8]"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
