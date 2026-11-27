"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

export default function SidebarTrialCard({ collapsed, onOpenFeatureModal }) {
  return (
    <div className="mt-auto space-y-2.5 pt-3">
      {collapsed ? (
        <Link
          href="/dashboard/settings"
          title="Free trial (4d remaining) - Click to subscribe"
          className="w-10 h-10 rounded-xl bg-[#F8F9FE] border border-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-400 hover:border-indigo-200 transition mx-auto shadow-2xs"
        >
          4d
        </Link>
      ) : (
        <div className="rounded-2xl border border-gray-100 bg-[#F8F9FE] p-4 shadow-2xs relative overflow-hidden">
          <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-indigo-100/40 pointer-events-none blur-sm" />
          <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-orange-100/30 pointer-events-none blur-sm" />

          <div className="relative flex items-start justify-between gap-2 mb-3.5">
            <div>
              <h4 className="text-sm font-bold text-gray-900 leading-tight">Free trial</h4>
              <p className="text-[11px] text-[#C29068] font-medium mt-1">
                Expires Jul 5, 2026
              </p>
            </div>

            <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="14" fill="white" stroke="#F1F1F5" strokeWidth="3" />
                <circle
                  cx="18"
                  cy="18"
                  r="14"
                  fill="transparent"
                  stroke="#F97316"
                  strokeWidth="3"
                  strokeDasharray="88"
                  strokeDashoffset="26"
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute text-[11px] font-bold text-gray-700">4d</span>
            </div>
          </div>

          <Link
            href="/dashboard/settings"
            className="w-full block text-center rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-bold py-2 text-xs shadow-sm transition active:scale-95 cursor-pointer"
          >
            Subscribe
          </Link>
        </div>
      )}

      <button
        type="button"
        onClick={onOpenFeatureModal}
        title={collapsed ? "Request New Feature" : undefined}
        className={`w-full flex items-center rounded-full text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition active:scale-95 cursor-pointer ${
          collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
        }`}
      >
        <Bell size={17} className="text-gray-400 shrink-0" />
        {!collapsed && <span>Request New Feature</span>}
      </button>
    </div>
  );
}
