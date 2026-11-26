"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

const COMPARISON_ROWS = [
  { name: "LinkedIn Sender Accounts", starter: "1 Account", growth: "3 Accounts", enterprise: "10+ Accounts" },
  { name: "Email Mailboxes + Spintax", starter: "Unlimited", growth: "Unlimited", enterprise: "Unlimited" },
  { name: "Monthly Connection Requests", starter: "500 / mo", growth: "2,000 / mo", enterprise: "Unlimited" },
  { name: "Dedicated Static Residential IP", starter: "1 Static IP", growth: "3 Isolated IPs", enterprise: "Dedicated IP Mesh" },
  { name: "Multi-Channel Fallback Branches", starter: "Basic", growth: "Full Conditional", enterprise: "Custom Workflows" },
  { name: "Team Inbox & Collision Locks", starter: "1 Seat", growth: "3 Seats + Locks", enterprise: "Unlimited + RBAC" },
  { name: "BYOK Multi-Model AI Agent", starter: "Included", growth: "Included", enterprise: "Team RBAC + Audit" },
  { name: "Support SLA", starter: "24h Email", growth: "4h Priority Chat", enterprise: "1h Dedicated CSM" },
];

const PRICING_FAQS = [
  {
    q: "How does the 14-day free trial work?",
    a: "You receive full access to Growth Pro features for 14 days with no credit card required. Connect your senders, test Spintax sequences, and explore the AI Agent immediately.",
  },
  {
    q: "Can I upgrade, downgrade, or cancel anytime?",
    a: "Yes. Plans are flexible month-to-month or annual with zero lock-in contracts and 1-click changes from workspace settings.",
  },
  {
    q: "Do I pay extra per AI model inside DripX?",
    a: "No. DripX lets you plug in your own River AI, OpenRouter, Claude, OpenAI, DeepSeek, or Gemini API keys directly via AES-256 encrypted storage with zero markup.",
  },
  {
    q: "What payment methods do you accept?",
    a: "All major credit/debit cards, Apple Pay, and Google Pay via Stripe, plus ACH and invoicing on Enterprise plans.",
  },
];

export default function PricingComparison() {
  const [openFaq, setOpenFaq] = useState(0);

  return (
    <div className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 space-y-20 pb-20">
      {/* Feature Comparison Table */}
      <div className="w-full">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900">
            Full capability comparison
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Every tier includes 24/7 cloud execution, Spintax randomization, and encrypted credentials.
          </p>
        </div>

        <div className="rounded-2xl bg-white shadow-ring-card overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70">
                <th className="py-3.5 px-5 font-semibold text-slate-900">Capability</th>
                <th className="py-3.5 px-5 font-semibold text-slate-700 text-center">Starter</th>
                <th className="py-3.5 px-5 font-semibold text-indigo-700 bg-indigo-50/40 text-center">Growth Pro</th>
                <th className="py-3.5 px-5 font-semibold text-slate-700 text-center">Enterprise</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 tabular-nums">
              {COMPARISON_ROWS.map((row) => (
                <tr key={row.name} className="hover:bg-slate-50/60 transition-colors">
                  <td className="py-3.5 px-5 font-medium text-slate-900">{row.name}</td>
                  <td className="py-3.5 px-5 text-center text-slate-600">{row.starter}</td>
                  <td className="py-3.5 px-5 text-center bg-indigo-50/20 font-semibold text-slate-900">{row.growth}</td>
                  <td className="py-3.5 px-5 text-center text-slate-600">{row.enterprise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pricing FAQ */}
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900 text-center mb-8">
          Billing questions
        </h2>
        <div className="space-y-2.5">
          {PRICING_FAQS.map((faq, idx) => {
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
    </div>
  );
}
