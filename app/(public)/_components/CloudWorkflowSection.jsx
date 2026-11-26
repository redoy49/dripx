"use client";

import { useState } from "react";
import Image from "next/image";
import { Mail } from "lucide-react";
import OutboundBeamSvg from "./OutboundBeamSvg";
import OutboundChannelCards from "./OutboundChannelCards";

const LEFT_SOURCES = [
  { id: "gmail", label: "Google Gmail", logo: "/brands/gmail.svg", targetCard: "delivery", ring: "ring-rose-200" },
  { id: "smtp", label: "Outlook / SMTP", icon: Mail, targetCard: "delivery", ring: "ring-sky-200" },
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
        className={`relative z-10 flex h-11 w-full items-center justify-center gap-2 rounded-full border bg-white px-3.5 text-xs sm:text-sm font-semibold text-slate-900 transition-all duration-200 cursor-pointer ${
          selected
            ? `border-slate-900/25 ring-2 ${src.ring} shadow-ring-elevated`
            : "border-slate-200/90 shadow-ring-card hover:border-slate-300"
        }`}
      >
        {src.logo ? (
          <Image src={src.logo} alt={src.label} width={18} height={18} className="h-[18px] w-[18px] object-contain shrink-0" />
        ) : (
          <Icon size={16} className="text-[#0078D4] shrink-0" />
        )}
        <span className="tracking-[-0.01em] truncate">{src.label}</span>
      </button>
    );
  };

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <div className="relative w-full text-slate-900">
        {/* Header */}
        <header className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl font-semibold leading-[1.12] tracking-[-0.025em] text-slate-900">
            One cloud engine for email and LinkedIn
          </h2>
          <p className="mt-2.5 text-sm sm:text-base text-slate-600">
            Routing, Spintax variation, and instant reply locks handled automatically.
          </p>
        </header>

        {/* Interactive Hub + Animated Beam Connectors */}
        <div className="relative mt-8">
          <OutboundBeamSvg activeSource={activeSource} activeCard={derivedCard} />

          <div className="relative z-10 grid grid-cols-1 items-center gap-3 md:h-[116px] md:grid-cols-[18%_64%_18%] md:gap-0">
            <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:justify-between md:gap-6">
              {LEFT_SOURCES.map(renderSourceButton)}
            </div>

            {/* Center Hub Pill (Consistent DripX Styling) */}
            <div className="flex items-center justify-center py-1 md:py-0">
              <div
                className={`inline-flex items-center gap-2.5 rounded-full border border-slate-200 bg-slate-900 px-5 py-2.5 text-white shadow-ring-elevated transition-transform duration-200 ${
                  activeSource ? "scale-[1.03]" : ""
                }`}
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-400 text-xs font-bold text-white">
                  D
                </span>
                <span className="text-sm sm:text-base font-semibold tracking-[-0.02em] leading-none">
                  DripX Engine
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 md:flex md:flex-col md:justify-between md:gap-6">
              {RIGHT_SOURCES.map(renderSourceButton)}
            </div>
          </div>

          <OutboundChannelCards activeCard={derivedCard} onHoverCard={setHoveredCard} />
        </div>
      </div>
    </section>
  );
}
