import Link from "next/link";
import {
  Layers,
  Mail,
  Inbox,
  Shield,
  Check,
  ArrowRight,
  Sparkles,
  Zap,
  Globe,
  Database,
  Lock,
  BarChart3,
  RefreshCw,
  Cpu,
  UserCheck,
} from "lucide-react";

export const metadata = {
  title: "Features & Architecture | DripX Cloud Outbound",
  description:
    "Explore the DripX cloud sequence engine, dedicated residential IP proxies, cold email deliverability tools, and unified team inbox.",
};

export default function FeaturesPage() {
  return (
    <div className="pt-28 pb-20">
      {/* Header */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs mb-4">
          <Sparkles size={13} className="text-indigo-500" />
          <span>Next-Generation Cloud Architecture</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Engineered for Multi-Channel Outreach at Scale
        </h1>

        <p className="mt-5 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          Say goodbye to fragile Chrome extensions. DripX combines 24/7 cloud execution, dedicated residential IPs, mailbox rotation, and collision-proof inboxes.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link
            href="/register"
            className="w-full sm:w-auto rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-bold px-7 py-3 text-sm shadow-sm active:scale-95 transition cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <span>Start 14-Day Free Trial</span>
            <ArrowRight size={15} className="stroke-[2.5]" />
          </Link>
          <Link
            href="/pricing"
            className="w-full sm:w-auto rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3 text-sm shadow-2xs active:scale-95 transition cursor-pointer"
          >
            View Pricing Plans
          </Link>
        </div>
      </section>

      {/* 4 CORE ARCHITECTURE DEEP DIVES */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-20 space-y-20">
        {/* Deep Dive 1: Multi-Channel Sequence Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/60 shadow-2xs mb-3">
              <Layers size={13} className="text-indigo-500" />
              <span>Multi-Channel Sequence Engine</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Synchronize LinkedIn & Cold Email with Intelligent Conditional Logic
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              Why rely on a single channel when high-value prospects move between their inbox and LinkedIn feed? DripX lets you design intelligent workflows that adapt based on prospect engagement.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-700 list-none m-0 p-0">
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-indigo-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  <strong>Visual Branching:</strong> Trigger actions based on profile visits, connection acceptance, or unread emails.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-indigo-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  <strong>Humanized Jitter:</strong> Randomize wait times between 180s and 600s so your activity looks completely natural.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-indigo-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  <strong>Smart Timezone Scheduling:</strong> Outreach only triggers within 9:00 AM – 5:00 PM in the prospect&apos;s local timezone.
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs font-mono text-gray-500">
                <span>WORKFLOW CANVAS // SEQUENCE #04</span>
                <span className="text-emerald-600 font-bold">● ONLINE</span>
              </div>
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80">
                  <div className="text-indigo-600 font-bold mb-1">STEP 01: PROFILE_VIEW</div>
                  <div className="text-gray-600">Action: View profile with genuine desktop user-agent</div>
                </div>
                <div className="text-center text-gray-300 font-bold">↓ delay 4h randomized</div>
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80">
                  <div className="text-indigo-600 font-bold mb-1">STEP 02: INVITE_WITH_NOTE</div>
                  <div className="text-gray-600">Payload: &quot;Hey &#123;&#123;first_name&#125;&#125;, impressed by &#123;&#123;company&#125;&#125;&apos;s growth...&quot;</div>
                </div>
                <div className="text-center text-gray-300 font-bold">↓ check acceptance condition (timeout: 72h)</div>
                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200">
                  <div className="text-indigo-700 font-bold mb-1">STEP 03: IF_NOT_ACCEPTED → COLD_EMAIL_FALLBACK</div>
                  <div className="text-gray-600">Send personalized email from secondary domain: sales@try-dripx.com</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Dive 2: Bulletproof Cold Email Deliverability */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs font-mono text-gray-500">
                <span>DELIVERABILITY MONITOR // MAILBOX ROTATION</span>
                <span className="text-emerald-600 font-bold">99.4% INBOX</span>
              </div>
              <div className="mt-4 space-y-3 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200/80">
                  <div>
                    <p className="font-bold text-gray-900">alex@dripx-growth.com</p>
                    <p className="text-gray-500 text-[11px]">Google Workspace · Warm-up Day 28</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                    40/40 sent today
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-200/80">
                  <div>
                    <p className="font-bold text-gray-900">alex@dripx-sales.io</p>
                    <p className="text-gray-500 text-[11px]">Microsoft 365 · Warm-up Day 14</p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200">
                    25/25 sent today
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50/40 border border-emerald-200 text-emerald-900 text-[11px]">
                  <strong>✓ DNS Protocol Status:</strong> SPF Pass · DKIM 2048-bit Valid · DMARC Enforced
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-2xs mb-3">
              <Mail size={13} className="text-emerald-600" />
              <span>Deliverability & Mailbox Rotation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Bulletproof Cold Email Deliverability with Automated Warm-Up
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              Never let email deliverability kill your pipeline. DripX automatically rotates outreach volume across multiple mailboxes and domains while continuously auditing SPF, DKIM, and DMARC health.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-700 list-none m-0 p-0">
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  <strong>Multi-Mailbox Rotation:</strong> Distribute campaign sends across Google Workspace and Microsoft 365 inboxes.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  <strong>Automated Ramp-up Engine:</strong> Gradually escalates sending limits from 5/day up to 40/day to build sender reputation.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-emerald-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  <strong>Tracking Domain Isolation:</strong> Custom CNAME tracking links ensure your primary business domain is never compromised.
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Deep Dive 3: Unified Omni-Channel Inbox with Collision Locks */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 shadow-2xs mb-3">
              <Inbox size={13} className="text-amber-600" />
              <span>Team Inbox & Collision Locks</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              One Unified Inbox for All Senders with Zero Collision Risk
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              Juggling 10 LinkedIn tabs and multiple Google Inboxes wastes hours and creates embarrassing collision errors where two reps message the same lead. DripX solves this with real-time thread collision locks.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-700 list-none m-0 p-0">
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  <strong>Live Collision Lock:</strong> Threads lock immediately when a rep begins typing, displaying their avatar to prevent duplicate responses.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  <strong>Unified Thread History:</strong> View the entire prospect journey—LinkedIn DMs, InMail, and Cold Email replies—in one single feed.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-amber-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  <strong>1-Click Sentiment Labels:</strong> Quickly tag leads as &quot;Interested&quot;, &quot;Meeting Booked&quot;, or &quot;Not a Fit&quot; and auto-sync to your CRM.
                </span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-6">
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs font-mono text-gray-500">
                <span>INBOX // THREAD #8491</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                  LOCKED BY SARAH C.
                </span>
              </div>
              <div className="mt-4 space-y-3">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80 text-xs">
                  <div className="flex items-center justify-between text-gray-500 text-[11px] mb-1">
                    <span>Prospect: Michael Chang · VP Product @ FinCorp</span>
                    <span>LinkedIn DM · 10m ago</span>
                  </div>
                  <p className="text-gray-800 font-medium">
                    &quot;Hey Sarah, saw your message. Do you have 15 mins this Thursday at 2pm to walk through the cloud setup?&quot;
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-200 text-xs">
                  <p className="text-indigo-900 font-bold flex items-center gap-1.5 mb-1">
                    <UserCheck size={14} className="text-indigo-600" />
                    Sarah Chen is drafting a response...
                  </p>
                  <p className="text-gray-500 text-[11px]">
                    Thread is locked for other reps to avoid double-booking or colliding responses.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deep Dive 4: Anti-Ban Cloud Proxies & Dedicated Residential IPs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-6 order-2 lg:order-1">
            <div className="rounded-2xl border border-gray-200/90 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100 text-xs font-mono text-gray-500">
                <span>ISOLATED CLOUD RUNTIME</span>
                <span className="text-sky-600 font-bold">AWS US-WEST-2</span>
              </div>
              <div className="mt-4 space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80">
                  <span className="text-gray-500 block text-[11px]">Static Residential Proxy</span>
                  <span className="font-mono font-bold text-gray-900 text-sm">
                    73.189.44.12 // Comcast Cable Communications
                  </span>
                  <span className="text-emerald-600 text-[11px] block mt-0.5">
                    ✓ Matches Account Owner City (Seattle, WA)
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gray-50 border border-gray-200/80">
                  <span className="text-gray-500 block text-[11px]">Browser Hardware Emulation</span>
                  <span className="font-mono text-gray-900 text-xs">
                    Canvas, WebGL, AudioContext, Screen Res 1920x1080
                  </span>
                  <span className="text-emerald-600 text-[11px] block mt-0.5">
                    ✓ Zero Headless DOM Flagging
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/60 shadow-2xs mb-3">
              <Shield size={13} className="text-sky-600" />
              <span>Anti-Ban Cloud Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Dedicated Static Residential IPs with Micro-Container Isolation
            </h2>
            <p className="mt-4 text-sm sm:text-base text-gray-600 leading-relaxed">
              LinkedIn easily detects browser extensions that inject rogue scripts or route through suspicious shared datacenter IPs. DripX eliminates this by provisioning dedicated static residential IPs in your account&apos;s home city.
            </p>

            <ul className="mt-6 space-y-3 text-sm text-gray-700 list-none m-0 p-0">
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-sky-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  <strong>Dedicated Residential IP:</strong> Your account never shares an IP with any other user or spam network.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-sky-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  <strong>Hardware Fingerprint Parity:</strong> Emulates exact operating system, GPU vendor, and screen metrics to look identical to a human user.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <Check size={16} className="text-sky-500 shrink-0 mt-0.5" strokeWidth={2.5} />
                <span>
                  <strong>Automatic Circuit Breaker:</strong> If LinkedIn prompts any unexpected challenge, sequences freeze instantly and alert you.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 6 BENTO CARDS: ENTERPRISE CAPABILITIES GRID */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Complete Enterprise Capabilities
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            Everything your revenue team needs to orchestrate predictable pipeline growth.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Bento 1 */}
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Database size={18} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Lead Enrichment & Waterfall Sync</h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Automatically enrich missing work emails, company funding data, and verified phone numbers before executing steps.
            </p>
          </div>

          {/* Bento 2 */}
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <RefreshCw size={18} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Sales Navigator Auto-Sync</h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Paste any saved search URL from LinkedIn Sales Navigator. DripX continuously syncs newly qualifying leads into active sequences.
            </p>
          </div>

          {/* Bento 3 */}
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
              <Zap size={18} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Bi-Directional CRM Sync</h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Native two-way synchronization with HubSpot, Salesforce, and Pipedrive. Log notes, status changes, and meetings automatically.
            </p>
          </div>

          {/* Bento 4 */}
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Lock size={18} />
            </div>
            <h3 className="text-base font-bold text-gray-900">RBAC & Team Permissions</h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Set granular role-based permissions for Admins, SDRs, and External Agency Contractors with full activity audit logging.
            </p>
          </div>

          {/* Bento 5 */}
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Cpu size={18} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Webhooks & REST API</h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Connect DripX into your custom internal dashboards, Zapier, Make, or custom outbound pipelines via robust webhook triggers.
            </p>
          </div>

          {/* Bento 6 */}
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs hover:shadow-md transition">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <BarChart3 size={18} />
            </div>
            <h3 className="text-base font-bold text-gray-900">Cohort Analytics & Attribution</h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Inspect open rates, acceptance rates, and meeting conversions by ICP industry, job title, and message variation.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-28">
        <div className="rounded-3xl border border-gray-200/90 bg-gradient-to-b from-indigo-50/40 to-white p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-2xs">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 tracking-tight">
            Ready to Experience the DripX Cloud Advantage?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-xl mx-auto">
            Get started in under 2 minutes. Free 14-day trial with full Growth Pro features.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-bold px-8 py-3.5 text-sm shadow-sm active:scale-95 transition cursor-pointer"
            >
              Start Free Trial Now
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-800 font-semibold px-7 py-3.5 text-sm shadow-2xs active:scale-95 transition cursor-pointer"
            >
              Talk to Architecture Specialist
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
