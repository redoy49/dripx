"use client";

const INBOUND_BEAMS = [
  { id: "gmail", d: "M 216 22 L 340 22 Q 356 22 356 38 L 356 58 L 510 58", color: "#EA4335", delay: "0s" },
  { id: "smtp", d: "M 216 94 L 340 94 Q 356 94 356 78 L 356 58 L 510 58", color: "#0284C7", delay: "1.1s" },
  { id: "linkedin", d: "M 984 22 L 860 22 Q 844 22 844 38 L 844 58 L 690 58", color: "#0A66C2", delay: "0.55s" },
  { id: "ai", d: "M 984 94 L 860 94 Q 844 94 844 78 L 844 58 L 690 58", color: "#8B5CF6", delay: "1.65s" },
];

const OUTBOUND_BEAMS = [
  { id: "delivery", d: "M 600 84 L 600 138 L 208 138 Q 192 138 192 154 L 192 184", color: "#9333EA", delay: "0.4s" },
  { id: "routing", d: "M 600 84 L 600 184", color: "#2563EB", delay: "1.0s" },
  { id: "inbox", d: "M 600 84 L 600 138 L 992 138 Q 1008 138 1008 154 L 1008 184", color: "#EA580C", delay: "1.6s" },
];

export default function OutboundBeamSvg({ activeSource, activeCard }) {
  const strokeCls = (active) => (active ? "stroke-slate-900" : "stroke-slate-200");

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 184"
      fill="none"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 hidden h-[184px] w-full md:block"
    >
      <defs>
        <filter id="dripx-beam-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Left Top (Gmail) & Left Bottom (SMTP) -> Junction -> Center Hub */}
      <path d="M 216 22 L 340 22 Q 356 22 356 38 L 356 58" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeSource === "gmail")}`} strokeWidth={activeSource === "gmail" ? 1.5 : 1.1} />
      <path d="M 216 94 L 340 94 Q 356 94 356 78 L 356 58" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeSource === "smtp")}`} strokeWidth={activeSource === "smtp" ? 1.5 : 1.1} />
      <path d="M 356 58 L 510 58" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeSource === "gmail" || activeSource === "smtp")}`} strokeWidth={activeSource === "gmail" || activeSource === "smtp" ? 1.5 : 1.1} />

      {/* Right Top (LinkedIn) & Right Bottom (AI Agent) -> Junction -> Center Hub */}
      <path d="M 984 22 L 860 22 Q 844 22 844 38 L 844 58" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeSource === "linkedin")}`} strokeWidth={activeSource === "linkedin" ? 1.5 : 1.1} />
      <path d="M 984 94 L 860 94 Q 844 94 844 78 L 844 58" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeSource === "ai")}`} strokeWidth={activeSource === "ai" ? 1.5 : 1.1} />
      <path d="M 844 58 L 690 58" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeSource === "linkedin" || activeSource === "ai")}`} strokeWidth={activeSource === "linkedin" || activeSource === "ai" ? 1.5 : 1.1} />

      {/* Hub -> Bottom Junction -> 3 Cards */}
      <path d="M 600 84 L 600 138" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(Boolean(activeCard || activeSource))}`} strokeWidth={activeCard || activeSource ? 1.4 : 1.1} />
      <path d="M 600 138 L 208 138 Q 192 138 192 154 L 192 184" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeCard === "delivery")}`} strokeWidth={activeCard === "delivery" ? 1.5 : 1.1} />
      <path d="M 600 138 L 600 184" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeCard === "routing")}`} strokeWidth={activeCard === "routing" ? 1.5 : 1.1} />
      <path d="M 600 138 L 992 138 Q 1008 138 1008 154 L 1008 184" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeCard === "inbox")}`} strokeWidth={activeCard === "inbox" ? 1.5 : 1.1} />

      {/* Animated Thin Glowing Data Beams */}
      {[...INBOUND_BEAMS, ...OUTBOUND_BEAMS].map((beam) => (
        <path
          key={beam.id}
          d={beam.d}
          pathLength={100}
          vectorEffect="non-scaling-stroke"
          stroke={beam.color}
          strokeWidth="1.2"
          strokeLinecap="round"
          filter="url(#dripx-beam-glow)"
          className="beam-pulse-path"
          style={{ animationDelay: beam.delay }}
        />
      ))}

      {/* Junction Nodes */}
      <circle cx="356" cy="58" r="3" fill="#ffffff" stroke="#CBD5E1" strokeWidth="1.2" />
      <circle cx="844" cy="58" r="3" fill="#ffffff" stroke="#CBD5E1" strokeWidth="1.2" />
      <circle cx="600" cy="138" r="3" fill="#ffffff" stroke="#CBD5E1" strokeWidth="1.2" />
    </svg>
  );
}
