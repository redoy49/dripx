"use client";

import { useState } from "react";
import { Layers, Inbox, Shuffle, Bot } from "lucide-react";
import ProductTabPreview from "./ProductTabPreview";

const PRODUCT_TABS = [
  {
    id: "sequences",
    label: "Multi-Channel Flow",
    icon: Layers,
    heading: "Synchronized LinkedIn and Email branching",
    description: "Run LinkedIn steps and RFC 2822 email fallbacks on one visual canvas.",
    points: ["72h auto-fallback to cold email", "Prospect 9am–5pm window guard"],
  },
  {
    id: "inbox",
    label: "Unified Inbox",
    icon: Inbox,
    heading: "Zero-collision team inbox",
    description: "Manage LinkedIn DMs and email replies together with live rep locks.",
    points: ["Instant thread lock while typing", "Auto-pauses sequences on reply"],
  },
  {
    id: "spintax",
    label: "Live Spintax",
    icon: Shuffle,
    heading: "Fresh copy on every outbound send",
    description: "Rotate {Hi|Hello|Hey} variants automatically across subjects and bodies.",
    points: ["Nested Spintax & variable fallbacks", "Safe around HTML & merge tags"],
  },
  {
    id: "agent",
    label: "AI Agent Workspace",
    icon: Bot,
    heading: "Prompt-driven campaign copilot",
    description: "Bring your own Claude, OpenAI, DeepSeek, or Gemini API keys.",
    points: ["Build, Plan, and Ask modes", "Confirm & Execute safety guardrails"],
  },
];

export default function InteractiveProductTabs() {
  const [activeId, setActiveId] = useState("sequences");
  const active = PRODUCT_TABS.find((t) => t.id === activeId) || PRODUCT_TABS[0];

  return (
    <section id="interactive-product" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="max-w-2xl mx-auto text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-slate-900">
          One workspace from prospect list to booked call
        </h2>
        <p className="mt-2.5 text-sm sm:text-base text-slate-600">
          Explore each core engine or test a live Spintax variant.
        </p>
      </div>

      {/* Interactive Tab Bar */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {PRODUCT_TABS.map((tab) => {
          const Icon = tab.icon;
          const selected = tab.id === activeId;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveId(tab.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition cursor-pointer ${
                selected
                  ? "bg-indigo-400 hover:bg-indigo-500 text-white shadow-ring-elevated"
                  : "bg-white text-slate-600 shadow-ring-card hover:text-slate-900"
              }`}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panel */}
      <div className="w-full rounded-3xl bg-white p-6 sm:p-8 shadow-ring-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{active.heading}</h3>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">{active.description}</p>
          <ul className="space-y-2 text-sm text-slate-700 list-none m-0 p-0">
            {active.points.map((pt) => (
              <li key={pt} className="flex items-center gap-2.5">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                <span>{pt}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          <ProductTabPreview tabId={active.id} />
        </div>
      </div>
    </section>
  );
}
