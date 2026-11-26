import {
  GmailMark,
  LinkedInMark,
  UnipileMark,
  OpenAIMark,
  ClaudeMark,
  DeepSeekMark,
  GeminiMark,
  MongoMark,
} from "./BrandMarks";

const ECOSYSTEM_PARTNERS = [
  { name: "Google Gmail", role: "OAuth & RFC Threading", hoverBg: "hover:bg-rose-50/40", Mark: GmailMark },
  { name: "LinkedIn Cloud", role: "Dedicated Residential IP", hoverBg: "hover:bg-sky-50/50", Mark: LinkedInMark },
  { name: "Unipile Engine", role: "Real-Time Sync", hoverBg: "hover:bg-indigo-50/50", Mark: UnipileMark },
  { name: "OpenAI", role: "ChatGPT BYOK", hoverBg: "hover:bg-slate-100/70", Mark: OpenAIMark },
  { name: "Claude", role: "Anthropic Reasoning", hoverBg: "hover:bg-orange-50/50", Mark: ClaudeMark },
  { name: "DeepSeek", role: "Fast Model Inference", hoverBg: "hover:bg-blue-50/50", Mark: DeepSeekMark },
  { name: "Google Gemini", role: "Multi-Modal Copilot", hoverBg: "hover:bg-indigo-50/40", Mark: GeminiMark },
  { name: "MongoDB Atlas", role: "AES-256 Encrypted Vault", hoverBg: "hover:bg-emerald-50/50", Mark: MongoMark },
];

/**
 * Architectural 2x4 hairline grid with crisp brand marks and `+` crosshair
 * intersection markers highlighting DripX's messaging & BYOK AI integrations.
 */
export default function IntegrationCrosshairGrid() {
  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <p className="text-center text-base sm:text-lg font-medium text-slate-500 mb-8">
        Messaging channels and AI engines we <span className="font-semibold text-slate-900">connect</span> natively.
      </p>

      <div className="relative max-w-5xl mx-auto grid grid-cols-2 sm:grid-cols-4 border border-slate-200/90 bg-white">
        {["left-1/4", "left-2/4", "left-3/4"].map((pos) => (
          <span
            key={pos}
            aria-hidden="true"
            className={`hidden sm:flex items-center justify-center absolute ${pos} top-1/2 -translate-x-1/2 -translate-y-1/2 w-5 h-5 bg-white text-slate-400 text-sm font-light select-none z-10`}
          >
            +
          </span>
        ))}

        {ECOSYSTEM_PARTNERS.map((item, idx) => {
          const BrandMark = item.Mark;
          return (
            <div
              key={item.name}
              className={`group flex flex-col items-center justify-center py-8 px-4 text-center transition-all duration-200 cursor-default ${item.hoverBg} ${
                idx < 4 ? "border-b border-slate-200/90" : ""
              } ${idx % 4 !== 3 ? "sm:border-r sm:border-slate-200/90" : ""} ${
                idx % 2 === 0 ? "border-r sm:border-r-inherit border-slate-200/90" : ""
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="transition-transform duration-200 group-hover:scale-110">
                  <BrandMark />
                </span>
                <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                  {item.name}
                </span>
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                {item.role}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
