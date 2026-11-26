"use client";

import { useState } from "react";
import Image from "next/image";
import { Server } from "lucide-react";
import OutboundBeamSvg from "./OutboundBeamSvg";
import OutboundChannelCards from "./OutboundChannelCards";

const LEFT_SOURCES = [
  { id: "gmail", label: "Google Gmail", logo: "/brands/gmail.svg", targetCard: "delivery", ring: "ring-rose-200" },
  { id: "smtp", label: "Outlook / SMTP", icon: Server, targetCard: "delivery", ring: "ring-sky-200" },
];

const RIGHT_SOURCES = [
  { id: "linkedin", label: "LinkedIn", logo: "/brands/linkedin.svg", targetCard: "routing", ring: "ring-sky-200" },
  { id: "ai", label: "AI Agent", logo: "/brands/claude.svg", targetCard: "inbox", ring: "ring-indigo-200" },
];

export default function CloudWorkflowSection() {
  const [selectedSource, setSelectedSource] = useState(null);
  const [hoveredSource, setHoveredSource] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);

  const activeSource = hoveredSource ?? selectedSource;
  const derivedCard =
    hoveredCard ||
    [...LEFT_SOURCES, ...RIGHT_SOURCES].find((s) => s.id === activeSource)?.targetCard ||
    null;

  const renderSourceButton = (src) => {
    const selected = selectedSource === src.id;
    const Icon = src.icon;
    return (
      <button
        key={src.id}
        type="button"
        aria-pressed={selected}
        onClick={() => setSelectedSource((prev) => (prev === src.id ? null : src.id))}
        onMouseEnter={() => setHoveredSource(src.id)}
        onMouseLeave={() => setHoveredSource(null)}
        className={`relative z-10 flex h-[54px] w-full items-center justify-center gap-2.5 rounded-[12px] border bg-white px-4 text-sm font-semibold text-[#1E1E24] transition-all duration-200 cursor-pointer ${
          selected
            ? `border-slate-900/30 ring-2 ${src.ring} shadow-[0_10px_24px_-8px_rgba(15,23,42,0.14)]`
            : "border-[#EBEBF0] shadow-[0_4px_14px_-4px_rgba(15,23,42,0.06)] hover:border-[#D4D4DE] hover:shadow-[0_8px_20px_-6px_rgba(15,23,42,0.1)]"
        }`}
      >
        {src.logo ? (
          <Image src={src.logo} alt={src.label} width={20} height={20} className="h-5 w-5 object-contain shrink-0" />
        ) : (
          <Icon size={18} className="text-sky-600 shrink-0" />
        )}
        <span className="tracking-[-0.02em]">{src.label}</span>
      </button>
    );
  };

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="relative w-full overflow-hidden rounded-3xl bg-[#F6F6F8] px-5 py-10 sm:px-9 sm:py-12 lg:px-14 lg:py-14 text-slate-900 shadow-ring-card">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white to-transparent"
        />

        {/* Header */}
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold leading-[1.12] tracking-[-0.025em] text-slate-900">
            One cloud engine for email and LinkedIn
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Routing, Spintax variation, and instant reply locks handled automatically.
          </p>
        </header>

        {/* Interactive Hub + Animated Beam Connectors */}
        <div className="relative mt-9 sm:mt-11">
          <OutboundBeamSvg activeSource={activeSource} activeCard={derivedCard} />

          <div className="relative z-10 grid grid-cols-1 items-center gap-4 md:h-[136px] md:grid-cols-[20%_60%_20%] md:gap-0">
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:justify-between md:gap-7">
              {LEFT_SOURCES.map(renderSourceButton)}
            </div>

            {/* Center Hub Pill */}
            <div className="flex items-center justify-center py-2 md:py-0">
              <div
                className={`rounded-full bg-white/95 border border-white p-[6px] transition-transform duration-200 shadow-[0_18px_36px_-8px_rgba(15,23,42,0.22),0_4px_12px_-2px_rgba(15,23,42,0.1)] ${
                  activeSource ? "scale-[1.03]" : ""
                }`}
              >
                <div className="flex items-center justify-center gap-3 rounded-full px-7 py-3.5 bg-gradient-to-b from-[#2B2B32] via-[#1B1B20] to-[#121216] text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),inset_0_-2px_5px_rgba(0,0,0,0.55)]">
                  <span className="inline-grid grid-cols-2 gap-0.5" aria-hidden="true">
                    <span className="h-1.5 w-1.5 rounded-[2px] bg-white" />
                    <span className="h-1.5 w-1.5 rounded-[2px] bg-white/80" />
                    <span className="h-1.5 w-1.5 rounded-[2px] bg-white/80" />
                    <span className="h-1.5 w-1.5 rounded-[2px] bg-indigo-400" />
                  </span>
                  <span className="text-[18px] font-semibold tracking-[-0.025em] leading-none">
                    DripX Engine
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:justify-between md:gap-7">
              {RIGHT_SOURCES.map(renderSourceButton)}
            </div>
          </div>

          <OutboundChannelCards activeCard={derivedCard} onHoverCard={setHoveredCard} />
        </div>
      </div>
    </section>
  );
}
