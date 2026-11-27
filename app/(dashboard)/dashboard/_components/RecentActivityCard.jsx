"use client";

import Link from "next/link";
import { Mail } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

function formatTimeAgo(dateString) {
  if (!dateString) return "Just now";
  const now = new Date();
  const date = new Date(dateString);
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / (60 * 1000));
  if (diffMins < 1) return "Just now";
  if (diffMins === 1) return "1 minute ago";
  if (diffMins < 60) return `${diffMins} minutes ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours === 1) return "1 hour ago";
  if (diffHours < 24) return `${diffHours} hours ago`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return "1 day ago";
  return `${diffDays} days ago`;
}

export default function RecentActivityCard({ recentActivity = [] }) {
  return (
    <div className="lg:col-span-4 rounded-2xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between border-b border-gray-100 pb-3 mb-4">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Recent activity</h2>
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <div className="space-y-3.5">
          {recentActivity.length > 0 ? (
            recentActivity.slice(0, 4).map((act) => {
              const isEmail = act.actionType === "email";
              return (
                <div key={act.id} className="flex items-start gap-3 group">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-50 border border-gray-100 text-gray-500 mt-0.5 group-hover:border-indigo-400/30 transition">
                    {isEmail ? (
                      <Mail size={13} className="text-indigo-400" />
                    ) : (
                      <FaLinkedin size={13} className="text-[#0A66C2]" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-gray-700 leading-snug">
                      {act.label} →{" "}
                      <span className="font-bold text-gray-900">{act.leadName}</span>
                    </p>
                    <p className="text-[11px] text-gray-400 mt-0.5 truncate">
                      {formatTimeAgo(act.occurredAt)} • {act.campaignName}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center text-xs text-gray-400 border border-dashed border-gray-200 rounded-2xl p-4">
              No outreach activity recorded yet. Launch a campaign or enroll leads to begin tracking real touches.
            </div>
          )}
        </div>
      </div>

      <Link
        href="/dashboard/campaigns"
        className="mt-4 block w-full rounded-full border border-gray-200/90 bg-white py-2 text-center text-xs font-semibold text-gray-600 shadow-2xs transition hover:bg-gray-50 active:scale-95 cursor-pointer"
      >
        View all activity
      </Link>
    </div>
  );
}
