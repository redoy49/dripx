"use client";

import { useState } from "react";
import Image from "next/image";
import { Layers, Inbox, Shuffle, Bot, RefreshCw } from "lucide-react";
import { resolveSpintax } from "@/app/lib/personalization";

const PRODUCT_TABS = [
  {
    id: "sequences",
    label: "Multi-Channel Flow",
    icon: Layers,
    heading: "Synchronized LinkedIn and Email branching",
    description:
      "Trigger LinkedIn visits, connection notes, and cold email fallbacks on a single visual canvas. Any reply pauses follow-ups immediately.",
    bullets: [
      "Automatic fallback from LinkedIn invite to Email after 72h",
      "True RFC 2822 Message-ID & In-Reply-To email threading",
      "Prospect-local 9am–5pm sending window enforcement",
    ],
    image: "/feature-multichannel.png",
  },
  {
    id: "inbox",
    label: "Unified Inbox",
    icon: Inbox,
    heading: "Zero-collision team inbox across all senders",
    description:
      "Read every LinkedIn DM and cold email reply side-by-side. Real-time thread locks ensure two reps never pitch the same executive twice.",
    bullets: [
      "Instant presence lock while a teammate is typing a reply",
      "Optimistic message dispatch with live delivery status",
      "Filter unread, starred, and positive-intent conversations",
    ],
    image: "/feature-unified-inbox.png",
  },
  {
    id: "spintax",
    label: "Live Spintax",
    icon: Shuffle,
    heading: "Automatic copy variation on every outbound send",
    description:
      "Write {Hi|Hello|Hey} syntax inside subjects, bodies, or LinkedIn notes. DripX renders a fresh variant per recipient to protect domain reputation.",
    bullets: [
      "Supports nested blocks like {Hi {there|friend}|Hello}",
      "Runs cleanly after {{variable|Fallback}} substitution",
      "Safe around HTML, CSS, and JSON curly braces",
    ],
    interactiveSpintax: true,
  },
  {
    id: "agent",
    label: "AI Agent Workspace",
    icon: Bot,
    heading: "Build sequences and analyze pipeline by prompt",
    description:
      "Connect River AI, OpenRouter, Claude, OpenAI, DeepSeek, Gemini, or custom endpoints via AES-256 encrypted BYOK keys.",
    bullets: [
      "Build, Plan, and Ask modes with human approval cards",
      "Live /models discovery grouped by collapsible providers",
      "Granular owner, admin, and per-member RBAC controls",
    ],
    image: "/feature-cloud-proxy.png",
  },
];

const DEMO_SPINTAX =
  "{Hi|Hello|Hey} Alex, {quick question|wanted to share an idea} about {scaling outbound|improving reply rates} for Acme.";

export default function InteractiveProductTabs() {
  const [activeId, setActiveId] = useState("sequences");
  const [spunText, setSpunText] = useState("Hello Alex, quick question about scaling outbound for Acme.");
  const active = PRODUCT_TABS.find((t) => t.id === activeId) || PRODUCT_TABS[0];

  const handleSpin = () => {
    setSpunText(resolveSpintax(DEMO_SPINTAX));
  };

  return (
    <section id="interactive-product" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-20">
      <div className="max-w-2xl mx-auto text-center mb-10">
        <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] text-slate-900">
          One workspace from prospect list to booked call
        </h2>
        <p className="mt-3 text-base text-slate-600">
          Switch tabs to inspect each core engine or test the live Spintax randomizer.
        </p>
      </div>

      {/* Interactive Tab Bar */}
      <div className="flex flex-wrap justify-center gap-2 mb-10">
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
      <div className="w-full rounded-3xl bg-white p-6 sm:p-10 shadow-ring-card grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        <div className="lg:col-span-5 space-y-4">
          <h3 className="text-2xl font-semibold tracking-tight text-slate-900">{active.heading}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{active.description}</p>
          <ul className="space-y-2.5 text-sm text-slate-700 list-none m-0 p-0">
            {active.bullets.map((bullet) => (
              <li key={bullet} className="flex items-start gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-indigo-400 shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:col-span-7">
          {active.interactiveSpintax ? (
            <div className="rounded-2xl bg-slate-50 p-6 shadow-ring-card space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-500 mb-1.5">Author Template</p>
                <pre className="rounded-xl bg-white p-3.5 text-xs font-mono text-slate-700 whitespace-pre-wrap shadow-ring-card">
                  {DEMO_SPINTAX}
                </pre>
              </div>
              <div className="rounded-xl bg-white p-4 shadow-ring-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold text-emerald-700 mb-1">Rendered Send Variant</p>
                  <p className="text-sm font-medium text-slate-900">{spunText}</p>
                </div>
                <button
                  type="button"
                  onClick={handleSpin}
                  className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-semibold shrink-0 active:scale-95 transition cursor-pointer"
                >
                  <RefreshCw size={12} />
                  Spin Variant
                </button>
              </div>
            </div>
          ) : (
            <div className="rounded-2xl overflow-hidden shadow-ring-card bg-slate-50">
              <Image
                src={active.image}
                alt={active.heading}
                width={780}
                height={460}
                className="w-full h-auto object-cover"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
