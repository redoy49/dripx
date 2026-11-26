"use client";

const INBOUND_BEAMS = [
  { id: "gmail", d: "M 184 27 L 250 27 Q 264 27 264 41 L 264 68 L 362 68", color: "#EA4335", delay: "0s" },
  { id: "smtp", d: "M 184 109 L 250 109 Q 264 109 264 95 L 264 68 L 362 68", color: "#0284C7", delay: "0.9s" },
  { id: "linkedin", d: "M 764 27 L 698 27 Q 684 27 684 41 L 684 68 L 586 68", color: "#0A66C2", delay: "0.45s" },
  { id: "ai", d: "M 764 109 L 698 109 Q 684 109 684 95 L 684 68 L 586 68", color: "#8B5CF6", delay: "1.35s" },
];

const OUTBOUND_BEAMS = [
  { id: "delivery", d: "M 474 106 L 474 166 L 166 166 Q 152 166 152 180 L 152 214", color: "#B884EB", delay: "0.6s" },
  { id: "routing", d: "M 474 106 L 474 214", color: "#72A4F5", delay: "1.1s" },
  { id: "inbox", d: "M 474 106 L 474 166 L 782 166 Q 796 166 796 180 L 796 214", color: "#E68D6A", delay: "1.6s" },
];

export default function OutboundBeamSvg({ activeSource, activeCard }) {
  const strokeCls = (active) => (active ? "stroke-[#18181F]" : "stroke-[#DCDCE3]");

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 948 214"
      fill="none"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 hidden h-[214px] w-full md:block"
    >
      {/* Left Top (Gmail) & Left Bottom (SMTP) -> Junction -> Center Hub */}
      <path d="M 184 27 L 250 27 Q 264 27 264 41 L 264 68" className={`transition-colors duration-200 ${strokeCls(activeSource === "gmail")}`} strokeWidth={activeSource === "gmail" ? 1.5 : 1.15} />
      <path d="M 184 109 L 250 109 Q 264 109 264 95 L 264 68" className={`transition-colors duration-200 ${strokeCls(activeSource === "smtp")}`} strokeWidth={activeSource === "smtp" ? 1.5 : 1.15} />
      <path d="M 264 68 L 362 68" className={`transition-colors duration-200 ${strokeCls(activeSource === "gmail" || activeSource === "smtp")}`} strokeWidth={activeSource === "gmail" || activeSource === "smtp" ? 1.5 : 1.15} />

      {/* Right Top (LinkedIn) & Right Bottom (AI Agent) -> Junction -> Center Hub */}
      <path d="M 764 27 L 698 27 Q 684 27 684 41 L 684 68" className={`transition-colors duration-200 ${strokeCls(activeSource === "linkedin")}`} strokeWidth={activeSource === "linkedin" ? 1.5 : 1.15} />
      <path d="M 764 109 L 698 109 Q 684 109 684 95 L 684 68" className={`transition-colors duration-200 ${strokeCls(activeSource === "ai")}`} strokeWidth={activeSource === "ai" ? 1.5 : 1.15} />
      <path d="M 684 68 L 586 68" className={`transition-colors duration-200 ${strokeCls(activeSource === "linkedin" || activeSource === "ai")}`} strokeWidth={activeSource === "linkedin" || activeSource === "ai" ? 1.5 : 1.15} />

      {/* Hub -> Bottom Junction -> 3 Cards */}
      <path d="M 474 106 L 474 166" className={`transition-colors duration-200 ${strokeCls(Boolean(activeCard || activeSource))}`} strokeWidth={activeCard || activeSource ? 1.4 : 1.15} />
      <path d="M 474 166 L 166 166 Q 152 166 152 180 L 152 214" className={`transition-colors duration-200 ${strokeCls(activeCard === "delivery")}`} strokeWidth={activeCard === "delivery" ? 1.5 : 1.15} />
      <path d="M 474 166 L 474 214" className={`transition-colors duration-200 ${strokeCls(activeCard === "routing")}`} strokeWidth={activeCard === "routing" ? 1.5 : 1.15} />
      <path d="M 474 166 L 782 166 Q 796 166 796 180 L 796 214" className={`transition-colors duration-200 ${strokeCls(activeCard === "inbox")}`} strokeWidth={activeCard === "inbox" ? 1.5 : 1.15} />

      {/* Animated CSS Data Beams */}
      {[...INBOUND_BEAMS, ...OUTBOUND_BEAMS].map((beam) => (
        <path
          key={beam.id}
          d={beam.d}
          stroke={beam.color}
          strokeWidth="1.8"
          strokeLinecap="round"
          className="beam-pulse-path"
          style={{ animationDelay: beam.delay }}
        />
      ))}

      {/* Junction Nodes */}
      <circle cx="264" cy="68" r="3" fill="#ffffff" stroke="#CFCFD9" strokeWidth="1.2" />
      <circle cx="684" cy="68" r="3" fill="#ffffff" stroke="#CFCFD9" strokeWidth="1.2" />
      <circle cx="474" cy="166" r="3" fill="#ffffff" stroke="#CFCFD9" strokeWidth="1.2" />
    </svg>
  );
}
