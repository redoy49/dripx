"use client";

import { useRef } from "react";
import { DAILY_LIMIT_MAX } from "@/app/lib/limits.constants";

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

const HEX_PATHS = [
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
];

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
          {HEX_PATHS.map((d, i) => (
            <path key={i} d={d} stroke="#fff" strokeWidth=".8" fill="none" />
          ))}
        </g>
        <rect x="62" y="60" width="36" height="36" rx="8" fill="#0077b5" />
        <text x="80" y="84" textAnchor="middle" fontWeight="700" fontSize="20" fill="white">
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
          <div className="absolute left-0 top-0 h-full bg-gray-300 rounded-full" style={{ width: pct }} />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-5 h-5 bg-white border-2 border-gray-300 rounded-full shadow-sm"
            style={{ left: `calc(${pct} - 10px)` }}
          />
        </div>
      </div>
      <span className="text-xs font-mono font-medium text-gray-400 text-right">{max}</span>
    </li>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <label className="relative inline-block w-11 h-6 cursor-pointer">
      <input type="checkbox" className="sr-only" checked={checked} onChange={onChange} />
      <div
        className={`absolute inset-0 rounded-full transition-colors ${checked ? "bg-green-500" : "bg-gray-300"}`}
      />
      <div
        className={`absolute left-1 top-1 w-4 h-4 bg-white rounded-full transition-transform ${checked ? "translate-x-5" : "translate-x-0"}`}
      />
    </label>
  );
}

export default function SettingsLimitsPanel({
  limits,
  onUpdateSlider,
  onUpdateRange,
  onToggleActivity,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_320px] gap-0 p-8">
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
              onChange={(e) => onUpdateRange(e.target.value)}
              className="appearance-none bg-white border border-gray-200/90 rounded-full px-4 py-1.5 pr-8 text-xs font-bold text-gray-800 shadow-2xs cursor-pointer focus:outline-none transition hover:bg-gray-50"
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
              onChange={(v) => onUpdateSlider(s.key, v)}
            />
          ))}
        </ul>
      </div>

      <div className="hidden lg:block w-[1px] bg-gray-100 mx-8 self-stretch" />

      <div className="flex flex-col items-center text-center gap-4 pt-4">
        <GlobeSVG />
        <h3 className="text-base font-bold">Activity control</h3>
        <p className="text-xs leading-relaxed text-gray-500">
          Advanced safety feature that ensures gradual growth and adjusts limits to prevent accounts
          from being flagged.
        </p>

        <div
          className={`flex items-center justify-between w-full p-3.5 mt-4 border rounded-full transition-all shadow-2xs ${
            limits.activityControlOn
              ? "bg-emerald-50/60 border-emerald-200"
              : "bg-gray-50 border-gray-200/90"
          }`}
        >
          <span
            className={`text-xs font-bold pl-2 ${limits.activityControlOn ? "text-emerald-600" : "text-gray-500"}`}
          >
            {limits.activityControlOn ? "Activated" : "Deactivated"}
          </span>
          <Toggle checked={limits.activityControlOn} onChange={onToggleActivity} />
        </div>
      </div>
    </div>
  );
}
