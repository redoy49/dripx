"use client";

import { useEffect, useRef, useState } from "react";
import AnimatedNumber from "./AnimatedNumber";

const KPI_METRICS = [
  { target: 4.2, decimals: 1, suffix: "x", label: "Higher reply rate", sub: "Multi-channel vs single channel", color: "text-indigo-600", bar: "bg-indigo-500", pct: 84 },
  { target: 68, decimals: 0, suffix: "%", label: "Average open rate", sub: "Spintax + mailbox ramp-up", color: "text-emerald-600", bar: "bg-emerald-500", pct: 68 },
  { target: 15, decimals: 0, suffix: " hrs", label: "Saved per rep weekly", sub: "Automated cloud follow-ups", color: "text-amber-600", bar: "bg-amber-500", pct: 75 },
  { target: 0.02, decimals: 2, suffix: "%", label: "Account flag rate", sub: "Static residential IP isolation", color: "text-sky-600", bar: "bg-sky-500", pct: 98 },
];

const BENCHMARKS = [
  {
    id: "uptime",
    title: "24/7 Cloud Execution",
    note: "Runs continuously while laptops sleep vs. Chrome tab open",
    swatch: "bg-[#EA6A47]",
    dripxBar: "bg-[#EA6A47]",
    extBar: "bg-[#F4B8A8]",
    dripxPct: 99,
    extPct: 34,
    dripxLabel: "DripX Cloud",
    extLabel: "Browser Extensions",
  },
  {
    id: "deliverability",
    title: "Inbox Placement & Threading",
    note: "Spintax rotation + native RFC 2822 Message-ID chains",
    swatch: "bg-[#059669]",
    dripxBar: "bg-[#059669]",
    extBar: "bg-[#86D6BC]",
    dripxPct: 96,
    extPct: 52,
    dripxLabel: "DripX Cloud",
    extLabel: "Browser Extensions",
  },
  {
    id: "safety",
    title: "Account Safety & IP Isolation",
    note: "Dedicated static residential proxy vs. shared DOM scripts",
    swatch: "bg-[#3B82F6]",
    dripxBar: "bg-[#3B82F6]",
    extBar: "bg-[#9EC2FA]",
    dripxPct: 98,
    extPct: 41,
    dripxLabel: "DripX Cloud",
    extLabel: "Browser Extensions",
  },
];

export default function MetricsAndBenchmark() {
  const benchRef = useRef(null);
  const [inView, setInView] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    const el = benchRef.current;
    if (!el) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const raf = requestAnimationFrame(() => setInView(true));
      return () => cancelAnimationFrame(raf);
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <>
      {/* 1. Live Count-Up KPI Strip */}
      <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="w-full grid grid-cols-2 lg:grid-cols-4 bg-white rounded-2xl shadow-ring-card overflow-hidden">
          {KPI_METRICS.map((m, idx) => (
            <div
              key={m.label}
              className={`group p-6 sm:p-7 transition-colors hover:bg-slate-50/70 ${
                idx < 3 ? "lg:border-r border-slate-200/70" : ""
              } ${idx < 2 ? "border-b lg:border-b-0 border-slate-200/70" : ""}`}
            >
              <p className={`text-3xl sm:text-4xl font-bold tracking-tight ${m.color}`}>
                <AnimatedNumber target={m.target} decimals={m.decimals} suffix={m.suffix} />
              </p>
              <p className="mt-2 text-sm font-semibold text-slate-900">{m.label}</p>
              <p className="mt-1 text-xs text-slate-500">{m.sub}</p>
              <div className="mt-4 h-1 w-full rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${m.bar}`}
                  style={{ width: inView ? `${m.pct}%` : "18%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. Architectural Benchmark Chart (DripX Cloud vs Browser Extensions) */}
      <section ref={benchRef} className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-[-0.025em] leading-[1.12] text-slate-900">
            DripX Cloud vs. Browser Extensions
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600">
            Measured reliability across continuous execution, inbox delivery, and account safety.
          </p>
        </div>

        <div className="w-full border-y border-slate-200/80 bg-white">
          {/* Header Row */}
          <div className="grid grid-cols-12 items-center py-3 text-[11px] font-mono uppercase tracking-wider text-slate-500 border-b border-slate-200/70">
            <span className="col-span-5 sm:col-span-4">Measurement</span>
            <span className="col-span-5 sm:col-span-6">Performance Score</span>
            <span className="col-span-2 text-right">Value</span>
          </div>

          <div className="divide-y divide-slate-200/70">
            {BENCHMARKS.map((row) => {
              const dimmed = hoveredId && hoveredId !== row.id;
              return (
                <div
                  key={row.id}
                  onMouseEnter={() => setHoveredId(row.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className={`py-5 transition-opacity duration-200 ${dimmed ? "opacity-55" : "opacity-100"}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <span className={`h-2.5 w-2.5 rounded-[2px] ${row.swatch}`} />
                      <span className="text-sm sm:text-base font-semibold text-slate-900">{row.title}</span>
                    </div>
                    <span className="text-xs text-slate-500">{row.note}</span>
                  </div>

                  {/* Bar 1: DripX Cloud */}
                  <div className="grid grid-cols-12 items-center gap-2 py-1">
                    <span className="col-span-5 sm:col-span-4 text-xs font-mono text-slate-700">{row.dripxLabel}</span>
                    <div className="col-span-5 sm:col-span-6 h-2.5 bg-slate-100/90 relative overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${row.dripxBar}`}
                        style={{ width: inView ? `${row.dripxPct}%` : "0%" }}
                      />
                    </div>
                    <span className="col-span-2 text-right text-xs sm:text-sm font-mono font-bold text-slate-900">
                      <AnimatedNumber target={row.dripxPct} suffix="%" />
                    </span>
                  </div>

                  {/* Bar 2: Browser Extensions */}
                  <div className="grid grid-cols-12 items-center gap-2 py-1 mt-1">
                    <span className="col-span-5 sm:col-span-4 text-xs font-mono text-slate-500">{row.extLabel}</span>
                    <div className="col-span-5 sm:col-span-6 h-2.5 bg-slate-100/90 relative overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${row.extBar}`}
                        style={{ width: inView ? `${row.extPct}%` : "0%" }}
                      />
                    </div>
                    <span className="col-span-2 text-right text-xs sm:text-sm font-mono font-semibold text-slate-500">
                      <AnimatedNumber target={row.extPct} suffix="%" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Axis Scale Footer */}
          <div className="grid grid-cols-12 items-center py-2.5 border-t border-slate-100 text-[11px] font-mono text-slate-400">
            <span className="col-span-5 sm:col-span-4" />
            <div className="col-span-5 sm:col-span-6 flex justify-between">
              <span>0</span><span>25</span><span>50</span><span>75</span><span>100%</span>
            </div>
            <span className="col-span-2" />
          </div>
        </div>
      </section>
    </>
  );
}
