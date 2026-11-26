"use client";

import { useState } from "react";
import Image from "next/image";

const ECOSYSTEM_PARTNERS = [
  {
    name: "Google Gmail",
    role: "OAuth & RFC Threading",
    detail: "Connects Google Workspace and Gmail via OAuth 2.0 with native Message-ID reply threading.",
    logo: "/brands/gmail.svg",
    hoverBg: "hover:bg-rose-50/40",
  },
  {
    name: "LinkedIn",
    role: "Dedicated Residential IP",
    detail: "Executes profile views, invites, and DMs 24/7 inside isolated static residential proxy sessions.",
    logo: "/brands/linkedin.svg",
    hoverBg: "hover:bg-sky-50/50",
  },
  {
    name: "OpenAI",
    role: "ChatGPT BYOK",
    detail: "Bring your own OpenAI or OpenRouter key to power sequence drafting and reply triage.",
    logo: "/brands/openai.svg",
    hoverBg: "hover:bg-slate-100/70",
  },
  {
    name: "Claude",
    role: "Anthropic Reasoning",
    detail: "Direct Anthropic or River AI Claude access for natural, high-converting cold outreach copy.",
    logo: "/brands/claude.svg",
    hoverBg: "hover:bg-orange-50/50",
  },
  {
    name: "DeepSeek",
    role: "Fast Model Inference",
    detail: "Connect DeepSeek Direct or aggregated keys with live /models discovery in Settings.",
    logo: "/brands/deepseek.svg",
    hoverBg: "hover:bg-blue-50/50",
  },
  {
    name: "Google Gemini",
    role: "Multi-Modal Copilot",
    detail: "Fast Gemini models unlocked automatically whenever your workspace key supports them.",
    logo: "/brands/gemini.svg",
    hoverBg: "hover:bg-indigo-50/40",
  },
  {
    name: "MongoDB Atlas",
    role: "AES-256 Encrypted Vault",
    detail: "Credentials, threads, and sequence queues are encrypted with AES-256-GCM and TLS 1.3.",
    logo: "/brands/mongodb.svg",
    hoverBg: "hover:bg-emerald-50/50",
  },
  {
    name: "Vercel",
    role: "Edge & AI Gateway",
    detail: "Sub-50ms App Router streaming, Cron execution, and optional Vercel AI Gateway routing.",
    logo: "/brands/vercel.svg",
    hoverBg: "hover:bg-slate-100/70",
  },
];

export default function IntegrationCrosshairGrid() {
  const [selectedName, setSelectedName] = useState(null);
  const selectedItem = ECOSYSTEM_PARTNERS.find((p) => p.name === selectedName);

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
      <p className="text-center text-base sm:text-lg font-medium text-slate-500 mb-8">
        Messaging channels and AI engines we <span className="font-semibold text-slate-900">connect</span> natively.
      </p>

      <div className="relative w-full grid grid-cols-2 sm:grid-cols-4 border border-slate-200/90 bg-white">
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
          const isSelected = selectedName === item.name;
          return (
            <button
              key={item.name}
              type="button"
              onClick={() => setSelectedName(isSelected ? null : item.name)}
              className={`group flex flex-col items-center justify-center py-8 px-4 text-center transition-all duration-200 cursor-pointer ${item.hoverBg} ${
                isSelected ? "bg-indigo-50/50" : ""
              } ${idx < 4 ? "border-b border-slate-200/90" : ""} ${
                idx % 4 !== 3 ? "sm:border-r sm:border-slate-200/90" : ""
              } ${idx % 2 === 0 ? "border-r sm:border-r-inherit border-slate-200/90" : ""}`}
            >
              <div className="flex items-center gap-2.5">
                <Image
                  src={item.logo}
                  alt={item.name}
                  width={26}
                  height={26}
                  className="h-6 w-6 object-contain transition-transform duration-200 group-hover:scale-110 shrink-0"
                />
                <span className="text-sm sm:text-base font-bold tracking-tight text-slate-900">
                  {item.name}
                </span>
              </div>
              <span className="mt-1.5 text-[11px] font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                {item.role}
              </span>
            </button>
          );
        })}
      </div>

      {selectedItem && (
        <div className="w-full mt-3 rounded-xl bg-white px-4 py-2.5 text-xs text-slate-700 shadow-ring-card flex items-center justify-between gap-3">
          <span>
            <strong className="text-slate-900">{selectedItem.name}:</strong> {selectedItem.detail}
          </span>
          <button
            type="button"
            onClick={() => setSelectedName(null)}
            className="text-[11px] font-semibold text-indigo-600 hover:underline shrink-0 cursor-pointer"
          >
            Close
          </button>
        </div>
      )}
    </section>
  );
}
