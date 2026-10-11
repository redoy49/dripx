"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
  Linkedin,
  Copy,
  Check,
  Building,
  Briefcase,
  Play,
  Pause,
  Clock,
  Sparkles,
  Tag,
  ExternalLink,
} from "lucide-react";

export default function LeadDetailPanel({
  conversation,
  lead,
  campaign,
  loading = false,
  onSequenceAction,
}) {
  const [copiedField, setCopiedField] = useState(null);
  const [actionPending, setActionPending] = useState(false);

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleSequenceToggle = async (action) => {
    if (!conversation?.id || actionPending) return;
    setActionPending(true);
    try {
      await onSequenceAction?.(action);
    } finally {
      setActionPending(false);
    }
  };

  // If no conversation is selected
  if (!conversation && !loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-300 mb-3 shadow-2xs">
          <Sparkles className="w-6 h-6 text-violet-400" />
        </div>
        <h3 className="text-sm font-semibold text-gray-700">Lead Intelligence</h3>
        <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
          Select any conversation from the list to view contact details, outreach stage, and sequence controls.
        </p>
      </div>
    );
  }

  // Skeleton loading state
  if (loading) {
    return (
      <div className="h-full p-5 space-y-5 animate-pulse">
        <div className="flex flex-col items-center text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-gray-100" />
          <div className="h-4 w-28 bg-gray-100 rounded-md" />
          <div className="h-3 w-36 bg-gray-100 rounded-md" />
        </div>
        <div className="space-y-3 pt-3">
          <div className="h-14 bg-gray-50 rounded-xl" />
          <div className="h-14 bg-gray-50 rounded-xl" />
          <div className="h-24 bg-gray-50 rounded-xl" />
        </div>
      </div>
    );
  }

  const fullName = lead
    ? `${lead.firstName || ""} ${lead.lastName || ""}`.trim() || "Unknown Contact"
    : "Unknown Contact";

  const initials = fullName
    .split(" ")
    .map((n) => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "?";

  const enrollmentStatus = campaign?.enrollmentStatus || "unknown";
  const isPaused = enrollmentStatus === "paused";
  const isReplied = enrollmentStatus === "replied";
  const isInSequence = enrollmentStatus === "in_progress";

  return (
    <div className="h-full flex flex-col overflow-y-auto">
      {/* Header Profile */}
      <div className="p-5 border-b border-gray-100 flex flex-col items-center text-center">
        <div className="relative mb-3">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center text-white text-lg font-bold shadow-xs">
            {initials}
          </div>
          {conversation?.channel && (
            <span
              className={`absolute -bottom-1 -right-1 p-1 rounded-md text-[10px] text-white shadow-xs ${
                conversation.channel === "email" ? "bg-blue-500" : "bg-[#0A66C2]"
              }`}
              title={`Active channel: ${conversation.channel}`}
            >
              {conversation.channel === "email" ? (
                <Mail className="w-3 h-3" />
              ) : (
                <Linkedin className="w-3 h-3" />
              )}
            </span>
          )}
        </div>

        <h2 className="text-base font-semibold text-gray-800">{fullName}</h2>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {lead?.jobTitle || lead?.headline || "Prospect"}
        </p>

        {lead?.company && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
            <Building className="w-3 h-3 text-gray-400" />
            <span className="font-medium text-gray-700 truncate max-w-[170px]">{lead.company}</span>
          </div>
        )}

        {/* Lead status pill */}
        <div className="mt-3">
          {isReplied ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-600 border border-emerald-100">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Replied
            </span>
          ) : isInSequence ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-violet-50 text-violet-600 border border-violet-100">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              In Sequence
            </span>
          ) : isPaused ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-50 text-amber-600 border border-amber-100">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              Sequence Paused
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-50 text-gray-600 border border-gray-100">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Active Lead
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 space-y-4 flex-1">
        {/* Contact Info Card */}
        <div className="bg-white rounded-xl border border-gray-100 p-3.5 space-y-2.5 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Contact Information
          </p>

          {/* Email */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0 text-gray-600">
              <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400 shrink-0">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <span className="truncate font-medium text-gray-700" title={lead?.email}>
                {lead?.email || "No email available"}
              </span>
            </div>
            {lead?.email && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => copyToClipboard(lead.email, "email")}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                  title="Copy email"
                >
                  {copiedField === "email" ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
                <a
                  href={`mailto:${lead.email}`}
                  className="p-1 rounded-md text-gray-400 hover:text-violet-600 hover:bg-gray-100 transition-colors"
                  title="Send email"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Phone */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0 text-gray-600">
              <div className="p-1.5 rounded-lg bg-gray-50 text-gray-400 shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="truncate font-medium text-gray-700">
                {lead?.phone || "No phone available"}
              </span>
            </div>
            {lead?.phone && (
              <button
                onClick={() => copyToClipboard(lead.phone, "phone")}
                className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
                title="Copy phone"
              >
                {copiedField === "phone" ? (
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            )}
          </div>

          {/* LinkedIn Profile */}
          {lead?.linkedinUrl && (
            <div className="pt-1">
              <a
                href={lead.linkedinUrl}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-[#0A66C2]/5 hover:bg-[#0A66C2]/10 text-[#0A66C2] text-xs font-medium transition-colors"
              >
                <Linkedin className="w-3.5 h-3.5" />
                <span>View LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>
            </div>
          )}
        </div>

        {/* Campaign Outreach Journey */}
        <div className="bg-white rounded-xl border border-gray-100 p-3.5 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Campaign Journey
            </p>
            {campaign && (
              <span className="text-[10px] font-medium text-violet-600 bg-violet-50 px-2 py-0.5 rounded-full">
                Active
              </span>
            )}
          </div>

          {campaign ? (
            <div className="space-y-2.5">
              <div>
                <p className="text-xs font-semibold text-gray-800 line-clamp-1">{campaign.name}</p>
                <div className="flex items-center gap-1.5 text-[11px] text-gray-400 mt-1">
                  <Clock className="w-3 h-3" />
                  <span>
                    Enrolled {campaign.enrolledAt ? new Date(campaign.enrolledAt).toLocaleDateString() : "recently"}
                  </span>
                </div>
              </div>

              {/* Pause / Resume Sequence Controls */}
              {onSequenceAction && (isInSequence || isPaused) && (
                <div className="pt-1 border-t border-gray-100">
                  {isPaused ? (
                    <button
                      onClick={() => handleSequenceToggle("resume_sequence")}
                      disabled={actionPending}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{actionPending ? "Resuming..." : "Resume Sequence"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSequenceToggle("pause_sequence")}
                      disabled={actionPending}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <Pause className="w-3.5 h-3.5 fill-current" />
                      <span>{actionPending ? "Pausing..." : "Pause Sequence"}</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-gray-400 italic">
              Direct conversation. No active automated sequence enrolled.
            </p>
          )}
        </div>

        {/* Lead Tags */}
        {lead?.tags && lead.tags.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-3.5 space-y-2 shadow-2xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Tags</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {lead.tags.map((tag, i) => (
                <span
                  key={i}
                  className="text-[11px] font-medium bg-gray-50 text-gray-600 px-2 py-0.5 rounded-md border border-gray-100"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
