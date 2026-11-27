"use client";

import { useMemo } from "react";
import TeamMemberProfileCard from "./TeamMemberProfileCard";

const RANGE_TABS = [
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "7d", label: "7 days" },
  { key: "30d", label: "30 days" },
  { key: "90d", label: "90 days" },
  { key: "pick", label: "Pick dates" },
];

const CHART_SERIES = [
  { key: "invitesSent", label: "Invites sent", color: "bg-indigo-400" },
  { key: "invitesAccepted", label: "Invites accepted", color: "bg-emerald-400" },
  { key: "messagesSent", label: "Messages sent", color: "bg-rose-400" },
  { key: "leadsReplied", label: "Leads replied", color: "bg-amber-400" },
  { key: "emailsSent", label: "Emails sent", color: "bg-violet-400" },
  { key: "profilesViewed", label: "Profiles viewed", color: "bg-sky-400" },
];

export default function TeamVelocitySection({
  range,
  teamMembers = [],
  selectedMember,
  onSelectMember,
  onRangeChange,
  velocityChart = [],
  unreadMessagesCount = 0,
  topCampaignsCount = 0,
  pipeline = {},
  pendingInvitations = 0,
}) {
  const chartDays = useMemo(() => {
    if (!velocityChart || velocityChart.length === 0) return [];
    return velocityChart.map((d) => ({
      label: d.label,
      invitesSent: d.invitesSent || 0,
      invitesAccepted: d.invitesAccepted || 0,
      messagesSent: d.messagesSent || 0,
      leadsReplied: d.leadsReplied || 0,
      emailsSent: d.emailsSent || 0,
      profilesViewed: d.profilesViewed || 0,
    }));
  }, [velocityChart]);

  const maxChartVal = useMemo(() => {
    if (!chartDays.length) return 20;
    return Math.max(
      ...chartDays.map((d) =>
        Math.max(
          d.invitesSent,
          d.invitesAccepted,
          d.messagesSent,
          d.leadsReplied,
          d.emailsSent,
          d.profilesViewed,
          10,
        ),
      ),
    );
  }, [chartDays]);

  return (
    <div className="rounded-2xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-5">
      {selectedMember ? (
        <TeamMemberProfileCard
          member={selectedMember}
          unreadMessagesCount={unreadMessagesCount}
          topCampaignsCount={topCampaignsCount}
          pipeline={pipeline}
          pendingInvitations={pendingInvitations}
          onBack={() => onSelectMember(null)}
        />
      ) : (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-gray-100 pb-4">
          <h2 className="text-base font-bold text-gray-900 tracking-tight">Your team</h2>

          <div className="flex flex-wrap items-center gap-1.5">
            {RANGE_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => onRangeChange(tab.key)}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                  range === tab.key
                    ? "bg-gray-900 text-white shadow-xs"
                    : "text-gray-500 border border-gray-200/90 bg-white hover:bg-gray-50 hover:text-gray-800 shadow-2xs active:scale-95"
                }`}
              >
                {tab.label}
              </button>
            ))}
            {teamMembers.length > 0 && (
              <button
                onClick={() => onSelectMember(teamMembers[0])}
                className="ml-1 rounded-full border border-gray-200/90 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-700 shadow-2xs transition hover:bg-gray-50 active:scale-95 cursor-pointer"
              >
                View profile
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-1">
        <div className="lg:col-span-3 space-y-1.5 max-h-[300px] overflow-y-auto pr-1">
          {teamMembers.length > 0 ? (
            teamMembers.map((member) => (
              <button
                key={member.id}
                onClick={() => onSelectMember(member)}
                className={`flex w-full items-center justify-between rounded-2xl p-2.5 text-left transition ${
                  selectedMember?.id === member.id
                    ? "bg-indigo-50 border border-indigo-200"
                    : "hover:bg-gray-50 border border-transparent cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 text-xs font-bold text-white">
                    {member.avatar}
                  </div>
                  <div className="min-w-0 truncate">
                    <p className="text-xs font-bold text-gray-800 truncate">{member.name}</p>
                    <p className="text-[10px] text-gray-400">LinkedIn Active</p>
                  </div>
                </div>
                <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[9px] font-bold text-gray-500">
                  {member.role}
                </span>
              </button>
            ))
          ) : (
            <div className="p-3 text-xs text-gray-400 text-center">Loading team members...</div>
          )}
        </div>

        <div className="lg:col-span-9 space-y-4">
          <div className="h-56 flex items-end justify-between gap-2 border-b border-gray-100 pb-2 px-1">
            {chartDays.length > 0 ? (
              chartDays.map((day, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                  <div className="flex items-end justify-center gap-1 w-full max-w-[55px] h-44">
                    {CHART_SERIES.map((series) => (
                      <div
                        key={series.key}
                        className={`w-1.5 sm:w-2 rounded-t-sm ${series.color} transition-all hover:brightness-110`}
                        style={{ height: `${Math.max(4, (day[series.key] / maxChartVal) * 100)}%` }}
                        title={`${series.label}: ${day[series.key]}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400 mt-2 truncate w-full text-center">
                    {day.label}
                  </span>
                </div>
              ))
            ) : (
              <div className="w-full flex items-center justify-center h-44 text-xs text-gray-400">
                No outreach activity recorded in this time range.
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] font-medium text-gray-500 pt-1">
            {CHART_SERIES.map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className={`h-2 w-2 rounded-full ${item.color}`} />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
