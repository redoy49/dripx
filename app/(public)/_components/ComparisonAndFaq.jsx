"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, ChevronDown } from "lucide-react";
import MetricsAndBenchmark from "./MetricsAndBenchmark";

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
      <MetricsAndBenchmark />

      {/* FAQ Accordion */}
      <section id="faq" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <div className="lg:col-span-4">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] leading-[1.12] text-slate-900">
              Frequently asked questions
            </h2>
            <p className="mt-2.5 text-sm sm:text-base text-slate-600 leading-relaxed">
              Answers on cloud execution safety, AI keys, and reply handling.
            </p>
            <Link href="/contact" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
              <span>Ask our team</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="lg:col-span-8 space-y-2.5">
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
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-16">
        <div className="w-full rounded-3xl bg-[linear-gradient(180deg,#eef2ff_0%,#f8fafc_55%,#ffffff_100%)] p-8 sm:p-12 text-center shadow-ring-card">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.03em] text-slate-900 max-w-2xl mx-auto">
            Ready to launch your autonomous outbound engine?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            Start a 14-day free trial with instant cloud setup.
          </p>
          <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3.5">
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
