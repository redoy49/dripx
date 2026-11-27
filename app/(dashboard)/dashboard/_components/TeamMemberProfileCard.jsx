"use client";

import { ArrowLeft } from "lucide-react";

export default function TeamMemberProfileCard({
  member,
  unreadMessagesCount,
  topCampaignsCount,
  pipeline = {},
  pendingInvitations,
  onBack,
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 rounded-full border border-gray-200/90 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-2xs transition hover:bg-gray-50 active:scale-95 cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Team</span>
        </button>

        <div className="flex items-center gap-2">
          <button className="rounded-full border border-gray-200/90 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-2xs hover:bg-gray-50 active:scale-95 cursor-pointer">
            View on LinkedIn
          </button>
          <button className="rounded-full bg-indigo-400 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 cursor-pointer">
            Sign in →
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 text-lg font-bold text-white shadow-sm">
          {member.avatar}
        </div>
        <div>
          <h3 className="text-xl font-black text-gray-900">{member.name}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>
              Plan: <strong className="text-gray-800">{member.plan || "Pro"}</strong>
            </span>
            <span>·</span>
            <span>
              Role: <strong className="text-gray-800">{member.role || "MEMBER"}</strong>
            </span>
            <span>·</span>
            <span className="font-bold text-emerald-500">Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Unread Messages</p>
          <p className="mt-1 text-lg font-black text-gray-900">{unreadMessagesCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Active Campaigns</p>
          <p className="mt-1 text-lg font-black text-gray-900">{topCampaignsCount}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Workspace Leads</p>
          <p className="mt-1 text-lg font-black text-gray-900">{pipeline.totalLeads || 0}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Pending Invites</p>
          <p className="mt-1 text-lg font-black text-gray-900">{pendingInvitations}</p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Reply Rate</p>
          <p className="mt-1 text-lg font-black text-emerald-500">
            {pipeline.overallReplyRate || 0}%
          </p>
        </div>
        <div className="rounded-2xl border border-gray-100 bg-[#FAFAFC] p-3 text-center">
          <p className="text-[10px] font-bold text-gray-400 uppercase">Enrolled Leads</p>
          <p className="mt-1 text-lg font-black text-gray-900">{pipeline.enrolledCount || 0}</p>
        </div>
      </div>
    </div>
  );
}
