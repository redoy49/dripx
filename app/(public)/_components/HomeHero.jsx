import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";
import PublicHeroBanner from "@/app/components/public/PublicHeroBanner";
import { BorderBeam } from "@/components/ui/border-beam";

export default function HomeHero() {
  return (
    <PublicHeroBanner
      variant="home"
      bottomSpacing="pb-20"
      title="Cloud outreach built for teams that ship pipeline"
      description="Automate Email and LinkedIn sequences 24/7 from dedicated cloud workers with automatic Spintax rotation, RFC 2822 threading, collision-locked inboxes, and your own AI Agent."
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
        <Link
          href="/register"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-7 py-3 text-sm shadow-ring-elevated active:scale-95 transition"
        >
          <span>Start 14-day free trial</span>
          <ArrowRight size={15} />
        </Link>

        <Link
          href="#interactive-product"
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold px-7 py-3 text-sm shadow-ring-card active:scale-95 transition"
        >
          Explore interactive demo
        </Link>
      </div>

      {/* Compact Verified Trust Strip */}
      <div className="mt-8 flex items-center justify-center gap-3">
        <div className="flex -space-x-2">
          {["JJ", "DR", "SC", "AM"].map((initials, idx) => (
            <span
              key={initials}
              className={`inline-flex h-7 w-7 items-center justify-center rounded-full ring-2 ring-white text-[10px] font-bold text-white ${
                ["bg-indigo-500", "bg-sky-500", "bg-emerald-500", "bg-amber-500"][idx]
              }`}
            >
              {initials}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
          <span className="flex items-center text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={12} className="fill-amber-400 stroke-none" />
            ))}
          </span>
          <span className="tabular-nums">Trusted by 1,200+ B2B revenue teams</span>
        </div>
      </div>

      {/* Framed Product Preview with Scroll Depth & BorderBeam */}
      <div className="scroll-depth-card relative max-w-5xl mx-auto mt-12">
        <div className="relative rounded-2xl sm:rounded-3xl bg-white p-2 sm:p-3 shadow-ring-elevated overflow-hidden">
          <BorderBeam size={280} duration={12} anchor={90} borderWidth={2} colorFrom="#6366f1" colorTo="#38bdf8" />

          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5 mb-2 bg-slate-50/80 rounded-t-xl">
            <div className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[11px] font-mono text-slate-500 bg-white px-3.5 py-0.5 rounded-full shadow-ring-card">
              dripx.io/dashboard/campaigns
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Cloud Worker Online
            </span>
          </div>

          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-slate-900">
            <Image
              src="/hero-dashboard-preview.png"
              alt="DripX Multi-Channel Sequence Engine"
              fill
              priority
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
    </PublicHeroBanner>
  );
}
