import Link from "next/link";
import { ShieldCheck, Server, Cpu, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import PublicHeroBanner from "@/app/components/public/PublicHeroBanner";

export const metadata = {
  title: "About DripX | Cloud Outbound Architecture",
  description:
    "How DripX replaces fragile Chrome extension scrapers with 24/7 isolated cloud execution, dedicated residential IPs, and encrypted credentials.",
};

const PRINCIPLES = [
  {
    icon: ShieldCheck,
    title: "Account safety over volume spikes",
    desc: "Humanized randomized delays, daily mailbox ramp-up schedules, and automatic reply-pause circuit breakers are built in by default.",
    accent: "text-emerald-600",
  },
  {
    icon: Server,
    title: "Cloud execution without laptop lock-in",
    desc: "Outreach should never pause because a MacBook sleeps or Wi-Fi drops. Isolated cloud workers execute reliably around the clock.",
    accent: "text-indigo-600",
  },
  {
    icon: Cpu,
    title: "Zero-bloat workflows with BYOK AI",
    desc: "Visual React Flow branching paired with your own encrypted OpenRouter, River AI, Claude, OpenAI, or DeepSeek API keys.",
    accent: "text-amber-600",
  },
];

const SECURITY_CONTROLS = [
  { name: "AES-256-GCM", desc: "Sender credentials and AI provider keys encrypted at rest." },
  { name: "TLS 1.3", desc: "End-to-end encrypted transport across APIs and mail connectors." },
  { name: "RBAC Controls", desc: "Owner, admin, and member-level AI Agent & workspace permissions." },
  { name: "GDPR Ready", desc: "Clean data deletion controls with zero prospect list resale." },
];

export default function AboutPage() {
  return (
    <div className="bg-white text-slate-900 overflow-x-clip">
      <PublicHeroBanner
        variant="about"
        title="Replacing fragile browser extensions with resilient cloud execution"
        description="Outbound sales teams deserve reliable 24/7 infrastructure, clean RFC 2822 email deliverability, and strict account protection."
      />

      {/* Architectural Shift */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-4 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div className="rounded-2xl bg-rose-50/35 p-7 sm:p-8 shadow-ring-card">
            <h2 className="text-lg font-semibold text-slate-900">Legacy browser extensions</h2>
            <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
              Local Chrome plugins inject detectable scripts into your browser DOM and halt the moment your laptop closes or restarts.
            </p>
            <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-rose-800 list-none m-0 p-0">
              <li className="flex items-center gap-2"><XCircle size={15} className="shrink-0" /> Laptop must stay open and online</li>
              <li className="flex items-center gap-2"><XCircle size={15} className="shrink-0" /> Shared datacenter IPs trigger checkpoints</li>
              <li className="flex items-center gap-2"><XCircle size={15} className="shrink-0" /> No unified multi-rep collision guard</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-indigo-50/35 p-7 sm:p-8 shadow-ring-elevated">
            <h2 className="text-lg font-semibold text-slate-900">The DripX cloud standard</h2>
            <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
              Cloud workers pair dedicated static residential IPs with native Gmail/SMTP threading, Spintax rotation, and AI triage.
            </p>
            <ul className="mt-5 space-y-2.5 text-xs sm:text-sm text-slate-800 list-none m-0 p-0">
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> Continuous 24/7 cloud scheduling</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> Isolated static residential IP per sender</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={15} className="text-emerald-600 shrink-0" /> Real-time team inbox thread locking</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Core Engineering Principles */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="w-full">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900 text-center mb-10">
            Engineering principles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 rounded-2xl bg-white shadow-ring-card overflow-hidden">
            {PRINCIPLES.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`p-7 ${idx < 2 ? "border-b md:border-b-0 md:border-r border-slate-200/70" : ""}`}>
                  <Icon size={18} className={`${item.accent} mb-3`} />
                  <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Security & Compliance Grid */}
      <section id="security" className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="w-full rounded-3xl bg-slate-50/80 p-8 sm:p-12 shadow-ring-card">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900 text-center">
            Security and credential isolation
          </h2>
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SECURITY_CONTROLS.map((ctrl) => (
              <div key={ctrl.name} className="rounded-xl bg-white p-5 shadow-ring-card">
                <p className="text-sm font-semibold text-slate-900">{ctrl.name}</p>
                <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">{ctrl.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-20">
        <div className="w-full rounded-3xl bg-[linear-gradient(180deg,#fffbeb_0%,#ffffff_100%)] p-8 sm:p-12 text-center shadow-ring-card">
          <h2 className="text-2xl sm:text-3xl font-semibold tracking-[-0.025em] text-slate-900">
            Ready to upgrade your outbound infrastructure?
          </h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-semibold px-7 py-3 text-sm shadow-ring-elevated transition"
            >
              <span>Start free trial</span>
              <ArrowRight size={15} />
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold px-7 py-3 text-sm shadow-ring-card transition"
            >
              Contact team
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
