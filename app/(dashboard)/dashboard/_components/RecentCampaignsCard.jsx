"use client";

import Link from "next/link";
import { ChevronRight, Info, Plus } from "lucide-react";

export default function RecentCampaignsCard({
  topCampaigns = [],
  campaignToggles = {},
  creatingCampaign,
  onCreateCampaign,
  onToggleCampaign,
}) {
  return (
    <div className="rounded-2xl border border-gray-100/90 bg-white p-5 sm:p-6 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-base font-bold text-gray-900 tracking-tight">Recent campaigns</h2>
        <div className="flex items-center gap-2.5">
          <Link
            href="/dashboard/campaigns"
            className="rounded-full border border-gray-200/90 bg-white px-4 py-2 text-xs font-semibold text-gray-600 shadow-2xs transition hover:bg-gray-50 active:scale-95 cursor-pointer"
          >
            All campaigns
          </Link>
          <button
            onClick={onCreateCampaign}
            disabled={creatingCampaign}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400 hover:bg-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-sm transition active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Plus size={14} />
            <span>{creatingCampaign ? "Creating..." : "New campaign"}</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-gray-100 text-[11px] font-semibold text-gray-400">
              <th className="pb-3 font-semibold uppercase tracking-wider w-[36%]">Overview</th>
              <th className="pb-3 font-semibold uppercase tracking-wider w-[24%]">Leads</th>
              <th className="pb-3 font-semibold uppercase tracking-wider w-[24%]">LinkedIn</th>
              <th className="pb-3 font-semibold uppercase tracking-wider w-[16%] text-right">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 text-xs">
            {topCampaigns.length > 0 ? (
              topCampaigns.map((camp) => {
                const isToggledActive =
                  campaignToggles[camp.id] !== undefined
                    ? campaignToggles[camp.id]
                    : camp.status === "active";

                return (
                  <tr key={camp.id} className="group hover:bg-[#FAFAFC] transition">
                    <td className="py-4 pr-4">
                      <Link
                        href={`/dashboard/campaigns/${camp.id}`}
                        className="inline-flex items-center gap-1.5 font-bold text-gray-800 group-hover:text-indigo-400 transition"
                      >
                        <span>{camp.name}</span>
                        <ChevronRight
                          size={13}
                          className="text-gray-400 group-hover:text-indigo-400"
                        />
                      </Link>
                      <div className="mt-2 space-y-1 max-w-xs">
                        <div className="flex items-center justify-between text-[10px] text-gray-400 font-medium">
                          <span>👥 {camp.totalLeads} prospects</span>
                          <span className="text-emerald-500 font-semibold">{camp.progressPct}%</span>
                        </div>
                        <div className="flex h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                          <div
                            style={{ width: `${Math.min(70, camp.progressPct)}%` }}
                            className="bg-indigo-400"
                          />
                          <div
                            style={{ width: `${Math.min(20, camp.replyRate || 10)}%` }}
                            className="bg-emerald-400"
                          />
                          <div style={{ width: "10%" }} className="bg-rose-400" />
                        </div>
                      </div>
                    </td>

                    <td className="py-4 pr-4 align-top">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-sm font-bold text-gray-900">{camp.totalLeads}</span>
                        <span className="text-[10px] font-bold text-indigo-400">Total</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-0.5">All leads</p>
                      <div className="mt-2 text-[11px] text-gray-400">
                        <span className="font-bold text-gray-700">{camp.inProgress || 0}</span> in
                        progress
                      </div>
                    </td>

                    <td className="py-4 pr-4 align-top">
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between max-w-[170px]">
                          <span className="text-[11px] text-gray-500">Reply rate</span>
                          <span className="font-bold text-gray-800">
                            {camp.replyRate ? `${camp.replyRate}%` : "0%"}
                          </span>
                        </div>
                        <div className="flex items-center justify-between max-w-[170px]">
                          <span className="text-[11px] text-gray-500 flex items-center gap-1">
                            <span>Replied leads</span>
                            <Info size={11} className="text-gray-300" />
                          </span>
                          <span className="font-bold text-gray-800">{camp.repliedCount || 0}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-right align-top">
                      <div className="flex flex-col items-end gap-1">
                        <button
                          onClick={() => onToggleCampaign(camp.id, camp.status)}
                          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                            isToggledActive ? "bg-emerald-400" : "bg-gray-200"
                          }`}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                              isToggledActive ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                        <span className="text-[10px] font-medium text-gray-400">
                          {camp.createdAt}
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-12 text-center text-xs text-gray-400">
                  <p className="font-semibold text-gray-600">
                    No campaigns launched yet in this workspace
                  </p>
                  <p className="mt-1">
                    Create an outreach sequence to start enrolling and dispatching leads.
                  </p>
                  <button
                    onClick={onCreateCampaign}
                    disabled={creatingCampaign}
                    className="inline-flex items-center gap-1.5 mt-3 rounded-full bg-indigo-400 px-4 py-2 text-xs font-bold text-white hover:bg-indigo-500 disabled:opacity-60 cursor-pointer shadow-sm transition active:scale-95"
                  >
                    <Plus size={13} />
                    <span>{creatingCampaign ? "Creating..." : "Create first campaign"}</span>
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
