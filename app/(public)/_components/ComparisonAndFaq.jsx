"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CheckCircle2, XCircle, ChevronDown } from "lucide-react";

const METRICS = [
  { value: "4.2x", label: "Higher reply rate", sub: "Multi-channel vs single channel", color: "text-indigo-600" },
  { value: "68%", label: "Average open rate", sub: "Spintax + mailbox ramp-up", color: "text-emerald-600" },
  { value: "15 hrs", label: "Saved per rep weekly", sub: "Automated cloud follow-ups", color: "text-amber-600" },
  { value: "0.02%", label: "Account flag rate", sub: "Static residential IP isolation", color: "text-sky-600" },
];

const COMPARISON_ROWS = [
  { cap: "Execution Model", cloud: "24/7 Cloud Micro-Containers", ext: "Local Chrome Tab Must Stay Open" },
  { cap: "IP Isolation", cloud: "Dedicated Static Residential IP", ext: "Shared Datacenter or Home Wi-Fi" },
  { cap: "Email Threading", cloud: "Native RFC 2822 Message-ID Chains", ext: "Broken Subjects / Separate Threads" },
  { cap: "Team Inbox", cloud: "Live Collision Locks + Unified Feed", ext: "Manual Tab Switching Across Reps" },
  { cap: "AI Automation", cloud: "BYOK Multi-Model Agent Workspace", ext: "None or Hardcoded Copy Templates" },
];

const FAQS = [
  {
    q: "How does DripX protect LinkedIn and email accounts?",
    a: "DripX runs server-side in isolated cloud sessions with dedicated residential IPs, randomized humanized delays, and gradual daily mailbox ramp-up limits—never injecting scripts into your browser.",
  },
  {
    q: "Do I need to keep my laptop running?",
    a: "No. Cloud workers run continuously 24/7 inside prospect-local working hours even when your computer is off.",
  },
  {
    q: "Which AI models can I use in the AI Agent Workspace?",
    a: "Connect River AI, OpenRouter, Groq, Vercel AI Gateway, Anthropic, OpenAI, DeepSeek, Google Gemini, or any custom OpenAI/Anthropic-compatible endpoint using your own encrypted API key.",
  },
  {
    q: "What happens when a prospect replies?",
    a: "DripX detects the reply immediately, cancels all remaining automated follow-up jobs for that prospect, and moves the thread into your Unified Inbox.",
  },
];

export default function ComparisonAndFaq() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <>
      {/* Architectural Metrics Strip */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 border border-slate-200/90 bg-white rounded-2xl overflow-hidden">
          {METRICS.map((m, idx) => (
            <div
              key={m.label}
              className={`p-6 sm:p-8 ${idx < 3 ? "lg:border-r border-slate-200/90" : ""} ${
                idx < 2 ? "border-b lg:border-b-0 border-slate-200/90" : ""
              }`}
            >
              <p className={`text-3xl sm:text-4xl font-bold tabular-nums tracking-tight ${m.color}`}>{m.value}</p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{m.label}</p>
              <p className="mt-1 text-xs text-slate-500">{m.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Cloud vs Browser Extensions Table */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-semibold tracking-[-0.025em] text-slate-900">
              DripX Cloud vs. Browser Extensions
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600">
              Built for teams that cannot afford account bans, missed follow-ups, or double-pitched leads.
            </p>
          </div>

          <div className="rounded-2xl bg-white shadow-ring-card overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70">
                  <th className="py-3.5 px-5 font-semibold text-slate-900">Capability</th>
                  <th className="py-3.5 px-5 font-semibold text-indigo-700 bg-indigo-50/40">DripX Cloud</th>
                  <th className="py-3.5 px-5 font-semibold text-slate-500">Extensions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {COMPARISON_ROWS.map((row) => (
                  <tr key={row.cap} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-medium text-slate-900">{row.cap}</td>
                    <td className="py-3.5 px-5 bg-indigo-50/20 text-slate-900 font-medium">
                      <span className="inline-flex items-center gap-2">
                        <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                        {row.cloud}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-slate-500">
                      <span className="inline-flex items-center gap-2">
                        <XCircle size={15} className="text-rose-400 shrink-0" />
                        {row.ext}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section id="faq" className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-semibold tracking-[-0.025em] text-slate-900 text-center mb-10">
            Frequently asked questions
          </h2>
          <div className="space-y-2.5">
            {FAQS.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={faq.q} className="rounded-2xl bg-white shadow-ring-card overflow-hidden">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 font-semibold text-slate-900 text-sm sm:text-base hover:bg-slate-50/60 transition cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown size={17} className={`text-slate-400 transition-transform ${isOpen ? "rotate-180 text-indigo-600" : ""}`} />
                  </button>
                  {isOpen && <p className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">{faq.a}</p>}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Bottom Atmospheric CTA */}
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-20">
        <div className="max-w-5xl mx-auto rounded-3xl bg-[linear-gradient(180deg,#eef2ff_0%,#f8fafc_55%,#ffffff_100%)] p-8 sm:p-14 text-center shadow-ring-card">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-slate-900 max-w-2xl mx-auto">
            Ready to launch your autonomous outbound engine?
          </h2>
          <p className="mt-4 text-base text-slate-600 max-w-xl mx-auto">
            Start with a 14-day free trial—no credit card required, instant cloud setup.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-semibold px-8 py-3 text-sm shadow-ring-elevated active:scale-95 transition"
            >
              <span>Start 14-day free trial</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold px-7 py-3 text-sm shadow-ring-card active:scale-95 transition"
            >
              Talk to sales
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
