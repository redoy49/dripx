"use client";

import { useState } from "react";
import {
  Mail,
  Phone,
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
import { FaLinkedin } from "react-icons/fa";

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
          <Sparkles className="w-6 h-6 text-indigo-400" />
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
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-100 flex items-center justify-center text-lg font-bold shadow-2xs">
            {initials}
          </div>
          {conversation?.channel && (
            <span
              className={`absolute -bottom-1 -right-1 p-1 rounded-full text-[10px] text-white shadow-2xs border border-white ${
                conversation.channel === "email" ? "bg-sky-500" : "bg-[#0A66C2]"
              }`}
              title={`Active channel: ${conversation.channel}`}
            >
              {conversation.channel === "email" ? (
                <Mail className="w-3 h-3" />
              ) : (
                <FaLinkedin className="w-3 h-3" />
              )}
            </span>
          )}
        </div>

        <h2 className="text-base font-semibold text-gray-800">{fullName}</h2>
        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
          {lead?.jobTitle || lead?.headline || "Prospect"}
        </p>

        {lead?.company && (
          <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-200/90 shadow-2xs">
            <Building className="w-3 h-3 text-gray-400" />
            <span className="font-medium text-gray-700 truncate max-w-[170px]">{lead.company}</span>
          </div>
        )}

        {/* Lead status pill */}
        <div className="mt-3">
          {isReplied ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Replied
            </span>
          ) : isInSequence ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 text-indigo-500 border border-indigo-100 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              In Sequence
            </span>
          ) : isPaused ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-600 border border-amber-100 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              Sequence Paused
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-50 text-gray-600 border border-gray-200/90 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
              Active Lead
            </span>
          )}
        </div>
      </div>

      {/* Content Body */}
      <div className="p-4 space-y-4 flex-1">
        {/* Contact Info Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-2xs">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
            Contact Information
          </p>

          {/* Email */}
          <div className="flex items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 min-w-0 text-gray-600">
              <div className="p-1.5 rounded-full bg-gray-50 border border-gray-200/60 text-gray-400 shrink-0">
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
                  className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors active:scale-95 cursor-pointer"
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
                  className="p-1.5 rounded-full text-gray-400 hover:text-indigo-500 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors active:scale-95 cursor-pointer"
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
              <div className="p-1.5 rounded-full bg-gray-50 border border-gray-200/60 text-gray-400 shrink-0">
                <Phone className="w-3.5 h-3.5" />
              </div>
              <span className="truncate font-medium text-gray-700">
                {lead?.phone || "No phone available"}
              </span>
            </div>
            {lead?.phone && (
              <button
                onClick={() => copyToClipboard(lead.phone, "phone")}
                className="p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-colors active:scale-95 cursor-pointer shrink-0"
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
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-full bg-[#0A66C2]/5 hover:bg-[#0A66C2]/10 border border-[#0A66C2]/20 text-[#0A66C2] text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
              >
                <FaLinkedin className="w-3.5 h-3.5" />
                <span>View LinkedIn Profile</span>
                <ExternalLink className="w-3 h-3 ml-auto opacity-70" />
              </a>
            </div>
          )}
        </div>

        {/* Campaign Outreach Journey */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
              Campaign Journey
            </p>
            {campaign && (
              <span className="text-[10px] font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full shadow-2xs">
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
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-700 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>{actionPending ? "Resuming..." : "Resume Sequence"}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => handleSequenceToggle("pause_sequence")}
                      disabled={actionPending}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/80 text-amber-700 text-xs font-bold shadow-2xs transition active:scale-95 cursor-pointer disabled:opacity-50"
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
          <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2.5 shadow-2xs">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 flex items-center gap-1">
              <Tag className="w-3 h-3" />
              <span>Tags</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {lead.tags.map((tag, i) => (
                <span
                  key={i}
                  className="rounded-full border border-gray-200/80 bg-gray-50 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 shadow-2xs"
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
