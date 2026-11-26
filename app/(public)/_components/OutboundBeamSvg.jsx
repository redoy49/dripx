"use client";

const INBOUND_BEAMS = [
  { id: "gmail", d: "M 240 27 L 340 27 Q 356 27 356 43 L 356 68 L 490 68", color: "#EA4335", delay: "0s" },
  { id: "smtp", d: "M 240 109 L 340 109 Q 356 109 356 93 L 356 68 L 490 68", color: "#0284C7", delay: "1.1s" },
  { id: "linkedin", d: "M 960 27 L 860 27 Q 844 27 844 43 L 844 68 L 710 68", color: "#0A66C2", delay: "0.55s" },
  { id: "ai", d: "M 960 109 L 860 109 Q 844 109 844 93 L 844 68 L 710 68", color: "#8B5CF6", delay: "1.65s" },
];

const OUTBOUND_BEAMS = [
  { id: "delivery", d: "M 600 106 L 600 164 L 212 164 Q 196 164 196 180 L 196 214", color: "#9333EA", delay: "0.4s" },
  { id: "routing", d: "M 600 106 L 600 214", color: "#2563EB", delay: "1.0s" },
  { id: "inbox", d: "M 600 106 L 600 164 L 988 164 Q 1004 164 1004 180 L 1004 214", color: "#EA580C", delay: "1.6s" },
];

export default function OutboundBeamSvg({ activeSource, activeCard }) {
  const strokeCls = (active) => (active ? "stroke-[#18181F]" : "stroke-[#D4D4DD]");

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 214"
      fill="none"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 hidden h-[214px] w-full md:block"
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
      <path d="M 240 27 L 340 27 Q 356 27 356 43 L 356 68" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeSource === "gmail")}`} strokeWidth={activeSource === "gmail" ? 1.5 : 1.1} />
      <path d="M 240 109 L 340 109 Q 356 109 356 93 L 356 68" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeSource === "smtp")}`} strokeWidth={activeSource === "smtp" ? 1.5 : 1.1} />
      <path d="M 356 68 L 490 68" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeSource === "gmail" || activeSource === "smtp")}`} strokeWidth={activeSource === "gmail" || activeSource === "smtp" ? 1.5 : 1.1} />

      {/* Right Top (LinkedIn) & Right Bottom (AI Agent) -> Junction -> Center Hub */}
      <path d="M 960 27 L 860 27 Q 844 27 844 43 L 844 68" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeSource === "linkedin")}`} strokeWidth={activeSource === "linkedin" ? 1.5 : 1.1} />
      <path d="M 960 109 L 860 109 Q 844 109 844 93 L 844 68" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeSource === "ai")}`} strokeWidth={activeSource === "ai" ? 1.5 : 1.1} />
      <path d="M 844 68 L 710 68" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeSource === "linkedin" || activeSource === "ai")}`} strokeWidth={activeSource === "linkedin" || activeSource === "ai" ? 1.5 : 1.1} />

      {/* Hub -> Bottom Junction -> 3 Cards */}
      <path d="M 600 106 L 600 164" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(Boolean(activeCard || activeSource))}`} strokeWidth={activeCard || activeSource ? 1.4 : 1.1} />
      <path d="M 600 164 L 212 164 Q 196 164 196 180 L 196 214" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeCard === "delivery")}`} strokeWidth={activeCard === "delivery" ? 1.5 : 1.1} />
      <path d="M 600 164 L 600 214" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeCard === "routing")}`} strokeWidth={activeCard === "routing" ? 1.5 : 1.1} />
      <path d="M 600 164 L 988 164 Q 1004 164 1004 180 L 1004 214" vectorEffect="non-scaling-stroke" className={`transition-colors duration-200 ${strokeCls(activeCard === "inbox")}`} strokeWidth={activeCard === "inbox" ? 1.5 : 1.1} />

      {/* Animated Thin Glowing Data Beams (normalized with pathLength=100) */}
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
      <circle cx="356" cy="68" r="3.5" fill="#ffffff" stroke="#B8B8C6" strokeWidth="1.2" />
      <circle cx="844" cy="68" r="3.5" fill="#ffffff" stroke="#B8B8C6" strokeWidth="1.2" />
      <circle cx="600" cy="164" r="3.5" fill="#ffffff" stroke="#B8B8C6" strokeWidth="1.2" />
    </svg>
  );
}
