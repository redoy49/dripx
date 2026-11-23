"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ChevronDown,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

const TIERS = [
  {
    id: "starter",
    name: "Starter",
    badge: "Solo Founders",
    description: "Essential cloud automation for founders and consultants starting outbound prospecting.",
    monthlyPrice: 39,
    annualPrice: 31,
    ctaText: "Start 14-Day Free Trial",
    ctaHref: "/register?plan=starter",
    highlighted: false,
    features: [
      "1 LinkedIn sender account",
      "500 connection requests / mo",
      "1,000 automated messages / mo",
      "Cloud 24/7 background execution",
      "Dedicated residential IP proxy",
      "Smart humanized delay randomization",
      "Unified 1-seat inbox",
      "Standard email support (24h SLA)",
    ],
  },
  {
    id: "growth",
    name: "Growth Pro",
    badge: "Most Popular",
    description: "Complete multi-channel outreach engine for fast-growing B2B sales teams.",
    monthlyPrice: 79,
    annualPrice: 63,
    ctaText: "Start 14-Day Free Trial",
    ctaHref: "/register?plan=growth",
    highlighted: true,
    features: [
      "3 LinkedIn sender accounts",
      "2,000 connection requests / mo",
      "5,000 automated messages / mo",
      "Multi-channel sequences (LinkedIn + Email)",
      "Dedicated residential IP per account",
      "Smart timezone & reply detection",
      "Team inbox with collision locks",
      "HubSpot & Google Sheets 2-way sync",
      "Priority chat & email support (4h SLA)",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "Agencies & Orgs",
    description: "Unlimited scale, dedicated account mesh, and custom integration workflows.",
    monthlyPrice: 149,
    annualPrice: 119,
    ctaText: "Contact Enterprise Sales",
    ctaHref: "/contact?plan=enterprise",
    highlighted: false,
    features: [
      "10+ LinkedIn sender accounts",
      "Unlimited connection requests & sequences",
      "Unlimited automated messages",
      "Full multi-channel (LinkedIn, Email, InMail)",
      "Enterprise rotating residential IP pool",
      "Custom webhooks & CRM bi-directional sync",
      "Granular RBAC roles & activity audit logs",
      "Dedicated account manager & 99.9% SLA",
    ],
  },
];

const COMPARISON_CATEGORIES = [
  {
    name: "Outreach & Volume Limits",
    features: [
      { name: "LinkedIn Sender Accounts", starter: "1 Account", growth: "3 Accounts", enterprise: "10+ Accounts" },
      { name: "Monthly Connection Requests", starter: "500 / mo", growth: "2,000 / mo", enterprise: "Unlimited" },
      { name: "Monthly Automated DMs", starter: "1,000 / mo", growth: "5,000 / mo", enterprise: "Unlimited" },
      { name: "Cold Email Mailbox Rotation", starter: "—", growth: "3 Mailboxes", enterprise: "Unlimited Mailboxes" },
      { name: "InMail Outreach Engine", starter: "—", growth: "Yes (Add-on)", enterprise: "Included" },
    ],
  },
  {
    name: "Safety & Cloud Infrastructure",
    features: [
      { name: "Dedicated Static Residential IP", starter: "1 Static IP", growth: "3 Isolated IPs", enterprise: "Dedicated IP Mesh" },
      { name: "24/7 Cloud Micro-Container Execution", starter: "Yes", growth: "Yes", enterprise: "Yes" },
      { name: "Humanized Randomized Jitter", starter: "Yes (180s-600s)", growth: "Yes (180s-600s)", enterprise: "Custom Jitter Profile" },
      { name: "Automated Ramp-up Engine", starter: "Standard", growth: "Advanced Dynamic", enterprise: "Custom Ramp Curve" },
      { name: "Prospect Timezone Enforcement", starter: "Yes", growth: "Yes", enterprise: "Yes" },
    ],
  },
  {
    name: "Inbox & Team Collaboration",
    features: [
      { name: "Unified Multi-Account Inbox", starter: "1 Seat", growth: "Team Inbox (3 Seats)", enterprise: "Multi-Team (Unlimited)" },
      { name: "Real-Time Thread Collision Lock", starter: "—", growth: "Yes", enterprise: "Yes" },
      { name: "1-Click Sentiment Classification", starter: "Basic", growth: "AI-Powered", enterprise: "Custom Rules + AI" },
      { name: "Role-Based Access Control (RBAC)", starter: "Owner Only", growth: "Admins & Members", enterprise: "Granular Permissions & Audit" },
    ],
  },
  {
    name: "Integrations & Data",
    features: [
      { name: "CSV & Sales Navigator Import", starter: "Yes", growth: "Yes", enterprise: "Yes" },
      { name: "Google Sheets Auto-Sync", starter: "Yes", growth: "Yes", enterprise: "Yes" },
      { name: "HubSpot CRM 2-Way Sync", starter: "—", growth: "Yes", enterprise: "Yes" },
      { name: "Custom Webhooks & REST API", starter: "—", growth: "Standard Webhooks", enterprise: "Full Bi-directional API" },
    ],
  },
  {
    name: "Support & Services",
    features: [
      { name: "Support Response SLA", starter: "24 Hours (Email)", growth: "4 Hours (Priority Chat)", enterprise: "1 Hour (Dedicated Slack)" },
      { name: "Onboarding & Architecture Setup", starter: "Documentation", growth: "Group Setup Call", enterprise: "Dedicated Technical CSM" },
      { name: "Uptime SLA Guarantee", starter: "99.5%", growth: "99.9%", enterprise: "99.99% Financially Backed" },
    ],
  },
];

const PRICING_FAQS = [
  {
    q: "How does the 14-day free trial work?",
    a: "You get full, unrestricted access to all Growth Pro features for 14 days without entering a credit card. You can connect your sender accounts, build sequences, and start booking meetings immediately.",
  },
  {
    q: "Can I upgrade, downgrade, or cancel anytime?",
    a: "Yes. DripX is month-to-month or annual with zero lock-in contracts. You can upgrade, downgrade, or cancel directly in your workspace settings with 1 click.",
  },
  {
    q: "How does DripX protect my LinkedIn account from bans?",
    a: "Unlike browser extensions that inject code into your browser and share datacenter IP ranges, DripX runs in cloud micro-containers using dedicated static residential IPs in your city with randomized human jitter delays.",
  },
  {
    q: "Do I need to keep my computer or browser open?",
    a: "No! DripX executes 100% in our cloud micro-containers 24/7, even while your laptop is closed, sleeping, or powered off.",
  },
  {
    q: "Can I add more sender accounts later?",
    a: "Yes! You can add additional LinkedIn sender accounts or email mailboxes at any point directly from your workspace dashboard for a prorated flat fee.",
  },
  {
    q: "What payment methods are supported?",
    a: "We accept all major credit and debit cards (Visa, Mastercard, American Express), Apple Pay, and Google Pay through Stripe. Enterprise plans can also pay via ACH or invoice.",
  },
];

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  return (
    <div className="pt-28 pb-20">
      {/* Header */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs mb-4">
          <Sparkles size={13} className="text-indigo-500" />
          <span>Transparent, Value-Driven Pricing</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight max-w-3xl mx-auto">
          Predictable Cloud Pricing for High-Performance Outbound Teams
        </h1>

        <p className="mt-4 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
          Every plan includes 24/7 cloud execution, dedicated static residential IPs, and zero ban risk.
        </p>

        {/* Monthly / Annual Billing Toggle */}
        <div className="mt-8 inline-flex items-center gap-3 p-1 rounded-full border border-gray-200/90 bg-gray-50 shadow-2xs">
          <button
            type="button"
            onClick={() => setIsAnnual(false)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer ${
              !isAnnual
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            Monthly Billing
          </button>

          <button
            type="button"
            onClick={() => setIsAnnual(true)}
            className={`px-4 py-2 rounded-full text-xs sm:text-sm font-semibold transition cursor-pointer flex items-center gap-2 ${
              isAnnual
                ? "bg-white text-gray-900 shadow-2xs"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <span>Annual Billing</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Save 20%
            </span>
          </button>
        </div>
      </section>

      {/* 3 Pricing Cards */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch">
          {TIERS.map((tier) => {
            const price = isAnnual ? tier.annualPrice : tier.monthlyPrice;
            return (
              <div
                key={tier.id}
                className={`rounded-2xl p-7 flex flex-col justify-between transition relative ${
                  tier.highlighted
                    ? "border-2 border-indigo-400 bg-white shadow-md ring-4 ring-indigo-50"
                    : "border border-gray-200/90 bg-white shadow-2xs hover:shadow-sm"
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-xs font-bold bg-indigo-500 text-white shadow-2xs">
                    {tier.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900">{tier.name}</h3>
                    {!tier.highlighted && (
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {tier.badge}
                      </span>
                    )}
                  </div>

                  <p className="mt-2 text-xs text-gray-500 min-h-[34px] leading-relaxed">
                    {tier.description}
                  </p>

                  {/* Price */}
                  <div className="mt-6 flex items-baseline gap-1 pb-6 border-b border-gray-100">
                    <span className="text-4xl sm:text-5xl font-black text-gray-900">
                      ${price}
                    </span>
                    <span className="text-sm font-medium text-gray-500">
                      / month {isAnnual ? "(billed annually)" : ""}
                    </span>
                  </div>

                  {/* Features List */}
                  <ul className="mt-6 space-y-3 text-xs sm:text-sm text-gray-700 list-none m-0 p-0">
                    {tier.features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <Check size={16} className="text-indigo-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* CTA Button */}
                <div className="mt-8 pt-4">
                  <Link
                    href={tier.ctaHref}
                    className={`w-full py-2.5 rounded-full font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5 ${
                      tier.highlighted
                        ? "bg-indigo-400 hover:bg-indigo-500 text-white"
                        : "border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-800 shadow-2xs"
                    }`}
                  >
                    <span>{tier.ctaText}</span>
                    <ArrowRight size={14} className="stroke-[2.5]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Full Feature Comparison Matrix */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Detailed Feature Comparison Matrix
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Compare all outreach capabilities, cloud safety mechanisms, and integrations across tiers.
          </p>
        </div>

        <div className="max-w-6xl mx-auto rounded-2xl border border-gray-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70">
                  <th className="py-4 px-6 text-sm font-bold text-gray-900 w-2/5">
                    Category & Feature
                  </th>
                  <th className="py-4 px-5 text-sm font-bold text-gray-700 w-1/5 text-center">
                    Starter ($39)
                  </th>
                  <th className="py-4 px-5 text-sm font-bold text-indigo-600 bg-indigo-50/40 w-1/5 text-center">
                    Growth Pro ($79)
                  </th>
                  <th className="py-4 px-5 text-sm font-bold text-gray-700 w-1/5 text-center">
                    Enterprise ($149)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs sm:text-sm">
                {COMPARISON_CATEGORIES.map((category, catIdx) => (
                  <tr key={`cat-${catIdx}`} className="contents">
                    {/* Category Header Row */}
                    <tr className="bg-gray-50/90 border-t border-b border-gray-200">
                      <td
                        colSpan={4}
                        className="py-3 px-6 text-xs font-bold uppercase tracking-wider text-gray-700"
                      >
                        {category.name}
                      </td>
                    </tr>
                    {/* Feature Rows */}
                    {category.features.map((item, fIdx) => (
                      <tr key={`feat-${fIdx}`} className="hover:bg-gray-50/40 transition">
                        <td className="py-3.5 px-6 font-medium text-gray-900">
                          {item.name}
                        </td>
                        <td className="py-3.5 px-5 text-center text-gray-600">
                          {item.starter}
                        </td>
                        <td className="py-3.5 px-5 text-center font-semibold text-indigo-900 bg-indigo-50/20">
                          {item.growth}
                        </td>
                        <td className="py-3.5 px-5 text-center text-gray-600">
                          {item.enterprise}
                        </td>
                      </tr>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Pricing FAQs */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Pricing & Plan FAQs
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Have questions about billing, team seats, or our 14-day trial?
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {PRICING_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200/90 bg-white overflow-hidden shadow-2xs transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 font-bold text-gray-900 text-sm sm:text-base hover:bg-gray-50/70 transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={18}
                    className={`text-gray-400 transition-transform duration-200 shrink-0 ${
                      isOpen ? "rotate-180 text-indigo-500" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-6 pb-4 pt-1 text-xs sm:text-sm text-gray-600 leading-relaxed border-t border-gray-100">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Bottom CTA Banner */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="rounded-3xl border border-gray-200/90 bg-gradient-to-b from-indigo-50/40 to-white p-8 sm:p-12 text-center max-w-4xl mx-auto shadow-2xs">
          <h3 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
            Try DripX Free for 14 Days
          </h3>
          <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto">
            Test the cloud sequence engine on your own accounts. No credit card required.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-bold px-7 py-3 text-sm shadow-sm active:scale-95 transition cursor-pointer"
            >
              Start Free Trial Now
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3 text-sm shadow-2xs active:scale-95 transition cursor-pointer"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
