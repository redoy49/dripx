const ECOSYSTEM_PARTNERS = [
  { name: "Google Gmail", role: "OAuth & RFC Threading", accent: "text-slate-800" },
  { name: "LinkedIn Cloud", role: "Dedicated Residential IP", accent: "text-sky-700" },
  { name: "Unipile Engine", role: "Real-Time Sync", accent: "text-indigo-700" },
  { name: "OpenAI", role: "ChatGPT BYOK", accent: "text-slate-900" },
  { name: "Claude", role: "Anthropic Reasoning", accent: "text-orange-700" },
  { name: "DeepSeek", role: "Fast Model Inference", accent: "text-indigo-600" },
  { name: "Google Gemini", role: "Multi-Modal Copilot", accent: "text-blue-600" },
  { name: "MongoDB Atlas", role: "AES-256 Encrypted Vault", accent: "text-emerald-700" },
];

/**
 * Architectural 2x4 hairline grid with geometric `+` crosshair intersection markers
 * highlighting DripX's live messaging and BYOK AI integrations.
 */
export default function IntegrationCrosshairGrid() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-center text-base sm:text-lg font-medium text-slate-500 mb-8">
        Messaging channels and AI engines we <span className="font-semibold text-slate-900">connect</span> natively.
      </p>

      <div className="relative max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 border border-slate-200/90 bg-white">
        {/* Geometric + crosshair intersection markers */}
        {["left-1/4", "left-2/4", "left-3/4"].map((pos) => (
          <span
            key={pos}
            aria-hidden="true"
            className={`hidden sm:flex items-center justify-center absolute ${pos} top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white text-slate-400 text-sm font-light select-none z-10`}
          >
            +
          </span>
        ))}

        {ECOSYSTEM_PARTNERS.map((item, idx) => (
          <div
            key={item.name}
            className={`group flex flex-col items-center justify-center py-7 px-4 text-center transition-colors hover:bg-slate-50/80 ${
              idx < 4 ? "border-b border-slate-200/90" : ""
            } ${idx % 4 !== 3 ? "sm:border-r sm:border-slate-200/90" : ""} ${
              idx % 2 === 0 ? "border-r sm:border-r-inherit border-slate-200/90" : ""
            }`}
          >
            <span className={`text-sm sm:text-base font-bold tracking-tight ${item.accent}`}>
              {item.name}
            </span>
            <span className="mt-1 text-[11px] text-slate-500 group-hover:text-slate-700 transition-colors">
              {item.role}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
