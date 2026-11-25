"use client";

import Link from "next/link";
import { CheckCircle2, Loader2, ShieldAlert, XCircle, ArrowUpRight, Wrench } from "lucide-react";

const TOOL_LABELS = {
  getDashboardOverview: "Reading Workspace Overview",
  listCampaigns: "Listing Campaigns",
  getCampaignDetails: "Inspecting Campaign Details",
  searchLeads: "Searching Leads",
  listInboxThreads: "Reading Unified Inbox",
  getMailboxHealth: "Auditing Mailbox Health",
  createCampaignDraft: "Creating Draft Campaign",
  buildSequenceDraft: "Building Sequence Canvas",
  enrollLeadsToDraft: "Enrolling Leads into Draft",
  tagLeads: "Tagging Leads",
  activateCampaign: "Activate Live Campaign",
  updateCampaignStatus: "Update Campaign Status",
  sendInboxReply: "Send Live Prospect Reply",
  deleteCampaign: "Delete Campaign",
};

export default function AgentToolCard({ part, onApprove }) {
  const toolName = part.type?.replace(/^tool-/, "") || "tool";
  const label = TOOL_LABELS[toolName] || toolName;
  const builderUrl = part.output?.builderUrl;

  if (part.state === "approval-requested" && !part.approval?.isAutomatic) {
    return (
      <div className="my-2 rounded-2xl border border-amber-200 bg-amber-50/70 p-4 space-y-3 shadow-2xs">
        <div className="flex items-start gap-2.5">
          <ShieldAlert size={18} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold text-amber-900">Approval Required: {label}</p>
            <p className="text-[11px] text-amber-800/80 mt-0.5">
              This action modifies live outreach or sends a real message to a prospect.
            </p>
            <pre className="mt-2 rounded-xl bg-white/80 border border-amber-200/70 p-2.5 text-[11px] text-gray-700 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(part.input, null, 2)}
            </pre>
          </div>
        </div>
        <div className="flex items-center gap-2 justify-end">
          <button
            type="button"
            onClick={() => onApprove({ id: part.approval.id, approved: false, reason: "User cancelled" })}
            className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onApprove({ id: part.approval.id, approved: true })}
            className="rounded-full bg-indigo-500 hover:bg-indigo-600 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition active:scale-95 cursor-pointer"
          >
            Confirm &amp; Execute
          </button>
        </div>
      </div>
    );
  }

  const isRunning = part.state === "input-streaming" || part.state === "input-available" || part.state === "approval-responded";
  const isError = part.state === "output-error" || part.state === "output-denied" || Boolean(part.output?.error);

  return (
    <div className="my-1.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-gray-200/80 bg-gray-50/70 px-3 py-2 text-xs">
      <div className="flex items-center gap-2 min-w-0">
        {isRunning ? (
          <Loader2 size={14} className="animate-spin text-indigo-500 shrink-0" />
        ) : isError ? (
          <XCircle size={14} className="text-rose-500 shrink-0" />
        ) : (
          <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
        )}
        <Wrench size={12} className="text-gray-400 shrink-0" />
        <span className="font-semibold text-gray-700 truncate">{label}</span>
        {part.state === "output-denied" && <span className="text-[11px] text-rose-500">(Cancelled)</span>}
        {part.output?.error && <span className="text-[11px] text-rose-500 truncate">{part.output.error}</span>}
      </div>

      {builderUrl && (
        <Link
          href={builderUrl}
          className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200 px-2.5 py-0.5 text-[11px] font-bold text-indigo-600 hover:bg-indigo-100 transition"
        >
          <span>Open Flow Builder</span>
          <ArrowUpRight size={12} />
        </Link>
      )}
    </div>
  );
}
