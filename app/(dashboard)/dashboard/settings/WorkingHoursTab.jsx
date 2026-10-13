"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Clock,
  Globe2,
  Calendar,
  Sparkles,
  Save,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sun,
  Moon,
  Info,
} from "lucide-react";
import {
  DEFAULT_SENDING_SCHEDULE,
  WEEKDAYS,
  POPULAR_TIMEZONES,
  getZonedParts,
  parseTimeToMinutes,
} from "@/app/lib/scheduleEngine";

export default function WorkingHoursTab() {
  const [schedule, setSchedule] = useState({ ...DEFAULT_SENDING_SCHEDULE });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const [nowUtc, setNowUtc] = useState(() => new Date());

  // Clock ticker to update zoned time display
  useEffect(() => {
    const timer = setInterval(() => setNowUtc(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch current workspace schedule
  useEffect(() => {
    fetch("/api/settings/schedules")
      .then((res) => res.json())
      .then((data) => {
        if (data && !data.message) {
          setSchedule({
            timezone: data.timezone || DEFAULT_SENDING_SCHEDULE.timezone,
            days: Array.isArray(data.days) ? data.days : DEFAULT_SENDING_SCHEDULE.days,
            startTime: data.startTime || DEFAULT_SENDING_SCHEDULE.startTime,
            endTime: data.endTime || DEFAULT_SENDING_SCHEDULE.endTime,
            leadTimezoneOptimization: Boolean(data.leadTimezoneOptimization),
          });
        }
      })
      .catch((err) => {
        console.error("Failed to load schedule:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  // Compute live local time in currently selected timezone
  const localTimeDisplay = useMemo(() => {
    try {
      const parts = getZonedParts(nowUtc, schedule.timezone);
      const hour12 = parts.hour % 12 || 12;
      const ampm = parts.hour >= 12 ? "PM" : "AM";
      const minPadded = String(parts.minute).padStart(2, "0");
      return `${parts.weekday}, ${hour12}:${minPadded} ${ampm} (${parts.timezone || schedule.timezone})`;
    } catch {
      return schedule.timezone;
    }
  }, [nowUtc, schedule.timezone]);

  // Determine current window status right now
  const isWindowActiveNow = useMemo(() => {
    try {
      const parts = getZonedParts(nowUtc, schedule.timezone);
      if (!schedule.days.includes(parts.weekdayIndex)) return false;
      const curMin = parts.hour * 60 + parts.minute;
      const startMin = parseTimeToMinutes(schedule.startTime);
      const endMin = parseTimeToMinutes(schedule.endTime);
      return curMin >= startMin && curMin < endMin;
    } catch {
      return false;
    }
  }, [nowUtc, schedule]);

  const toggleDay = (dayNum) => {
    setSchedule((prev) => {
      const current = new Set(prev.days);
      if (current.has(dayNum)) {
        if (current.size === 1) return prev; // Keep at least one active day
        current.delete(dayNum);
      } else {
        current.add(dayNum);
      }
      return { ...prev, days: Array.from(current).sort((a, b) => a - b) };
    });
  };

  const applyPreset = (preset) => {
    if (preset === "weekdays") {
      setSchedule((prev) => ({ ...prev, days: [1, 2, 3, 4, 5] }));
    } else if (preset === "all") {
      setSchedule((prev) => ({ ...prev, days: [1, 2, 3, 4, 5, 6, 7] }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setToast(null);

    const startMin = parseTimeToMinutes(schedule.startTime);
    const endMin = parseTimeToMinutes(schedule.endTime);

    if (startMin >= endMin) {
      setToast({
        type: "error",
        text: "Start time must be strictly before end time.",
      });
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/settings/schedules", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(schedule),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Failed to update sending schedule");
      }

      setSchedule({
        timezone: data.timezone,
        days: data.days,
        startTime: data.startTime,
        endTime: data.endTime,
        leadTimezoneOptimization: data.leadTimezoneOptimization,
      });

      setToast({
        type: "success",
        text: "Sending schedule updated successfully. All pending and future jobs will follow these hours.",
      });
      setTimeout(() => setToast(null), 4000);
    } catch (err) {
      setToast({
        type: "error",
        text: err.message,
      });
    } finally {
      setSaving(false);
    }
  };

  const startHourNum = Math.floor(parseTimeToMinutes(schedule.startTime) / 60);
  const endHourNum = Math.floor(parseTimeToMinutes(schedule.endTime) / 60);

  if (loading) {
    return (
      <div className="flex h-64 flex-col items-center justify-center gap-3">
        <Loader2 className="h-6 w-6 animate-spin text-[#6367FF]" />
        <span className="text-xs font-medium text-gray-400">Loading sending schedule...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Working Hours & Sending Schedule</h2>
          <p className="mt-1 text-xs text-gray-500">
            Define authorized business days and hours for outbound outreach to maintain deliverability and natural engagement.
          </p>
        </div>

        {/* Live Window Pulse */}
        <div
          className={`flex items-center gap-2.5 rounded-2xl border px-4 py-2 text-xs font-semibold shadow-sm ${
            isWindowActiveNow
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isWindowActiveNow ? "animate-pulse bg-emerald-500" : "bg-amber-400"
            }`}
          />
          <span>{isWindowActiveNow ? "Sending Window Open" : "Outside Sending Hours (Quiet Period)"}</span>
        </div>
      </div>

      {toast && (
        <div
          className={`flex items-center gap-2 rounded-2xl border p-4 text-xs font-medium ${
            toast.type === "success"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : "border-rose-200 bg-rose-50 text-rose-800"
          }`}
        >
          {toast.type === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toast.text}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column: Timezone & Active Days */}
        <div className="space-y-6 lg:col-span-2">
          {/* Card 1: Timezone Selection */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#6367FF]/10 text-[#6367FF]">
                  <Globe2 size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Workspace Base Timezone</h3>
                  <p className="text-[11px] text-gray-400">Times will be evaluated relative to this zone.</p>
                </div>
              </div>

              <div className="hidden sm:block text-right">
                <span className="block text-[11px] font-semibold text-gray-400">Current Local Time</span>
                <span className="text-xs font-bold text-[#6367FF]">{localTimeDisplay}</span>
              </div>
            </div>

            <select
              value={schedule.timezone}
              onChange={(e) => setSchedule((prev) => ({ ...prev, timezone: e.target.value }))}
              className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-xs font-semibold text-gray-800 outline-none transition focus:border-[#6367FF] focus:bg-white focus:ring-2 focus:ring-[#6367FF]/10"
            >
              {POPULAR_TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label} ({tz.offset})
                </option>
              ))}
            </select>
          </div>

          {/* Card 2: Active Sending Days */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                  <Calendar size={18} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Active Outreach Days</h3>
                  <p className="text-[11px] text-gray-400">Outreach jobs will strictly pause on unchecked days.</p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => applyPreset("weekdays")}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  Mon–Fri Only
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset("all")}
                  className="rounded-xl border border-gray-200 bg-gray-50 px-2.5 py-1 text-[11px] font-semibold text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  All 7 Days
                </button>
              </div>
            </div>

            {/* Days Toggle Buttons */}
            <div className="grid grid-cols-7 gap-2">
              {WEEKDAYS.map((wd) => {
                const isActive = schedule.days.includes(wd.day);
                return (
                  <button
                    key={wd.day}
                    type="button"
                    onClick={() => toggleDay(wd.day)}
                    className={`flex flex-col items-center justify-center rounded-2xl py-3.5 transition-all ${
                      isActive
                        ? "bg-[#6367FF] text-white shadow-md shadow-[#6367FF]/20 font-bold scale-[1.02]"
                        : "border border-gray-200 bg-gray-50/60 text-gray-400 hover:border-gray-300 hover:text-gray-700"
                    }`}
                  >
                    <span className="text-xs">{wd.short}</span>
                    <span className="mt-0.5 text-[9px] font-normal uppercase opacity-75">
                      {isActive ? "On" : "Off"}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Card 3: Daily Sending Window */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock size={18} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-900">Daily Sending Hours</h3>
                <p className="text-[11px] text-gray-400">Outreach is dispatched between these hours.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">Start Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={schedule.startTime}
                    onChange={(e) => setSchedule((prev) => ({ ...prev, startTime: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none transition focus:border-[#6367FF] focus:bg-white"
                  />
                  <Sun size={15} className="absolute right-4 top-3.5 text-amber-500" />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-gray-700">End Time</label>
                <div className="relative">
                  <input
                    type="time"
                    value={schedule.endTime}
                    onChange={(e) => setSchedule((prev) => ({ ...prev, endTime: e.target.value }))}
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50/50 px-4 py-2.5 text-sm font-semibold text-gray-800 outline-none transition focus:border-[#6367FF] focus:bg-white"
                  />
                  <Moon size={15} className="absolute right-4 top-3.5 text-indigo-400" />
                </div>
              </div>
            </div>

            {/* 24-Hour Visual Schedule Timeline */}
            <div className="mt-6 border-t border-gray-100 pt-5">
              <div className="mb-2 flex items-center justify-between text-[11px]">
                <span className="font-semibold text-gray-600">24-Hour Window Visualization:</span>
                <span className="text-gray-400">
                  {schedule.startTime} — {schedule.endTime}
                </span>
              </div>

              <div className="grid grid-cols-24 gap-0.5 overflow-hidden rounded-xl bg-gray-100 p-1">
                {Array.from({ length: 24 }).map((_, hour) => {
                  const isActive = hour >= startHourNum && hour < endHourNum;
                  return (
                    <div
                      key={hour}
                      title={`${hour}:00 - ${hour + 1}:00: ${isActive ? "Active Sending" : "Quiet Hour"}`}
                      className={`h-7 rounded-sm transition-all ${
                        isActive
                          ? "bg-[#6367FF] shadow-sm shadow-[#6367FF]/30"
                          : "bg-white hover:bg-gray-200"
                      }`}
                    />
                  );
                })}
              </div>

              <div className="mt-2 flex items-center justify-between text-[10px] text-gray-400">
                <span>12 AM</span>
                <span>6 AM</span>
                <span>12 PM</span>
                <span>6 PM</span>
                <span>11 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Smart Optimization & Save */}
        <div className="space-y-6">
          {/* Card 4: Smart Lead Timezone Auto-Detect */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-[#6367FF]">
                <Sparkles size={18} />
              </div>
              <h3 className="text-sm font-semibold text-gray-900">Smart Send Optimization</h3>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              Automatically detect prospect timezones based on their profile location, country, or IP to schedule emails during their local business hours.
            </p>

            <div
              onClick={() =>
                setSchedule((prev) => ({
                  ...prev,
                  leadTimezoneOptimization: !prev.leadTimezoneOptimization,
                }))
              }
              className={`mt-5 flex cursor-pointer items-center justify-between rounded-2xl border p-4 transition-all ${
                schedule.leadTimezoneOptimization
                  ? "border-[#6367FF]/40 bg-[#6367FF]/[0.04]"
                  : "border-gray-200 bg-gray-50/60"
              }`}
            >
              <div>
                <span className="text-xs font-bold text-gray-800">Optimize by Lead Location</span>
                <span className="block text-[11px] text-gray-400">
                  {schedule.leadTimezoneOptimization ? "Enabled (Smart Send)" : "Disabled (Workspace Zone Only)"}
                </span>
              </div>

              <div
                className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ease-in-out ${
                  schedule.leadTimezoneOptimization ? "bg-[#6367FF]" : "bg-gray-300"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition ease-in-out ${
                    schedule.leadTimezoneOptimization ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </div>
            </div>
          </div>

          {/* Card 5: Safe Rollover Notice */}
          <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
              <Info size={16} className="text-[#6367FF]" />
              <span>How Rollover Works</span>
            </div>
            <ul className="mt-3 space-y-2 text-xs text-gray-500">
              <li className="flex items-start gap-1.5">
                <span className="text-[#6367FF]">•</span>
                <span>Jobs triggered after hours are automatically postponed to the next opening hour.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#6367FF]">•</span>
                <span>Friday follow-ups roll seamlessly past the weekend to Monday morning.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="text-[#6367FF]">•</span>
                <span>Postponed jobs preserve their position and never consume daily quota until dispatched.</span>
              </li>
            </ul>
          </div>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#6367FF] py-3.5 text-xs font-bold text-white shadow-lg shadow-[#6367FF]/25 transition hover:bg-[#5254e8] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Saving Schedule...</span>
              </>
            ) : (
              <>
                <Save size={16} />
                <span>Save Working Hours</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
