"use client";

import { useEffect, useRef, useState } from "react";
import { Clock, FileText, ShieldCheck, Tag, Plug } from "lucide-react";
import { DAILY_LIMIT_MAX } from "@/app/lib/limits.constants";
import IntegrationsTab from "@/app/(dashboard)/dashboard/settings/IntegrationsTab";

const TABS = [
  "Limits & Activity control",
  "Working hours",
  "Sequence templates",
  "Data scrubber",
  "Lead tagging",
  "Integrations",
];

const SLIDER_META = [
  { key: "connectionRequests", label: "Connection requests" },
  { key: "messages", label: "Messages" },
  { key: "inmails", label: "InMails" },
  { key: "profileViews", label: "Profile views" },
  { key: "endorsements", label: "Endorsements" },
  { key: "likes", label: "Likes" },
  { key: "followings", label: "Followings" },
  { key: "emails", label: "Emails" },
];

function BellIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      className="text-gray-500"
    >
      <path
        d="M13.6 20H10.4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17 10V10C17 7.239 14.761 5 12 5 9.239 5 7 7.239 7 10V12.504C7 12.828 6.817 13.123 6.528 13.268L6.025 13.519C5.397 13.834 5 14.476 5 15.178 5 16.202 5.83 17.032 6.854 17.032H17.146C18.17 17.032 19 16.202 19 15.178 19 14.476 18.603 13.834 17.975 13.52L17.472 13.269C17.183 13.123 17 12.828 17 12.504V10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function GlobeSVG() {
  return (
    <div className="relative w-[140px] h-[140px]">
      <svg viewBox="0 0 160 160" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="globeGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#4f46e5" />
          </radialGradient>
          <clipPath id="circleClip">
            <circle cx="80" cy="78" r="58" />
          </clipPath>
        </defs>
        <circle cx="80" cy="78" r="58" fill="url(#globeGrad)" opacity=".9" />
        <g clipPath="url(#circleClip)" opacity=".35">
          {[
            "M20 38 L32 31 L44 38 L44 52 L32 59 L20 52 Z",
            "M44 38 L56 31 L68 38 L68 52 L56 59 L44 52 Z",
            "M68 38 L80 31 L92 38 L92 52 L80 59 L68 52 Z",
            "M92 38 L104 31 L116 38 L116 52 L104 59 L92 52 Z",
            "M116 38 L128 31 L140 38 L140 52 L128 59 L116 52 Z",
            "M32 59 L44 52 L56 59 L56 73 L44 80 L32 73 Z",
            "M56 59 L68 52 L80 59 L80 73 L68 80 L56 73 Z",
            "M80 59 L92 52 L104 59 L104 73 L92 80 L80 73 Z",
            "M104 59 L116 52 L128 59 L128 73 L116 80 L104 73 Z",
            "M20 80 L32 73 L44 80 L44 94 L32 101 L20 94 Z",
            "M44 80 L56 73 L68 80 L68 94 L56 101 L44 94 Z",
            "M68 80 L80 73 L92 80 L92 94 L80 101 L68 94 Z",
            "M92 80 L104 73 L116 80 L116 94 L104 101 L92 94 Z",
            "M116 80 L128 73 L140 80 L140 94 L128 101 L116 94 Z",
            "M32 101 L44 94 L56 101 L56 115 L44 122 L32 115 Z",
            "M56 101 L68 94 L80 101 L80 115 L68 122 L56 115 Z",
            "M80 101 L92 94 L104 101 L104 115 L92 122 L80 115 Z",
            "M104 101 L116 94 L128 101 L128 115 L116 122 L104 115 Z",
          ].map((d, i) => (
            <path key={i} d={d} stroke="#fff" strokeWidth=".8" fill="none" />
          ))}
        </g>
        <rect x="62" y="60" width="36" height="36" rx="8" fill="#0077b5" />
        <text
          x="80"
          y="84"
          textAnchor="middle"
          fontWeight="700"
          fontSize="20"
          fill="white"
        >
          in
        </text>
      </svg>
    </div>
  );
}

function SliderRow({ label, value, max, onChange }) {
  const trackRef = useRef(null);
  const pct = `${(value / max) * 100}%`;

  const valueFromClientX = (clientX) => {
    const track = trackRef.current;
    if (!track) return value;
    const rect = track.getBoundingClientRect();
    const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
    return Math.round(ratio * max);
  };

  const startDrag = (e) => {
    e.preventDefault();
    onChange(valueFromClientX(e.clientX));

    const handleMove = (moveEvent) => onChange(valueFromClientX(moveEvent.clientX));
    const handleUp = () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
  };

  return (
    <li className="grid grid-cols-[150px_1fr_48px] items-center gap-4 py-4 border-b border-gray-100 last:border-0">
      <span className="text-[15px] font-medium text-gray-800">{label}</span>
      <div
        ref={trackRef}
        onPointerDown={startDrag}
        className="relative py-4 flex-1 cursor-pointer touch-none"
      >
        <span
          className="absolute -top-5 bg-white border border-gray-200 rounded-sm px-2.5 py-0.5 text-[12px] font-mono font-semibold text-gray-600 shadow-sm z-10 pointer-events-none"
          style={{ left: `calc(${pct} - 12px)` }}
        >
          {value}
        </span>
        <div className="relative w-full h-1 bg-gray-200 rounded-full">
          <div
            className="absolute left-0 top-0 h-full bg-gray-300 rounded-full"
            style={{ width: pct }}
          />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-300 rounded-full shadow-sm"
            style={{ left: `calc(${pct} - 10px)` }}
          />
        </div>
      </div>
      <span className="text-xs font-mono font-medium text-gray-400 text-right">
        {max}
      </span>
    </li>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-block w-11 h-6 cursor-pointer">
      <input
        type="checkbox"
        className="sr-only"
        checked={checked}
        onChange={onChange}
      />
      <div
        className={`absolute inset-0 rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-300"}`}
      />
      <div
        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </label>
  );
}

function ComingSoonPanel({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
        <Icon className="h-7 w-7 text-gray-400" strokeWidth={1.7} />
      </div>
      <h3 className="text-base font-semibold text-gray-700">{title}</h3>
      <p className="max-w-sm text-sm text-gray-400">{description}</p>
    </div>
  );
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const saveTimeout = useRef(null);

  useEffect(() => {
    fetch("/api/settings/limits")
      .then((res) => res.json())
      .then((data) => {
        setLimits(data);
        setLoading(false);
      });
  }, []);

  const persist = (patch) => {
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      fetch("/api/settings/limits", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      }).catch(() => {});
    }, 400);
  };

  const updateSlider = (key, value) => {
    setLimits((prev) => ({ ...prev, [key]: value }));
    persist({ [key]: value });
  };

  const updateActivityOn = () => {
    setLimits((prev) => {
      const next = { ...prev, activityControlOn: !prev.activityControlOn };
      persist({ activityControlOn: next.activityControlOn });
      return next;
    });
  };

  const updateRange = (value) => {
    setLimits((prev) => ({ ...prev, range: value }));
    persist({ range: value });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans">
      {/* Top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-8 bg-white border-b border-gray-100 rounded-xl">
        <h1
          className="text-2xl font-semibold"
          style={{
            background: "linear-gradient(90deg, #ee7aee 0%, #fe9b85 100%)",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Settings
        </h1>
        <button className="p-2 transition-colors rounded-full hover:ring bg-gray-100 hover:ring-gray-200 ">
          <BellIcon />
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full py-8 mx-auto">
        <div className="overflow-hidden bg-white rounded-xl border border-gray-100">
          {/* Tabs */}
          <nav className="flex px-6 border-b border-gray-100 overflow-x-auto no-scrollbar">
            {TABS.map((tab, i) => (
              <button
                key={tab}
                onClick={() => setActiveTab(i)}
                className={`whitespace-nowrap px-4 py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === i
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-800"
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          {activeTab === 0 &&
            (loading || !limits ? (
              <div className="py-20 text-center text-sm text-gray-400">Loading limits...</div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_320px] gap-0 p-8">
                {/* Left: Sliders */}
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider">
                      Maximum actions per day:
                    </h2>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span className="flex items-center gap-1 font-medium">
                        Range
                        <span
                          className="flex items-center justify-center w-4 h-4 text-[10px] border border-gray-400 rounded-full cursor-help"
                          title="How many actions vary day to day around your target, so activity looks natural"
                        >
                          i
                        </span>
                      </span>
                      <select
                        value={limits.range}
                        onChange={(e) => updateRange(e.target.value)}
                        className="appearance-none bg-gray-100 border border-gray-200 rounded-lg px-4 py-1.5 pr-8 font-bold text-gray-800 cursor-pointer focus:outline-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none'%3E%3Cpath d='M8 10L12 14L16 10' stroke='%236b7280' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`,
                          backgroundRepeat: "no-repeat",
                          backgroundPosition: "right 8px center",
                        }}
                      >
                        {["1", "3", "5", "7", "10"].map((v) => (
                          <option key={v} value={v}>
                            {v}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <ul className="space-y-1">
                    {SLIDER_META.map((s) => (
                      <SliderRow
                        key={s.key}
                        label={s.label}
                        value={limits[s.key] ?? 0}
                        max={DAILY_LIMIT_MAX[s.key]}
                        onChange={(v) => updateSlider(s.key, v)}
                      />
                    ))}
                  </ul>
                </div>

                {/* Vertical Divider */}
                <div className="hidden lg:block w-[1px] bg-gray-100 mx-8 self-stretch" />

                {/* Right: Activity Control */}
                <div className="flex flex-col items-center text-center gap-4 pt-4">
                  <GlobeSVG />
                  <h3 className="text-base font-bold">Activity control</h3>
                  <p className="text-xs leading-relaxed text-gray-500">
                    Advanced safety feature that ensures gradual growth and adjusts
                    limits to prevent accounts from being flagged.
                  </p>

                  <div
                    className={`flex items-center justify-between w-full p-3 mt-4 border rounded-xl transition-all ${
                      limits.activityControlOn
                        ? "bg-green-50 border-green-200"
                        : "bg-gray-50 border-gray-200"
                    }`}
                  >
                    <span
                      className={`text-sm font-bold ${limits.activityControlOn ? "text-green-600" : "text-gray-500"}`}
                    >
                      {limits.activityControlOn ? "Activated" : "Deactivated"}
                    </span>
                    <Toggle checked={limits.activityControlOn} onChange={updateActivityOn} />
                  </div>
                </div>
              </div>
            ))}

          {activeTab === 1 && (
            <ComingSoonPanel
              icon={Clock}
              title="Working hours"
              description="Scheduling campaigns to only run during your leads' local working hours is on the roadmap."
            />
          )}
          {activeTab === 2 && (
            <ComingSoonPanel
              icon={FileText}
              title="Sequence templates"
              description="Save and reuse sequence templates across campaigns — coming soon."
            />
          )}
          {activeTab === 3 && (
            <ComingSoonPanel
              icon={ShieldCheck}
              title="Data scrubber"
              description="Automatic PII cleanup rules for imported lead data are on the roadmap."
            />
          )}
          {activeTab === 4 && (
            <ComingSoonPanel
              icon={Tag}
              title="Lead tagging"
              description="Manage workspace-wide tag presets here — for now, tag leads directly from the Leads page."
            />
          )}
          {activeTab === 5 && <IntegrationsTab />}
        </div>
      </main>

      {/* Floating Chat */}
      <button className="fixed bottom-6 right-6 w-14 h-14 flex items-center justify-center bg-indigo-400 text-white rounded-full shadow-md shadow-indigo-200 hover:scale-105 transition-transform active:scale-95">
        <ChatIcon />
      </button>
    </div>
  );
}
