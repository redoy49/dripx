"use client";

import {
  Users,
  Send,
  MessageSquare,
  CheckCircle,
  Mail,
  Linkedin,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react";

export default function CampaignAnalyticsTab({ analytics }) {
  if (!analytics) return null;

  const { overview, channels, stepMetrics } = analytics;

  return (
    <div className="space-y-6">
      {/* 1. Executive KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Enrolled */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Total Enrolled
            </span>
            <div className="p-2 rounded-xl bg-violet-50 text-violet-600">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{overview.totalLeads}</span>
            <span className="text-xs text-gray-400">leads</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
            <span>{overview.inProgressLeads} active in sequence</span>
          </div>
        </div>

        {/* Total Dispatched */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Outreach Touches
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{overview.totalDispatched}</span>
            <span className="text-xs text-gray-400">actions sent</span>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center gap-2">
            <span className="flex items-center gap-1 text-blue-600 font-medium">
              <Mail className="w-3 h-3" /> {channels.email.dispatched}
            </span>
            <span>·</span>
            <span className="flex items-center gap-1 text-[#0A66C2] font-medium">
              <Linkedin className="w-3 h-3" /> {channels.linkedin.dispatched}
            </span>
          </div>
        </div>

        {/* Reply Rate */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Response Rate
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <MessageSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{overview.replyRate}%</span>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
              {overview.repliedLeads} replied
            </span>
          </div>
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
            <span>Benchmark: 8% – 15%</span>
          </div>
        </div>

        {/* Completed Leads */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
              Sequence Finished
            </span>
            <div className="p-2 rounded-xl bg-slate-50 text-slate-600">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">{overview.completionRate}%</span>
            <span className="text-xs text-gray-400">{overview.completedLeads} leads</span>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            <span>{overview.pausedLeads} leads paused</span>
          </div>
        </div>
      </div>

      {/* 2. Visual Funnel Progress & Channel Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Conversion Funnel */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Conversion Funnel</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                End-to-end prospect journey from enrollment to conversation.
              </p>
            </div>
            <span className="text-xs font-semibold text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
              Funnel Overview
            </span>
          </div>

          <div className="space-y-4 pt-2">
            {/* Step 1: Enrolled */}
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-500" />
                  1. Enrolled Prospects
                </span>
                <span className="text-gray-900 font-bold">{overview.totalLeads} (100%)</span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#6367FF] rounded-full transition-all duration-500" style={{ width: "100%" }} />
              </div>
            </div>

            {/* Step 2: Contacted */}
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-500" />
                  2. Touched via Outreach
                </span>
                <span className="text-gray-900 font-bold">
                  {overview.totalLeads - overview.pendingLeads} (
                  {overview.totalLeads > 0
                    ? Math.round(((overview.totalLeads - overview.pendingLeads) / overview.totalLeads) * 100)
                    : 0}
                  %)
                </span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 rounded-full transition-all duration-500"
                  style={{
                    width: `${overview.totalLeads > 0 ? ((overview.totalLeads - overview.pendingLeads) / overview.totalLeads) * 100 : 0}%`,
                  }}
                />
              </div>
            </div>

            {/* Step 3: Replied */}
            <div>
              <div className="flex justify-between text-xs font-medium text-gray-700 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  3. Inbound Responses Generated
                </span>
                <span className="text-emerald-600 font-bold">
                  {overview.repliedLeads} ({overview.replyRate}%)
                </span>
              </div>
              <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, overview.replyRate * 2.5)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Multi-Channel Performance Matrix */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Multi-Channel Matrix</h3>
            <p className="text-xs text-gray-400 mt-0.5">Response rates by channel.</p>
          </div>

          <div className="space-y-4">
            {/* Email Channel Card */}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Email Outreach</span>
                </div>
                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                  {channels.email.dispatched > 0
                    ? Math.round((channels.email.replies / channels.email.dispatched) * 100)
                    : 0}
                  % Reply Rate
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 pt-1">
                <span>{channels.email.dispatched} sent</span>
                <span className="font-semibold text-gray-700">{channels.email.replies} replies</span>
              </div>
            </div>

            {/* LinkedIn Channel Card */}
            <div className="p-4 rounded-xl border border-gray-100 bg-gray-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-lg bg-[#0A66C2]/10 text-[#0A66C2]">
                    <Linkedin className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">LinkedIn Outreach</span>
                </div>
                <span className="text-xs font-semibold text-[#0A66C2] bg-blue-50 px-2 py-0.5 rounded-md">
                  {channels.linkedin.dispatched > 0
                    ? Math.round((channels.linkedin.replies / channels.linkedin.dispatched) * 100)
                    : 0}
                  % Reply Rate
                </span>
              </div>
              <div className="flex justify-between text-xs text-gray-500 pt-1">
                <span>{channels.linkedin.dispatched} sent</span>
                <span className="font-semibold text-gray-700">{channels.linkedin.replies} replies</span>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-400 bg-violet-50/50 p-2.5 rounded-xl border border-violet-100 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-violet-500 shrink-0" />
            <span>Multi-channel campaigns generate up to 2.8x higher response rates.</span>
          </div>
        </div>
      </div>

      {/* 3. Step-by-Step Drop-off Funnel Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-2xs overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-gray-900">Sequence Step Performance</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Individual step volume, drop-off, and replies triggered per touchpoint.
            </p>
          </div>
          <span className="text-xs font-semibold text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full border border-gray-100">
            {stepMetrics.length} Steps
          </span>
        </div>

        {stepMetrics.length === 0 ? (
          <div className="p-8 text-center text-xs text-gray-400">
            No sequence steps configured for this campaign yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/70 border-b border-gray-100 text-gray-500 font-semibold">
                <tr>
                  <th className="py-3 px-5">Step</th>
                  <th className="py-3 px-5">Type</th>
                  <th className="py-3 px-5">Prospects Engaged</th>
                  <th className="py-3 px-5">Replies Generated</th>
                  <th className="py-3 px-5 text-right">Step Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-gray-700">
                {stepMetrics.map((step, idx) => {
                  const convPct =
                    step.executedCount > 0
                      ? Math.min(100, Math.round((step.repliedCount / step.executedCount) * 100))
                      : 0;

                  return (
                    <tr
                      key={step.stepId ? `${step.stepId}-${idx}` : idx}
                      className="hover:bg-gray-50/50 transition-colors"
                    >
                      <td className="py-3.5 px-5 font-semibold text-gray-800">{step.title}</td>
                      <td className="py-3.5 px-5">
                        <span className="capitalize px-2 py-0.5 rounded-md font-medium text-[11px] bg-gray-100 text-gray-600">
                          {step.type.replace("_", " ")}
                        </span>
                      </td>
                      <td className="py-3.5 px-5 font-medium">{step.executedCount}</td>
                      <td className="py-3.5 px-5 font-semibold text-emerald-600">
                        {step.repliedCount > 0 ? `+${step.repliedCount}` : "0"}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-20 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-violet-500 h-full rounded-full"
                              style={{ width: `${Math.max(5, convPct * 3)}%` }}
                            />
                          </div>
                          <span className="font-semibold text-gray-700 w-8">{convPct}%</span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
