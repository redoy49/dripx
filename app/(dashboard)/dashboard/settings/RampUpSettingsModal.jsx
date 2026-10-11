"use client";

import { useState } from "react";
import {
  X,
  TrendingUp,
  Loader2,
  Calendar,
  Zap,
  CheckCircle2,
} from "lucide-react";
import { generateRampUpProjection } from "@/app/lib/rampUpEngine";

export default function RampUpSettingsModal({ isOpen, onClose, account, onUpdated }) {
  const rampUp = account?.rampUp || {};
  const [enabled, setEnabled] = useState(rampUp.enabled !== false);
  const [startingLimit, setStartingLimit] = useState(rampUp.startingLimit ?? 10);
  const [dailyIncrement, setDailyIncrement] = useState(rampUp.dailyIncrement ?? 3);
  const [targetLimit, setTargetLimit] = useState(rampUp.targetLimit ?? account?.dailyLimit ?? 40);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !account) return null;

  const projection = generateRampUpProjection(startingLimit, dailyIncrement, targetLimit, 14);
  const daysToGraduation = Math.max(1, Math.ceil((targetLimit - startingLimit) / dailyIncrement)) + 1;

  const handleSave = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/email-accounts/${account.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dailyLimit: targetLimit,
          rampUp: {
            enabled,
            startingLimit: Number(startingLimit),
            dailyIncrement: Number(dailyIncrement),
            targetLimit: Number(targetLimit),
          },
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to update ramp-up settings");
      }

      onUpdated?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4 backdrop-blur-xs">
      <div className="relative w-full max-w-lg rounded-3xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 p-6 bg-linear-to-r from-violet-50/50 to-white">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#6367FF]/10 text-[#6367FF]">
              <TrendingUp size={22} />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">Sending Ramp-Up & Warmup</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Automated daily volume scaling for <span className="font-semibold text-gray-600">{account.email}</span>
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

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-3.5 text-xs text-rose-700">
              {error}
            </div>
          )}

          {/* Toggle Enabled */}
          <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-100 bg-gray-50/70">
            <div>
              <p className="text-xs font-bold text-gray-800">Automated Ramp-Up Schedule</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Gradually increases outreach volume daily to protect your domain reputation.
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#6367FF]" />
            </label>
          </div>

          {enabled && (
            <>
              {/* Sliders & Configuration */}
              <div className="space-y-4">
                {/* Starting Limit */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                    <span>Starting Volume (Day 1)</span>
                    <span className="font-bold text-[#6367FF]">{startingLimit} emails/day</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="30"
                    step="1"
                    value={startingLimit}
                    onChange={(e) => setStartingLimit(Number(e.target.value))}
                    className="w-full accent-[#6367FF] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>5 (Conservative)</span>
                    <span>30 (Warm domain)</span>
                  </div>
                </div>

                {/* Daily Increment */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                    <span>Daily Ramp-Up Step</span>
                    <span className="font-bold text-[#6367FF]">+{dailyIncrement} emails/day</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="1"
                    value={dailyIncrement}
                    onChange={(e) => setDailyIncrement(Number(e.target.value))}
                    className="w-full accent-[#6367FF] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>+1 (Gentle)</span>
                    <span>+10 (Aggressive)</span>
                  </div>
                </div>

                {/* Target Limit */}
                <div>
                  <div className="flex justify-between text-xs font-semibold text-gray-700 mb-1.5">
                    <span>Target Maximum Ceiling</span>
                    <span className="font-bold text-[#6367FF]">{targetLimit} emails/day</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="100"
                    step="5"
                    value={targetLimit}
                    onChange={(e) => setTargetLimit(Number(e.target.value))}
                    className="w-full accent-[#6367FF] cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400">
                    <span>20/day</span>
                    <span>100/day</span>
                  </div>
                </div>
              </div>

              {/* Trajectory Projection Card */}
              <div className="rounded-2xl border border-violet-100 bg-violet-50/50 p-4 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-violet-900">
                    <Calendar size={14} className="text-[#6367FF]" />
                    <span>Projected Timeline</span>
                  </div>
                  <span className="font-semibold text-violet-700 text-[11px]">
                    Full capacity in ~{daysToGraduation} days
                  </span>
                </div>

                {/* Micro preview grid */}
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {projection.slice(0, 7).map((p) => (
                    <div
                      key={p.day}
                      className="rounded-xl bg-white border border-violet-100/70 p-2 text-center shadow-2xs"
                    >
                      <span className="block text-[10px] font-bold text-gray-400">D{p.day}</span>
                      <span className="block text-xs font-black text-gray-800 mt-0.5">{p.limit}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1.5 text-center">
                  {projection.slice(7, 14).map((p) => (
                    <div
                      key={p.day}
                      className={`rounded-xl p-2 text-center border shadow-2xs ${
                        p.isGraduated
                          ? "bg-emerald-50 border-emerald-200 text-emerald-800 font-bold"
                          : "bg-white border-violet-100/70"
                      }`}
                    >
                      <span className="block text-[10px] font-bold text-gray-400">D{p.day}</span>
                      <span className="block text-xs font-black text-gray-800 mt-0.5">{p.limit}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 bg-gray-50/50 p-4 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={submitting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#6367FF] hover:bg-[#5254e8] px-5 py-2 text-xs font-bold text-white transition shadow-sm disabled:opacity-50"
          >
            {submitting && <Loader2 size={13} className="animate-spin" />}
            <span>Save Configuration</span>
          </button>
        </div>
      </div>
    </div>
  );
}
