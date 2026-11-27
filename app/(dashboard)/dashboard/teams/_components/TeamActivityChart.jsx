"use client";

import { ChevronDown, Download } from "lucide-react";

const COLORS = [
  "bg-indigo-400",
  "bg-violet-400",
  "bg-sky-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-rose-400",
  "bg-slate-400",
];

const RANGE_TABS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7", label: "7 days" },
  { key: "30", label: "30 days" },
  { key: "90", label: "90 days" },
  { key: "pick", label: "Pick dates" },
];

export default function TeamActivityChart({
  activeRange,
  activityData = [],
  onRangeChange,
  onExportCsv,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden">
      <div className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">
            Outreach Activity
          </h2>

          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="inline-flex p-1 rounded-full border border-gray-200/90 bg-white shadow-2xs gap-1">
              {RANGE_TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => onRangeChange(t.key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition cursor-pointer ${
                    activeRange === t.key
                      ? "bg-indigo-400 text-white shadow-xs font-bold"
                      : "text-gray-500 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <button className="rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 shadow-2xs active:scale-95 transition flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 cursor-pointer">
              <span>All campaigns</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={onExportCsv}
              className="rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 shadow-2xs active:scale-95 transition flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-gray-700 cursor-pointer"
            >
              <span>Export CSV</span>
              <Download className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="relative overflow-x-auto">
          <div className="absolute inset-0 flex flex-col justify-between pb-6 pointer-events-none">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="border-t border-gray-100" />
            ))}
          </div>

          <div className="absolute left-0 top-0 h-full flex flex-col justify-between pb-6 text-xs text-gray-400">
            {[150, 125, 100, 75, 50, 25, 0].map((n) => (
              <span key={n}>{n}</span>
            ))}
          </div>

          <div className="ml-10 min-w-[950px] h-[360px] flex items-end justify-between relative">
            {activityData.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-3">
                <div className="h-[300px] flex items-end gap-1.5">
                  {item.heights.map((h, i) => (
                    <div
                      key={i}
                      className={`w-[10px] rounded-full ${COLORS[i]}`}
                      style={{ height: `${Math.min(280, h * 2)}px` }}
                    />
                  ))}
                </div>
                <span className="text-xs text-gray-400 font-medium">{item.dateLabel}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
