"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Clock, Lock, RefreshCw, ShieldCheck } from "lucide-react";
import { resolveSpintax } from "@/app/lib/personalization";

const DEMO_SPINTAX =
  "{Hi|Hello|Hey} Alex, {quick question|short note} on {scaling outbound|lifting reply rates} at Acme.";

const FLOW_STEPS = [
  { id: "visit", title: "Connection Request Sent", detail: "LinkedIn · Local 10:14 AM", status: "Awaiting 72h", logo: "/brands/linkedin.svg", tag: "LinkedIn" },
  { id: "email", title: "Smart Email Fallback", detail: "Re: Quick question for Acme", status: "RFC 2822 Threaded", logo: "/brands/gmail.svg", tag: "Gmail OAuth" },
];

export default function ProductTabPreview({ tabId }) {
  const [activeStep, setActiveStep] = useState("visit");
  const [spunText, setSpunText] = useState("Hello Alex, quick question on scaling outbound at Acme.");
  const [agentMode, setAgentMode] = useState("Build");

  if (tabId === "sequences") {
    return (
      <div className="rounded-2xl bg-slate-50/70 p-5 shadow-ring-card space-y-3">
        <div className="flex items-center justify-between text-xs font-medium text-slate-500">
          <span>Synchronized Sequence Flow</span>
          <span className="text-emerald-700 font-semibold">Auto-pause on reply</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {FLOW_STEPS.map((st) => {
            const selected = activeStep === st.id;
            return (
              <button
                key={st.id}
                type="button"
                onClick={() => setActiveStep(st.id)}
                className={`text-left rounded-xl bg-white p-4 transition-all cursor-pointer ${
                  selected ? "shadow-ring-elevated" : "shadow-ring-card hover:bg-slate-50/50"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
                    <Image src={st.logo} alt={st.tag} width={15} height={15} className="h-3.5 w-3.5 object-contain" />
                    {st.tag}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700">{st.status}</span>
                </div>
                <p className="text-sm font-semibold text-slate-900">{st.title}</p>
                <p className="mt-1 text-xs text-slate-500">{st.detail}</p>
              </button>
            );
          })}
        </div>

        <div className="flex items-center justify-between rounded-xl bg-white px-4 py-2.5 text-xs text-slate-600 shadow-ring-card">
          <span className="inline-flex items-center gap-1.5">
            <Clock size={13} className="text-indigo-500" />
            Respects prospect 9am–5pm timezone window
          </span>
          <span className="font-semibold text-slate-900">0 duplicates</span>
        </div>
      </div>
    );
  }

  if (tabId === "inbox") {
    return (
      <div className="rounded-2xl bg-slate-50/70 p-5 shadow-ring-card space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-slate-900">Michael Chang &middot; VP Product</span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 shadow-ring-card">
            <Lock size={11} /> Locked by Sarah C.
          </span>
        </div>

        <div className="rounded-xl bg-white p-4 shadow-ring-card space-y-2.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Image src="/brands/linkedin.svg" alt="LinkedIn" width={13} height={13} className="h-3.5 w-3.5" />
              LinkedIn Reply
            </span>
            <span>2m ago</span>
          </div>
          <p className="text-sm text-slate-800">
            &ldquo;Thursday at 2:00 PM works well. Please send over the calendar invite.&rdquo;
          </p>
        </div>

        <div className="rounded-xl bg-white px-4 py-3 shadow-ring-card flex items-center justify-between text-xs">
          <span className="inline-flex items-center gap-1.5 font-medium text-emerald-700">
            <Check size={13} /> Follow-up steps paused automatically
          </span>
          <span className="text-slate-500">Thread synced</span>
        </div>
      </div>
    );
  }

  if (tabId === "spintax") {
    return (
      <div className="rounded-2xl bg-slate-50/70 p-5 shadow-ring-card space-y-3.5">
        <div>
          <p className="text-xs font-medium text-slate-500 mb-1.5">Template</p>
          <pre className="rounded-xl bg-white p-3.5 text-xs font-mono text-slate-700 whitespace-pre-wrap shadow-ring-card">
            {DEMO_SPINTAX}
          </pre>
        </div>
        <div className="rounded-xl bg-white p-4 shadow-ring-elevated flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold text-emerald-700 mb-1">Sent Variant</p>
            <p className="text-sm font-medium text-slate-900">{spunText}</p>
          </div>
          <button
            type="button"
            onClick={() => setSpunText(resolveSpintax(DEMO_SPINTAX))}
            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-400 hover:bg-indigo-500 text-white px-4 py-2 text-xs font-semibold shrink-0 active:scale-95 transition cursor-pointer"
          >
            <RefreshCw size={12} />
            Spin Variant
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-slate-50/70 p-5 shadow-ring-card space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 rounded-full bg-white p-1 shadow-ring-card">
          {["Build", "Plan", "Ask"].map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setAgentMode(m)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition cursor-pointer ${
                agentMode === m ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {m}
            </button>
          ))}
        </div>
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 shadow-ring-card">
          <Image src="/brands/claude.svg" alt="Claude" width={14} height={14} className="h-3.5 w-3.5" />
          <Image src="/brands/openai.svg" alt="OpenAI" width={14} height={14} className="h-3.5 w-3.5" />
          <Image src="/brands/deepseek.svg" alt="DeepSeek" width={14} height={14} className="h-3.5 w-3.5" />
          <span className="text-[11px] font-semibold text-slate-700">BYOK Models</span>
        </div>
      </div>

      <div className="rounded-xl bg-white p-4 shadow-ring-card space-y-2">
        <p className="text-xs font-semibold text-slate-900">
          {agentMode === "Plan"
            ? "Read-only campaign and mailbox health audit"
            : agentMode === "Ask"
            ? "Draft personalized Spintax copy on demand"
            : "Drafted 3-step Email + LinkedIn campaign"}
        </p>
        <div className="flex items-center justify-between pt-2 border-t border-slate-200/70 text-xs">
          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
            <ShieldCheck size={13} /> Guardrail active before live launch
          </span>
          <span className="rounded-full bg-indigo-400 px-3 py-1 text-[11px] font-semibold text-white">
            Confirm &amp; Execute
          </span>
        </div>
      </div>
    </div>
  );
}
