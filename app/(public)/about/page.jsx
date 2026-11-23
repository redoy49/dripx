import Link from "next/link";
import {
  ShieldCheck,
  Server,
  Sparkles,
  Lock,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Cpu,
  Globe2,
  Users2,
  Award,
} from "lucide-react";

export const metadata = {
  title: "About Us & Engineering Mission | DripX",
  description:
    "Learn about DripX's mission to replace fragile Chrome extension scrapers with enterprise-grade cloud automation, dedicated residential IPs, and account safety.",
};

export default function AboutPage() {
  return (
    <div className="pt-28 pb-20">
      {/* Hero & Mission */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200/70 shadow-2xs mb-4">
          <Sparkles size={13} className="text-indigo-500" />
          <span>Our Engineering Mission</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-gray-900 tracking-tight max-w-4xl mx-auto leading-tight">
          Replacing Fragile Chrome Extensions with Enterprise Cloud Architecture
        </h1>

        <p className="mt-6 text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          For years, B2B sales teams relied on glitchy browser extension scrapers that hijacked Chrome tabs, drained laptop batteries, and triggered account restrictions. We built DripX to provide the reliable, cloud-native foundation outbound sales deserves.
        </p>
      </section>

      {/* The Architectural Shift */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Card 1: The Browser Extension Problem */}
          <div className="rounded-2xl border border-rose-200/80 bg-rose-50/20 p-8 shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xs">
                ✕
              </span>
              <h3 className="text-xl font-bold text-gray-900">
                The Browser Extension Problem
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              Browser extensions run scripts locally inside your personal browser. If your laptop goes to sleep, your Wi-Fi flickers, or you restart your computer, campaigns stall. Worse, LinkedIn regularly audits client-side DOM injections and shared datacenter proxies, leading to sudden account warnings and permanent bans.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-gray-600 list-none m-0 p-0">
              <li className="flex items-center gap-2 text-rose-700">
                <XCircle size={15} className="shrink-0" />
                <span>Laptop must stay open and active 24/7</span>
              </li>
              <li className="flex items-center gap-2 text-rose-700">
                <XCircle size={15} className="shrink-0" />
                <span>Shared datacenter IPs trigger security checkpoints</span>
              </li>
              <li className="flex items-center gap-2 text-rose-700">
                <XCircle size={15} className="shrink-0" />
                <span>Memory leaks slow down your computer</span>
              </li>
            </ul>
          </div>

          {/* Card 2: The DripX Cloud Standard */}
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50/20 p-8 shadow-2xs">
            <div className="flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                ✓
              </span>
              <h3 className="text-xl font-bold text-gray-900">
                The DripX Cloud Standard
              </h3>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed">
              DripX executes all outbound operations in isolated cloud micro-workers with dedicated static residential IP proxies assigned to your specific geographical location. Your sequences run reliably around the clock with zero hardware load, authentic browser hardware emulation, and built-in safety circuit breakers.
            </p>
            <ul className="mt-6 space-y-2.5 text-xs text-gray-600 list-none m-0 p-0">
              <li className="flex items-center gap-2 text-indigo-700">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                <span>Runs 24/7 in cloud micro-containers</span>
              </li>
              <li className="flex items-center gap-2 text-indigo-700">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                <span>Dedicated static residential IP in your home city</span>
              </li>
              <li className="flex items-center gap-2 text-indigo-700">
                <CheckCircle2 size={15} className="shrink-0 text-emerald-500" />
                <span>0% memory or battery consumption on your PC</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Core Engineering Principles */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Our Core Engineering Principles
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-600">
            How we approach building resilient, enterprise-safe outreach systems.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              1. Account Safety Over Vanity Metrics
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              We will never implement dangerous volume spikes or aggressive scraping shortcuts that put your sender accounts at risk. Humanized jitter, ramp-up schedules, and safety circuit breakers are non-negotiable defaults.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Server size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              2. Cloud-First Reliability
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Your outbound pipeline shouldn&apos;t depend on an open Chrome tab on a MacBook. By hosting execution in dedicated cloud containers, outreach runs uninterrupted regardless of your location or device status.
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200/90 bg-white p-7 shadow-2xs">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Cpu size={20} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              3. Radical Simplicity for Sales Teams
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed">
              Enterprise software is often bloated with confusing knobs and multi-week training manuals. We design DripX with clean ergonomics, intuitive drag-and-drop sequencing, and zero unnecessary fluff.
            </p>
          </div>
        </div>
      </section>

      {/* Security & Compliance Stack */}
      <section id="security" className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="rounded-3xl border border-gray-200/90 bg-gray-50/60 p-8 sm:p-14 max-w-5xl mx-auto shadow-2xs">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white text-gray-700 border border-gray-200/80 shadow-2xs mb-3">
              <Lock size={12} className="text-indigo-500" />
              <span>Enterprise Trust Center</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Security & Compliance Built In
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Your prospect lists and account credentials are guarded with bank-grade encryption protocols.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
              <p className="text-base font-bold text-gray-900">AES-256</p>
              <p className="text-xs text-gray-500 mt-1">Data encrypted at rest in isolated DB clusters</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
              <p className="text-base font-bold text-gray-900">TLS 1.3</p>
              <p className="text-xs text-gray-500 mt-1">End-to-end encrypted transport across all APIs</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
              <p className="text-base font-bold text-gray-900">Zero-Knowledge</p>
              <p className="text-xs text-gray-500 mt-1">Hashed session tokens stored in secure HSM vaults</p>
            </div>

            <div className="p-5 rounded-xl bg-white border border-gray-200/80 shadow-2xs">
              <p className="text-base font-bold text-gray-900">GDPR Compliant</p>
              <p className="text-xs text-gray-500 mt-1">1-click data erasure rights & zero data resale</p>
            </div>
          </div>
        </div>
      </section>

      {/* Milestone Stats */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto text-center">
          <div className="p-6 rounded-2xl border border-gray-200/90 bg-white shadow-2xs">
            <p className="text-3xl sm:text-4xl font-extrabold text-indigo-500">1,200+</p>
            <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1">Active Teams</p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-200/90 bg-white shadow-2xs">
            <p className="text-3xl sm:text-4xl font-extrabold text-emerald-500">14.8M+</p>
            <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1">Safe Drip Actions</p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-200/90 bg-white shadow-2xs">
            <p className="text-3xl sm:text-4xl font-extrabold text-sky-500">99.98%</p>
            <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1">Cloud Uptime</p>
          </div>
          <div className="p-6 rounded-2xl border border-gray-200/90 bg-white shadow-2xs">
            <p className="text-3xl sm:text-4xl font-extrabold text-amber-500">0.02%</p>
            <p className="text-xs sm:text-sm font-semibold text-gray-800 mt-1">Flag Rate</p>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-[1536px] mx-auto px-4 sm:px-6 lg:px-8 mt-24">
        <div className="rounded-3xl border border-gray-200/90 bg-gradient-to-b from-indigo-50/40 to-white p-8 sm:p-14 text-center max-w-4xl mx-auto shadow-2xs">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
            Ready to Upgrade Your Outbound Stack?
          </h2>
          <p className="mt-3 text-sm text-gray-600 max-w-md mx-auto">
            Start your 14-day free trial today. See the difference cloud micro-workers make to your pipeline.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/register"
              className="w-full sm:w-auto rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-bold px-7 py-3 text-sm shadow-sm active:scale-95 transition cursor-pointer"
            >
              Start Free Trial
            </Link>
            <Link
              href="/contact"
              className="w-full sm:w-auto rounded-full border border-gray-200/90 bg-white hover:bg-gray-50 text-gray-800 font-semibold px-6 py-3 text-sm shadow-2xs active:scale-95 transition cursor-pointer"
            >
              Contact Team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
