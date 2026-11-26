"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck } from "lucide-react";
import PublicHeroBanner from "@/app/components/public/PublicHeroBanner";
import PricingComparison from "./PricingComparison";

const TIERS = [
  {
    id: "starter",
    name: "Starter",
    badge: "Solo Founders",
    description: "Cloud automation for founders and consultants starting consistent outbound.",
    monthlyPrice: 39,
    annualPrice: 31,
    ctaText: "Start 14-day free trial",
    ctaHref: "/register?plan=starter",
    highlighted: false,
    features: [
      "1 LinkedIn sender + unlimited email accounts",
      "500 connection requests & 1,000 DMs / mo",
      "Dedicated residential IP proxy",
      "Spintax & RFC 2822 email threading",
      "BYOK AI Agent Workspace",
    ],
  },
  {
    id: "growth",
    name: "Growth Pro",
    badge: "Most Popular",
    description: "Complete multi-channel engine and collision-locked team inbox for B2B sales teams.",
    monthlyPrice: 79,
    annualPrice: 63,
    ctaText: "Start 14-day free trial",
    ctaHref: "/register?plan=growth",
    highlighted: true,
    features: [
      "3 LinkedIn senders + unlimited email accounts",
      "2,000 connection requests & 5,000 DMs / mo",
      "LinkedIn + Email conditional branching",
      "Team inbox with real-time collision locks",
      "Priority chat & email support (4h SLA)",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "Agencies & Orgs",
    description: "High-volume outreach with rotating residential IP pools, RBAC, and dedicated onboarding.",
    monthlyPrice: 149,
    annualPrice: 119,
    ctaText: "Contact sales",
    ctaHref: "/contact?plan=enterprise",
    highlighted: false,
    features: [
      "10+ LinkedIn sender accounts",
      "Unlimited connection requests & sequences",
      "Enterprise rotating residential IP pool",
      "Granular team RBAC & AI Agent permissions",
      "Dedicated CSM & 99.9% uptime SLA",
    ],
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(true);

  return (
    <div className="bg-white text-slate-900 overflow-x-clip">
      <PublicHeroBanner
        variant="pricing"
        title="Predictable cloud pricing without per-mailbox penalties"
        description="Every plan includes 24/7 cloud execution, Spintax deliverability rotation, and encrypted BYOK AI access."
      >
        <div className="inline-flex items-center gap-1 p-1 rounded-full bg-white shadow-ring-card">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
              !isAnnual ? "bg-indigo-400 hover:bg-indigo-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Monthly
          </button>
          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer inline-flex items-center gap-2 ${
              isAnnual ? "bg-indigo-400 hover:bg-indigo-500 text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Annual</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isAnnual ? "bg-white/20 text-white" : "bg-emerald-50 text-emerald-700"}`}>
              Save 20%
            </span>
          </button>
        </div>
      </PublicHeroBanner>

      {/* Tier Cards */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full items-stretch">
          {TIERS.map((tier) => {
            const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-7 flex flex-col justify-between bg-white relative transition ${
                  tier.highlighted ? "shadow-ring-elevated" : "shadow-ring-card"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">{tier.name}</h2>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        tier.highlighted ? "bg-indigo-50 text-indigo-700" : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {tier.badge}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-600 leading-relaxed min-h-[34px]">{tier.description}</p>

                  <div className="mt-6 pb-6 border-b border-slate-100 flex items-baseline gap-1.5 tabular-nums">
                    <span className="text-4xl sm:text-5xl font-bold tracking-tight text-slate-900">${price}</span>
                    <span className="text-xs sm:text-sm text-slate-500">/ mo {isAnnual ? "billed annually" : ""}</span>
                  </div>

                  <ul className="mt-6 space-y-3 text-sm text-slate-700 list-none m-0 p-0">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2.5">
                        <Check size={16} className="text-indigo-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href={tier.ctaHref}
                  className={`mt-8 w-full text-center rounded-full py-3 px-5 text-sm font-semibold transition active:scale-95 ${
                    tier.highlighted
                      ? "bg-indigo-400 hover:bg-indigo-500 text-white shadow-ring-elevated"
                      : "bg-slate-900 hover:bg-slate-800 text-white"
                  }`}
                >
                  {tier.ctaText}
                </Link>
              </div>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-slate-500 inline-flex items-center justify-center gap-1.5 w-full">
          <ShieldCheck size={14} className="text-emerald-600" />
          14-day free trial on all plans &middot; Cancel in 1 click anytime
        </p>
      </section>

      <PricingComparison />
    </div>
  );
}
