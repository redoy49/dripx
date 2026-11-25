"use client";

import { useState } from "react";
import { Clock, Sparkles, Check, Mail, Bot, Shuffle, Lock } from "lucide-react";
import { FaLinkedinIn } from "react-icons/fa";

const WORKFLOW_PATHS = {
  sent: {
    summary: "Spintax + RFC 2822 Threading dispatched 342 unique messages inside recipient business hours.",
    tools: ["email", "linkedin", "spintax"],
  },
  draft: {
    summary: "BYOK AI Agent triaged 19 positive replies and locked active rep threads against collisions.",
    tools: ["ai", "lock"],
  },
  brief: {
    summary: "Daily campaign telemetry consolidated 7 booked meetings and paused replied prospects automatically.",
    tools: ["email", "linkedin", "ai"],
  },
};

const TOOL_PILLS = [
  { id: "email", label: "Email", icon: Mail, target: "sent" },
  { id: "linkedin", label: "LinkedIn", icon: FaLinkedinIn, target: "sent" },
  { id: "spintax", label: "Spintax", icon: Shuffle, target: "sent" },
  { id: "ai", label: "BYOK AI", icon: Bot, target: "draft" },
  { id: "lock", label: "Lock", icon: Lock, target: "draft" },
];

const OUTCOME_CARDS = [
  { id: "sent", title: "Spintax Outreach Sent", meta: "342 unique variants", edge: "342 jobs" },
  { id: "draft", title: "Replies Triaged", meta: "19 threads locked", edge: "19 threads" },
  { id: "brief", title: "Pipeline Ready", meta: "7 meetings booked", edge: "7 booked" },
];

export default function CloudWorkflowSection() {
  const [activePath, setActivePath] = useState("sent");
  const current = WORKFLOW_PATHS[activePath] || WORKFLOW_PATHS.sent;

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="scroll-depth-card max-w-5xl mx-auto rounded-3xl border border-stone-200/90 bg-[linear-gradient(180deg,#faf7f2_0%,#fcfbf8_55%,#ffffff_100%)] p-6 sm:p-11">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900">
              Works with the channels you close at night.
            </h2>
            <p className="mt-1.5 text-sm text-slate-600">
              Select any channel tool or outcome node to trace how DripX automates outreach 24/7.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-medium text-emerald-700">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Cloud Scheduler Active
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
          {/* Left Trigger Node */}
          <div className="lg:col-span-3 flex flex-col items-center text-center">
            <div className="rounded-2xl bg-white p-4 shadow-ring-card w-full max-w-[200px]">
              <div className="mx-auto mb-2.5 h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Clock size={18} />
              </div>
              <p className="text-xs font-semibold text-slate-900">Every 30 seconds</p>
              <p className="mt-0.5 text-[11px] text-slate-500">Local 9am–5pm guard</p>
            </div>
          </div>

          {/* Center Hub + Tool Pills */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full rounded-2xl bg-white px-5 py-4 shadow-ring-elevated text-center">
              <div className="flex items-center justify-center gap-2">
                <span className="h-6 w-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                  <Sparkles size={13} />
                </span>
                <span className="text-sm font-semibold text-slate-900">DripX Cloud &amp; AI Agent</span>
                <Check size={14} className="text-emerald-600" />
              </div>
              <p className="mt-1 text-xs text-slate-500">Sequence &middot; Personalize &middot; Verify</p>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              {TOOL_PILLS.map((tool) => {
                const Icon = tool.icon;
                const lit = current.tools.includes(tool.id);
                return (
                  <button
                    key={tool.id}
                    type="button"
                    onClick={() => setActivePath(tool.target)}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition cursor-pointer ${
                      lit
                        ? "bg-indigo-600 text-white shadow-xs"
                        : "bg-white text-slate-600 shadow-ring-card hover:text-slate-900"
                    }`}
                  >
                    <Icon size={12} />
                    <span>{tool.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right Outcome Nodes */}
          <div className="lg:col-span-4 space-y-2.5">
            {OUTCOME_CARDS.map((card) => {
              const selected = activePath === card.id;
              return (
                <button
                  key={card.id}
                  type="button"
                  onClick={() => setActivePath(card.id)}
                  className={`w-full text-left rounded-2xl px-4 py-3 transition flex items-center justify-between gap-3 cursor-pointer ${
                    selected ? "bg-white shadow-ring-elevated" : "bg-white/85 shadow-ring-card hover:bg-white"
                  }`}
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{card.title}</p>
                    <p className="text-[11px] text-slate-500 tabular-nums">{card.meta}</p>
                  </div>
                  <span
                    className={`text-[11px] font-semibold px-2 py-0.5 rounded-full tabular-nums ${
                      selected ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {card.edge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-7 rounded-xl bg-white/90 px-4 py-3 text-xs text-slate-700 shadow-ring-card flex items-center justify-between gap-4">
          <span>{current.summary}</span>
          <span className="hidden sm:inline text-[11px] font-medium text-indigo-600 shrink-0">Live Path</span>
        </div>
      </div>
    </section>
  );
}
