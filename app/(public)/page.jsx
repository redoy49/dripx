"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  Shield,
  Zap,
  Clock,
  Inbox,
  ChevronDown,
  Sparkles,
  Layers,
} from "lucide-react";
import { Hero195 } from "@/components/ui/hero-195";
import { ScrollReveal } from "@/components/ui/scroll-reveal";

export default function HomePage() {
  const [openFaq, setOpenFaq] = useState(0);

  const faqs = [
    {
      q: "How does DripX protect my LinkedIn account from bans?",
      a: "Unlike browser extensions that execute scripts inside your local Chrome browser and leak automated DOM signatures, DripX operates entirely server-side. Each connected account is assigned a dedicated, static residential IP proxy matching your home city, along with humanized randomized delays (180s–600s) and automatic warm-up limits.",
    },
    {
      q: "Do I need to keep my computer or browser tab open?",
      a: "No! DripX is 100% cloud-native. Your sequences execute continuously inside our isolated cloud micro-containers 24/7, even when your computer is shut down, you are offline, or you are traveling across timezones.",
    },
    {
      q: "Can I combine LinkedIn actions with Cold Email follow-ups?",
      a: "Yes. DripX is built for true multi-channel prospecting. You can define conditional branches: for example, if a prospect does not accept your LinkedIn connection within 3 days, DripX automatically falls back to sending a personalized cold email from your connected Google Workspace or Microsoft 365 mailbox.",
    },
    {
      q: "How does the team inbox prevent collision between reps?",
      a: "When a team member opens a conversation or begins typing a reply, DripX instantly locks the thread and displays a live presence indicator to teammates. This guarantees two reps never embarrassingly pitch the same prospect twice.",
    },
    {
      q: "How does the 14-day free trial work?",
      a: "You get full, unrestricted access to all Growth Pro features for 14 days without entering a credit card. You can connect your sender accounts, build sequences, and start booking meetings immediately.",
    },
    {
      q: "What happens when a prospect replies to my outreach?",
      a: "DripX automatically pauses all subsequent follow-up steps for that prospect so they never receive an awkward automated message after replying. The message lands in your Unified Inbox with real-time sentiment classification.",
    },
  ];

  return (
    <div className="pt-20 pb-16 overflow-hidden bg-white">
      {/* 1. HERO SECTION (HERO-195 WITH ACCENT SERIF ITALIC, PILL CTA, OVERLAPPING AVATARS & BORDER BEAM) */}
      <Hero195
        titleLine1="Building bold brands"
        titleLine2Normal="with"
        titleLine2Italic="thoughtful design"
        description="At DripX, we help modern startups tackle the world's biggest prospecting challenges with tailored multi-channel sequences, guiding you from strategy to success in a competitive market."
        ctaText="Get Started"
        ctaHref="/register"
        trustedCount="Trusted by 1000+ clients"
        marqueeHeading="Loved by 1000+ big and small brands around the world"
      />

      {/* 2. BENTO GRID FEATURE SHOWCASE (SCROLL REVEALED) */}
      <ScrollReveal className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs mb-3">
            <Zap size={13} className="text-indigo-500" />
            <span>Option 2 Engine Highlights</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Engineered for High-Ticket B2B Outbound Without Compromise
          </h2>
          <p className="mt-4 text-base sm:text-lg text-gray-600 leading-relaxed">
            Every feature is purpose-built to maximize deliverability, protect sender domains, and turn cold prospects into qualified pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Card 1: Multi-Channel Sequencing (span 7) */}
          <div className="lg:col-span-7 rounded-2xl border border-gray-200/90 bg-white p-8 shadow-2xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-5 border border-indigo-100">
                <Layers size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Synchronized Multi-Channel Sequence Engine
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Combine LinkedIn profile views, connection requests, and InMail with synchronized cold email sequences. If a prospect connects on LinkedIn, nurture them via direct message; if they do not reply after 3 days, DripX triggers an automatic cold email fallback.
              </p>
            </div>

            <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs bg-white">
              <Image
                src="/feature-multichannel.png"
                alt="Multi-Channel Sequence Engine Preview"
                width={780}
                height={460}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Card 2: Unified Inbox with Collision Locks (span 5) */}
          <div className="lg:col-span-5 rounded-2xl border border-gray-200/90 bg-white p-8 shadow-2xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-5 border border-emerald-100">
                <Inbox size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Unified Inbox with Collision Locks
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Manage messages from all sender accounts and email domains in one consolidated workspace. Live collision detection locks threads while a rep is typing, preventing embarrassing duplicate messages.
              </p>
            </div>

            <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs bg-white">
              <Image
                src="/feature-unified-inbox.png"
                alt="Unified Inbox Preview"
                width={780}
                height={460}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>

          {/* Card 3: Smart Timezone Detection (span 5) */}
          <div className="lg:col-span-5 rounded-2xl border border-gray-200/90 bg-white p-8 shadow-2xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-5 border border-amber-100">
                <Clock size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Smart Prospect Timezone Delivery
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Never ping a prospect at 2:00 AM on Sunday. DripX auto-detects each prospect&apos;s geographical timezone and delivers messages strictly between 9:00 AM and 5:00 PM local business hours.
              </p>
            </div>

            <div className="mt-6 p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 text-xs text-amber-900 space-y-2">
              <div className="flex items-center justify-between font-bold">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                  Dhaka &rarr; New York &rarr; London
                </span>
                <span className="text-[11px] font-mono text-amber-700">Auto-DST Sync</span>
              </div>
              <p className="text-[11px] text-amber-800 leading-snug">
                Queued jobs hold their position and automatically release when the recipient&apos;s local business window opens.
              </p>
            </div>
          </div>

          {/* Card 4: Anti-Ban Cloud Proxies (span 7) */}
          <div className="lg:col-span-7 rounded-2xl border border-gray-200/90 bg-white p-8 shadow-2xs hover:shadow-md transition flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-5 border border-sky-100">
                <Shield size={20} />
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                Anti-Ban Cloud Proxies & Dedicated Residential IPs
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Each connected account runs inside an isolated micro-container paired with a static residential IP in your user&apos;s city. Zero browser extensions injecting detectable JavaScript into LinkedIn DOM.
              </p>
            </div>

            <div className="mt-6 rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs bg-white">
              <Image
                src="/feature-cloud-proxy.png"
                alt="Anti-Ban Cloud Proxies Architecture"
                width={780}
                height={460}
                className="w-full h-auto object-cover"
              />
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 3. HOW DRIPX WORKS IN 3 STEPS (SCROLL REVEALED) */}
      <ScrollReveal className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50/60 border-y border-gray-100">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs mb-3">
            <span>Automated Onboarding</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            How DripX Works in 3 Simple Steps
          </h2>
          <p className="mt-4 text-gray-600 text-sm sm:text-base">
            From zero to an automated, multi-channel outbound pipeline in less than 5 minutes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1 */}
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs relative flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-4">
                Step 1 &middot; Connect
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                Connect Accounts & Import Leads
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Connect your LinkedIn accounts and Google/Microsoft mailboxes securely via API tokens. Import prospect lists from CSV or auto-sync directly from LinkedIn Sales Navigator searches.
              </p>
            </div>
            <div className="mt-4 text-xs font-semibold text-indigo-600 flex items-center gap-1">
              <span>Zero browser extensions needed</span>
            </div>
          </div>

          {/* Step 2 */}
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs relative flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80 mb-4">
                Step 2 &middot; Orchestrate
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                Design Multi-Channel Smart Sequences
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                Set up personalized connection notes, humanized delay intervals, and automatic cold email fallbacks using custom variables (first name, company, recent post).
              </p>
            </div>
            <div className="mt-4 text-xs font-semibold text-indigo-600 flex items-center gap-1">
              <span>Humanized delay jitter active</span>
            </div>
          </div>

          {/* Step 3 */}
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs relative flex flex-col justify-between">
            <div>
              <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80 mb-4">
                Step 3 &middot; Convert
              </span>
              <h3 className="text-lg font-bold text-gray-900">
                Sit Back as Deals Fill Your Calendar
              </h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">
                DripX executes campaigns 24/7 in cloud micro-containers while your PC sleeps. When prospects reply, conversation threads appear in your Unified Inbox ready to book.
              </p>
            </div>
            <div className="mt-4 text-xs font-semibold text-emerald-600 flex items-center gap-1">
              <span>Auto-pauses sequence on reply</span>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 4. CLOUD VS EXTENSION COMPARISON TABLE (SCROLL REVEALED) */}
      <ScrollReveal className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 shadow-2xs mb-3">
            <span>Direct Architecture Comparison</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            DripX Cloud vs Traditional Browser Extensions
          </h2>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            See why leading outbound teams are ditching fragile browser extensions for cloud-native infrastructure.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-2xl border border-gray-200/90 bg-white shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/70">
                  <th className="py-4 px-6 text-sm font-bold text-gray-900 w-1/2">
                    Capability / Feature
                  </th>
                  <th className="py-4 px-6 text-sm font-bold text-indigo-600 bg-indigo-50/40 w-1/4">
                    DripX Cloud
                  </th>
                  <th className="py-4 px-6 text-sm font-bold text-gray-500 w-1/4">
                    Browser Extensions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {[
                  {
                    feature: "Execution Model",
                    dripx: "100% Cloud (Runs 24/7 while laptop is off)",
                    legacy: "Local Browser (Requires PC awake & Chrome open)",
                  },
                  {
                    feature: "IP Address Infrastructure",
                    dripx: "Dedicated Static Residential IP per Account",
                    legacy: "Unstable local WiFi or shared datacenter proxy",
                  },
                  {
                    feature: "LinkedIn Ban & Flag Risk",
                    dripx: "0.02% (Humanized jitter & isolated session)",
                    legacy: "High (Script tags detectable in Chrome DOM)",
                  },
                  {
                    feature: "Multi-Account Inbox Management",
                    dripx: "Unified Inbox with Real-Time Collision Locks",
                    legacy: "Endless manual tab switching and profile juggling",
                  },
                  {
                    feature: "Multi-Channel Synchronization",
                    dripx: "Built-in LinkedIn + Email condition fallback",
                    legacy: "LinkedIn only (no email integration)",
                  },
                  {
                    feature: "Computer Performance Impact",
                    dripx: "0% RAM / CPU usage on user machine",
                    legacy: "Severe memory leaks & battery drain",
                  },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50/50 transition">
                    <td className="py-4 px-6 font-medium text-gray-900">
                      {row.feature}
                    </td>
                    <td className="py-4 px-6 bg-indigo-50/20 text-indigo-900 font-semibold">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                        <span>{row.dripx}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-gray-500">
                      <div className="flex items-center gap-2">
                        <XCircle size={16} className="text-rose-400 shrink-0" />
                        <span>{row.legacy}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </ScrollReveal>

      {/* 5. REAL-WORLD ROI METRICS COUNTER (SCROLL REVEALED) */}
      <ScrollReveal className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-20 border-y border-gray-100 bg-white">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="p-6 rounded-2xl border border-gray-200/90 bg-gray-50/50 shadow-2xs">
            <p className="text-4xl sm:text-5xl font-black text-indigo-500">4.2x</p>
            <p className="mt-2 text-sm font-bold text-gray-900">Higher Reply Rate</p>
            <p className="mt-1 text-xs text-gray-500">
              vs. single-channel spray-and-pray
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200/90 bg-gray-50/50 shadow-2xs">
            <p className="text-4xl sm:text-5xl font-black text-emerald-500">68%</p>
            <p className="mt-2 text-sm font-bold text-gray-900">Average Open Rate</p>
            <p className="mt-1 text-xs text-gray-500">
              via mailbox warm-up & SPF/DKIM rotation
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200/90 bg-gray-50/50 shadow-2xs">
            <p className="text-4xl sm:text-5xl font-black text-amber-500">15 hrs</p>
            <p className="mt-2 text-sm font-bold text-gray-900">Saved per Rep / Week</p>
            <p className="mt-1 text-xs text-gray-500">
              by eliminating manual outreach tasks
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-gray-200/90 bg-gray-50/50 shadow-2xs">
            <p className="text-4xl sm:text-5xl font-black text-sky-500">0.02%</p>
            <p className="mt-2 text-sm font-bold text-gray-900">Account Flag Rate</p>
            <p className="mt-1 text-xs text-gray-500">
              vs. 4.8% industry average on extensions
            </p>
          </div>
        </div>
      </ScrollReveal>

      {/* 6. AUTHENTIC TESTIMONIAL CARDS (SCROLL REVEALED) */}
      <ScrollReveal className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs mb-3">
            <span>Customer Success Stories</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Trusted by Top Growth Leaders
          </h2>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            See how high-performing teams generate qualified meetings every single month.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Testimonial 1 */}
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                &quot;We switched 8 SDRs from Chrome extensions to DripX. Our account disconnects dropped to zero, and the multi-channel fallback to cold email brought our meeting booking rate up by 38% in the first 30 days.&quot;
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
              <Image
                src="/avatar_judy.jpg"
                alt="Judy Jackson"
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div>
                <p className="text-sm font-bold text-gray-900">Judy Jackson</p>
                <p className="text-xs text-gray-500">VP Growth @ ScaleFlow</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                &quot;The static residential IP proxy isolation was the game changer for us. We manage 15 client sender accounts across the agency and haven&apos;t received a single verification challenge in 6 months.&quot;
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200">
                DR
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">David Reynolds</p>
                <p className="text-xs text-gray-500">Founder @ Apex Outbound Agency</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1 text-amber-400 mb-4">
                {[...Array(5)].map((_, i) => (
                  <span key={i} className="text-sm">★</span>
                ))}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed italic">
                &quot;The collision lock alone is worth the subscription price. Our sales reps used to double-message the same executives when hot leads came in. Now the thread locks instantly and our CRM stays in sync.&quot;
              </p>
            </div>
            <div className="mt-6 pt-5 border-t border-gray-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 font-bold flex items-center justify-center text-sm border border-emerald-200">
                SC
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Sarah Chen</p>
                <p className="text-xs text-gray-500">Head of Sales @ CloudMetrics</p>
              </div>
            </div>
          </div>
        </div>
      </ScrollReveal>

      {/* 7. INTERACTIVE FAQ ACCORDION (SCROLL REVEALED) */}
      <ScrollReveal className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gray-50/50 border-t border-gray-100">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200/80 shadow-2xs mb-3">
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-gray-600 text-sm sm:text-base">
            Everything you need to know about DripX cloud architecture, safety, and billing.
          </p>
        </div>

        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-gray-200/90 bg-white overflow-hidden shadow-2xs transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full text-left px-6 py-4.5 flex items-center justify-between gap-4 font-bold text-gray-900 text-base hover:bg-gray-50/70 transition cursor-pointer"
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
                  <div className="px-6 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-100/70 animate-in fade-in duration-150">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </ScrollReveal>

      {/* 8. HIGH-CONVERSION BOTTOM CTA BANNER (SCROLL REVEALED) */}
      <ScrollReveal className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="rounded-3xl border border-gray-200/90 bg-gradient-to-b from-indigo-50/40 via-white to-white p-8 sm:p-14 text-center max-w-5xl mx-auto shadow-sm">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 mb-6">
            <Sparkles size={13} />
            <span>Start Prospecting Today</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-extrabold text-gray-900 tracking-tight max-w-2xl mx-auto">
            Ready to Build an Autonomous Cloud Outbound Engine?
          </h2>

          <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-xl mx-auto leading-relaxed">
            Join 1,200+ founders and sales leaders using DripX to generate high-intent meetings without fear of account restrictions.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 text-base shadow-sm active:scale-95 transition cursor-pointer inline-flex items-center justify-center gap-2"
            >
              <span>Start 14-Day Free Trial</span>
              <ArrowRight size={16} className="stroke-[2.5]" />
            </Link>

            <Link
              href="/contact"
              className="w-full sm:w-auto rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-800 font-semibold px-7 py-3.5 text-base shadow-2xs active:scale-95 transition cursor-pointer"
            >
              Book a Custom Demo
            </Link>
          </div>

          <p className="mt-5 text-xs text-gray-500">
            No credit card required · Instant cloud setup · Cancel anytime in 1 click
          </p>
        </div>
      </ScrollReveal>
    </div>
  );
}
