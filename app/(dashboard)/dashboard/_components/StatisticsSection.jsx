"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import RecentActivityCard from "./RecentActivityCard";

function CircularProgressGauge({ percentage = 0, fraction = "0 / 0", label, color = "#818CF8" }) {
  const size = 66;
  const strokeWidth = 4.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const clampedPct = Math.min(100, Math.max(0, percentage));
  const strokeDashoffset = circumference - (clampedPct / 100) * circumference;

  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#EFEFF4"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <span className="absolute text-[12px] font-bold text-gray-800">{clampedPct}%</span>
      </div>
      <span className="mt-1 text-[11px] font-bold text-gray-700">{fraction}</span>
      <span className="text-[10.5px] font-medium text-gray-400">{label}</span>
    </div>
  );
}

export default function StatisticsSection({
  outreach = {},
  pipeline = {},
  conversations = {},
  recentActivity = [],
  onWithdrawToast,
}) {
  const inviteCount = outreach.connectionRequests || 0;
  const inviteLimit = outreach.invitesLimit || 50;
  const invitePct = Math.min(100, Math.round((inviteCount / inviteLimit) * 100));

  const messageCount = outreach.linkedinMessages || 0;
  const messageLimit = outreach.messagesLimit || 80;
  const messagePct = Math.min(100, Math.round((messageCount / messageLimit) * 100));

  const emailCount = outreach.emailsSent || 0;
  const emailLimit = outreach.emailsLimit || 100;
  const emailPct = Math.min(100, Math.round((emailCount / emailLimit) * 100));

  const profileCount = outreach.profileViews || 0;
  const profileLimit = outreach.profileViewsLimit || 100;
  const profilePct = Math.min(100, Math.round((profileCount / profileLimit) * 100));

  const pendingInvitations = pipeline.pendingInvitesCount || pipeline.unassignedCount || 0;
  const unreadMessagesCount = conversations.unreadCount || 0;
  const growthRateText = pipeline.overallReplyRate > 0 ? `+${pipeline.overallReplyRate}%` : "+0%";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      <div className="lg:col-span-8 rounded-2xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Statistics</h2>
          <Link
            href="/dashboard/campaigns"
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-500 hover:underline"
          >
            View More
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-2">
          <CircularProgressGauge
            percentage={invitePct}
            fraction={`${inviteCount} / ${inviteLimit}`}
            label="Invites sent"
            color="#818CF8"
          />
          <CircularProgressGauge
            percentage={messagePct}
            fraction={`${messageCount} / ${messageLimit}`}
            label="Messages sent"
            color="#FB7185"
          />
          <CircularProgressGauge
            percentage={emailPct}
            fraction={`${emailCount} / ${emailLimit}`}
            label="Emails sent"
            color="#FBBF24"
          />
          <CircularProgressGauge
            percentage={profilePct}
            fraction={`${profileCount} / ${profileLimit}`}
            label="Profile viewed"
            color="#34D399"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-3 border-t border-gray-100">
          <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3.5 flex flex-col justify-between space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Pending invitations
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-gray-900">{pendingInvitations}</span>
              <button
                onClick={onWithdrawToast}
                className="rounded-full border border-gray-200/90 bg-white px-3.5 py-1 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 active:scale-95 cursor-pointer"
              >
                Withdraw
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3.5 flex flex-col justify-between space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Unread messages
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-gray-900">{unreadMessagesCount}</span>
              <Link
                href="/dashboard/inbox"
                className="rounded-full border border-gray-200/90 bg-white px-4 py-1 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 active:scale-95 cursor-pointer"
              >
                View
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3.5 flex flex-col justify-between space-y-2">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              Reply rate velocity
            </p>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-black text-gray-900">{growthRateText}</span>
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <TrendingUp size={13} />
              </span>
            </div>
          </div>
        </div>
      </div>

      <RecentActivityCard recentActivity={recentActivity} />
    </div>
  );
}
