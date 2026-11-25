"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Layers, Mail, Inbox, Bot, Shield, Globe, BarChart3, ArrowRight } from "lucide-react";

const ARCHITECTURE_PILLARS = [
  {
    id: "sequences",
    label: "Sequences & Flow",
    icon: Layers,
    title: "Synchronized LinkedIn and Email conditional branching",
    description:
      "Orchestrate profile visits, connection invites, InMail, and RFC 2822 cold email follow-ups in one React Flow canvas with automatic reply-stop guardrails.",
    points: [
      "Conditional fallback from LinkedIn invite to cold email after 72 hours",
      "Randomized delay intervals and prospect-local 9am–5pm scheduling",
      "Pre-activation validator catches empty subjects or broken steps",
    ],
    previewHeader: "Multi-Channel Sequence Builder",
    previewItems: [
      { step: "Step 1", name: "LinkedIn Profile View", meta: "Dedicated residential IP session" },
      { step: "Step 2", name: "Wait 4h -> Connection Invite", meta: "Personalized {{firstName}} + Spintax note" },
      { step: "Step 3", name: "Email Fallback (if unaccepted)", meta: "Threaded Re: subject via Gmail / SMTP" },
    ],
  },
  {
    id: "deliverability",
    label: "Deliverability & Spintax",
    icon: Mail,
    title: "Built-in Spintax rotation, warm-up, and mailbox caps",
    description:
      "Protect domain reputation with automatic {Hi|Hello|Hey} copy variation on every send, daily mailbox ramp-up limits, and true Message-ID email threading.",
    points: [
      "Automatic single-brace Spintax resolution across subjects and bodies",
      "Daily per-mailbox sending limits and warm-up pacing schedules",
      "SPF, DKIM, and DMARC diagnostic verification per connected domain",
    ],
    previewHeader: "Mailbox Rotation & Warm-Up",
    previewItems: [
      { step: "Gmail OAuth", name: "alex@dripx-growth.com", meta: "40/40 sent · Warm-up healthy" },
      { step: "SMTP / M365", name: "alex@dripx-sales.io", meta: "25/25 sent · Spintax active" },
      { step: "DNS Check", name: "SPF Pass · DKIM Valid", meta: "DMARC policy enforced" },
    ],
  },
  {
    id: "inbox",
    label: "Unified Inbox",
    icon: Inbox,
    title: "Collision-locked team inbox across all channels",
    description:
      "Respond to LinkedIn DMs and cold email threads from one consolidated feed. Instant thread locks prevent multiple reps from messaging the same prospect.",
    points: [
      "Real-time rep lock indicator while composing replies",
      "Optimistic message UI with delivery status tracking",
      "Starred, unread, and channel filters across team workspaces",
    ],
    previewHeader: "Live Collision Guard",
    previewItems: [
      { step: "Inbound DM", name: "Michael Chang · VP Product", meta: "Asked for Thursday 2:00 PM walkthrough" },
      { step: "Lock Active", name: "Sarah Chen is replying", meta: "Thread locked for teammates automatically" },
      { step: "Auto-Pause", name: "Sequence halted for lead", meta: "Remaining follow-up steps canceled" },
    ],
  },
  {
    id: "agent",
    label: "AI Agent Workspace",
    icon: Bot,
    title: "BYOK Multi-Model AI Agent with human guardrails",
    description:
      "Inspect campaign metrics, draft React Flow sequences, and triage inbox threads with River AI, OpenRouter, Claude, OpenAI, DeepSeek, or custom endpoints.",
    points: [
      "Build, Plan, and Ask execution modes with @ context mentions",
      "Live /models discovery grouped in collapsible provider dropdowns",
      "Confirm & Execute approval cards before live activations or sends",
    ],
    previewHeader: "Agent Modes & Tool Guardrails",
    previewItems: [
      { step: "Build Mode", name: "Create campaign + sequence draft", meta: "Auto-saves valid React Flow nodes" },
      { step: "Plan Mode", name: "Read-only funnel & mailbox audit", meta: "Zero state mutations" },
      { step: "Guarded", name: "Activate or send live inbox reply", meta: "Requires explicit Confirm & Execute" },
    ],
  },
];

const SECONDARY_CAPABILITIES = [
  { icon: Shield, title: "Dedicated Residential IPs", desc: "Isolated server-side LinkedIn sessions per sender." },
  { icon: Globe, title: "Timezone Windowing", desc: "Holds queued jobs until recipient business hours." },
  { icon: BarChart3, title: "Sequence Simulator", desc: "Dry-run every variable & Spintax output before launch." },
];

export default function FeaturesInteractive() {
  const [selectedId, setSelectedId] = useState("sequences");
  const current = ARCHITECTURE_PILLARS.find((p) => p.id === selectedId) || ARCHITECTURE_PILLARS[0];

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-20">
      {/* Interactive Pillar Switcher */}
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-center gap-2 mb-10">
          {ARCHITECTURE_PILLARS.map((pillar) => {
            const Icon = pillar.icon;
            const active = pillar.id === selectedId;
            return (
              <button
                key={pillar.id}
                type="button"
                onClick={() => setSelectedId(pillar.id)}
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                  active ? "bg-indigo-600 text-white shadow-ring-elevated" : "bg-white text-slate-600 shadow-ring-card hover:text-slate-900"
                }`}
              >
                <Icon size={14} />
                <span>{pillar.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center rounded-3xl bg-white p-6 sm:p-10 shadow-ring-card">
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900">
              {current.title}
            </h2>
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{current.description}</p>
            <ul className="space-y-2.5 text-sm text-slate-700 list-none m-0 p-0 pt-1">
              {current.points.map((pt) => (
                <li key={pt} className="flex items-start gap-2.5">
                  <Check size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl bg-slate-50/80 p-5 shadow-ring-card space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-200/80 text-xs font-semibold text-slate-700">
                <span>{current.previewHeader}</span>
                <span className="text-emerald-700">Active</span>
              </div>
              {current.previewItems.map((item) => (
                <div key={item.name} className="rounded-xl bg-white p-3.5 shadow-ring-card">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-indigo-600">{item.step}</span>
                    <span className="text-[11px] text-slate-500">{item.meta}</span>
                  </div>
                  <p className="mt-1 text-sm font-semibold text-slate-900">{item.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Geometric 3-Column Infrastructure Strip */}
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 border border-slate-200/90 rounded-2xl bg-white overflow-hidden">
        {SECONDARY_CAPABILITIES.map((cap, i) => {
          const Icon = cap.icon;
          return (
            <div key={cap.title} className={`p-7 ${i < 2 ? "border-b md:border-b-0 md:border-r border-slate-200/90" : ""}`}>
              <Icon size={18} className="text-indigo-600 mb-3" />
              <h3 className="text-base font-semibold text-slate-900">{cap.title}</h3>
              <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{cap.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Bottom CTA */}
      <div className="max-w-4xl mx-auto rounded-3xl bg-[linear-gradient(180deg,#eef2ff_0%,#ffffff_100%)] p-8 sm:p-12 text-center shadow-ring-card">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900">
          See every workflow running in your own workspace
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3 text-sm shadow-ring-elevated transition"
          >
            <span>Start 14-day free trial</span>
            <ArrowRight size={15} />
          </Link>
          <Link
            href="/pricing"
            className="inline-flex items-center rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold px-7 py-3 text-sm shadow-ring-card transition"
          >
            Compare plans
          </Link>
        </div>
      </div>
    </section>
  );
}
