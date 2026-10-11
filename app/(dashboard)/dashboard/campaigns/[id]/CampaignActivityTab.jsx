"use client";

import {
  Mail,
  MessageSquare,
  PauseCircle,
  Eye,
  ThumbsUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";


function formatRelativeTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffMinutes = Math.round((now - date) / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function getActivityBadge(type) {
  switch (type) {
    case "email":
      return {
        icon: Mail,
        label: "Email dispatched",
        color: "text-blue-600 bg-blue-50 border-blue-100",
      };
    case "connection_request":
      return {
        icon: FaLinkedin,
        label: "Connection request sent",
        color: "text-[#0A66C2] bg-blue-50 border-blue-100",
      };
    case "message":
    case "follow_up":
      return {
        icon: MessageSquare,
        label: "Direct message sent",
        color: "text-violet-600 bg-violet-50 border-violet-100",
      };
    case "inmail":
      return {
        icon: Mail,
        label: "InMail sent",
        color: "text-[#0A66C2] bg-blue-50 border-blue-100",
      };
    case "profile_visit":
      return {
        icon: Eye,
        label: "Profile visited",
        color: "text-amber-600 bg-amber-50 border-amber-100",
      };
    case "like_post":
      return {
        icon: ThumbsUp,
        label: "Post liked",
        color: "text-pink-600 bg-pink-50 border-pink-100",
      };
    case "sequence_paused_reply":
      return {
        icon: PauseCircle,
        label: "Auto-paused (Lead Replied)",
        color: "text-emerald-600 bg-emerald-50 border-emerald-100",
      };
    default:
      return {
        icon: Clock,
        label: type,
        color: "text-gray-600 bg-gray-50 border-gray-100",
      };
  }
}

export default function CampaignActivityTab({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-2xs text-center text-xs text-gray-400 space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center mx-auto text-gray-300">
          <Clock className="w-5 h-5" />
        </div>
        <p className="font-semibold text-gray-700 text-sm">No activity recorded yet</p>
        <p className="max-w-xs mx-auto">
          As soon as outreach jobs execute or prospect responses arrive, live audit events will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <h3 className="text-sm font-bold text-gray-900">Campaign Activity Audit</h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time chronological events from the sequence execution engine.
          </p>
        </div>
        <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100 flex items-center gap-1.5">
          <Sparkles className="w-3 h-3 text-violet-500" />
          Live Audit Log
        </span>
      </div>

      <div className="space-y-4">
        {activities.map((item, idx) => {
          const badge = getActivityBadge(item.actionType);
          const Icon = badge.icon;

          return (
            <div
              key={item.id ? `${item.id}-${idx}` : idx}
              className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50/60 transition-colors"
            >
              <div
                className={`p-2 rounded-xl border shrink-0 ${badge.color}`}
                title={badge.label}
              >
                <Icon className="w-4 h-4" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-800">
                    {badge.label}
                  </p>
                  <span className="text-[11px] text-gray-400 shrink-0">
                    {formatRelativeTime(item.occurredAt)}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                  {item.lead ? (
                    <>
                      <span className="font-medium text-gray-700">{item.lead.name}</span>
                      {item.lead.company && (
                        <>
                          <span>·</span>
                          <span className="truncate">{item.lead.company}</span>
                        </>
                      )}
                    </>
                  ) : (
                    <span className="italic text-gray-400">Prospect outreach event</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
