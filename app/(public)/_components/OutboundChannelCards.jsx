"use client";

import { useState } from "react";
import { Mail, Layers, Inbox, Check } from "lucide-react";

const DELIVERY_SEGMENTS = [
  { id: "sent", label: "Sent", value: 342, pct: 66, color: "#7DA9F7" },
  { id: "queued", label: "Queued", value: 120, pct: 23, color: "#B884EB" },
  { id: "warmup", label: "Warmup", value: 40, pct: 7, color: "#EE9777" },
  { id: "paused", label: "Replied", value: 18, pct: 4, color: "#E9CC65" },
];

const ROUTING_STEPS = [
  { id: "invite", label: "LinkedIn invite", count: "76%", pct: 76, color: "#72A4F5" },
  { id: "email", label: "Email step 1", count: "64%", pct: 64, color: "#B986EB" },
  { id: "fallback", label: "72h email fallback", count: "42%", pct: 42, color: "#E68D6A" },
  { id: "stop", label: "Reply auto-stop", count: "18%", pct: 18, color: "#DFC05B" },
];

const meshStyle = (rgba) => ({
  backgroundImage: `linear-gradient(to right, ${rgba} 1px, transparent 1px), linear-gradient(to bottom, ${rgba} 1px, transparent 1px)`,
  backgroundSize: "5px 5px",
  maskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.95) 100%)",
  WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.35) 30%, rgba(0,0,0,0.95) 100%)",
});

export default function OutboundChannelCards({ activeCard, onHoverCard }) {
  const [hoverSeg, setHoverSeg] = useState(null);
  const [hoverStep, setHoverStep] = useState(null);

  return (
    <div className="mt-8 grid grid-cols-1 gap-5 md:mt-[78px] md:grid-cols-3">
      {/* CARD 1: Smart Email Delivery (Lavender) */}
      <article
        onMouseEnter={() => onHoverCard("delivery")}
        onMouseLeave={() => onHoverCard(null)}
        className={`group relative flex h-[368px] flex-col overflow-hidden rounded-[20px] border-[3px] border-white bg-gradient-to-b from-[#F7F1FC] via-[#F2E9F9] to-[#E9DDF5] transition-shadow duration-300 ${
          activeCard === "delivery" ? "shadow-[0_16px_36px_-12px_rgba(88,48,140,0.2)]" : "shadow-[0_10px_28px_-10px_rgba(15,23,42,0.09)]"
        }`}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={meshStyle("rgba(130, 95, 175, 0.11)")} />
        <div className="relative z-10 px-6 pt-6">
          <div className="flex items-center gap-2 text-[#18181F]">
            <Mail size={16} className="text-indigo-700" />
            <h3 className="text-[16px] font-semibold tracking-[-0.02em]">Smart email delivery</h3>
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.48] text-[#5F5E6B]">
            Rotates connected Gmail &amp; SMTP mailboxes with Spintax copy and RFC 2822 threading.
          </p>
        </div>

        <div className="relative z-10 mt-auto h-[232px] w-full">
          <div className="absolute bottom-6 left-7 right-[-22px] z-10 rounded-[16px] border border-white/80 bg-white/45 p-[4px] shadow-[0_12px_28px_-10px_rgba(55,25,95,0.12)]">
            <div className="rounded-[12px] border border-[#EFEAF6] bg-white/95 px-4 py-4">
              <div className="text-[11px] font-medium text-[#42424E]">Daily queue</div>
              <div className="mt-3 flex h-[17px] w-full overflow-hidden rounded-[4px] bg-[#F1EFF6]">
                {DELIVERY_SEGMENTS.map((seg) => (
                  <div
                    key={seg.id}
                    onMouseEnter={() => setHoverSeg(seg.id)}
                    onMouseLeave={() => setHoverSeg(null)}
                    style={{ width: `${seg.pct}%`, backgroundColor: seg.color }}
                    className={`h-full cursor-pointer transition-opacity duration-200 ${hoverSeg && hoverSeg !== seg.id ? "opacity-35" : "opacity-100"}`}
                    title={`${seg.label}: ${seg.value}`}
                  />
                ))}
              </div>
              <div className="mt-4 grid grid-cols-4 gap-2 pr-6">
                {DELIVERY_SEGMENTS.map((m) => (
                  <div key={m.id} onMouseEnter={() => setHoverSeg(m.id)} onMouseLeave={() => setHoverSeg(null)} className="cursor-pointer">
                    <div className="text-[22px] font-light leading-none tracking-[-0.03em] tabular-nums text-[#262630]">{m.value}</div>
                    <div className="mt-1.5 text-[9.5px] text-[#6F6E7B] truncate">{m.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute right-7 top-4 z-30 w-[144px] rounded-[14px] border border-white/95 bg-white/85 px-4 py-3.5 backdrop-blur-xl shadow-[0_16px_36px_-8px_rgba(45,22,82,0.16)] transition-transform duration-200 group-hover:-translate-y-1">
            <div className="text-[9.5px] font-medium text-[#585866]">Inbox placement</div>
            <div className="mt-1.5 flex items-baseline gap-1 tabular-nums">
              <span className="text-[32px] font-light leading-none tracking-[-0.045em] text-[#1C1C24]">99.4</span>
              <span className="text-[13px] text-[#3E3E4A]">%</span>
            </div>
            <div className="mt-2 text-[9px] text-[#6D6C79]">Spintax + DKIM active</div>
          </div>
        </div>
      </article>

      {/* CARD 2: Multi-Channel Routing (Sky Blue) */}
      <article
        onMouseEnter={() => onHoverCard("routing")}
        onMouseLeave={() => onHoverCard(null)}
        className={`group relative flex h-[368px] flex-col overflow-hidden rounded-[20px] border-[3px] border-white bg-gradient-to-b from-[#EDF6FE] via-[#E5F1FC] to-[#DCEAFB] transition-shadow duration-300 ${activeCard === "routing" ? "shadow-[0_16px_36px_-12px_rgba(25,75,145,0.2)]" : "shadow-[0_10px_28px_-10px_rgba(15,23,42,0.09)]"}`}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={meshStyle("rgba(60, 120, 195, 0.11)")} />
        <div className="relative z-10 px-6 pt-6">
          <div className="flex items-center gap-2 text-[#18181F]">
            <Layers size={16} className="text-sky-700" />
            <h3 className="text-[16px] font-semibold tracking-[-0.02em]">Multi-channel routing</h3>
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.48] text-[#5F5E6B]">
            Branches from LinkedIn invites to cold email follow-ups inside prospect 9am–5pm hours.
          </p>
        </div>

        <div className="relative z-10 mt-auto h-[232px] w-full">
          <div className="absolute inset-x-0 bottom-0 z-10 h-[150px] border-t border-white/90 bg-white/65 px-4 pt-3 text-[9.5px] text-[#4E4E5A]">
            <div className="flex items-center justify-between text-[7.5px] font-semibold uppercase tracking-[0.06em] opacity-65">
              <span>Step Trigger</span><span>Window</span>
            </div>
            <div className="mt-2 divide-y divide-[#E2E9F4]">
              <div className="flex items-center justify-between py-2.5"><span>Profile visit &rarr; Wait 4h</span><span className="tabular-nums">09:30 AM</span></div>
              <div className="flex items-center justify-between py-2.5"><span>Invite accepted &rarr; DM</span><span className="tabular-nums">11:15 AM</span></div>
              <div className="flex items-center justify-between py-2.5"><span>72h ignored &rarr; Cold Email</span><span className="tabular-nums text-indigo-700 font-semibold">Re: Note</span></div>
            </div>
          </div>

          <div className="absolute left-1/2 top-2 z-30 w-[206px] -translate-x-1/2 rounded-[14px] border border-white bg-white/92 px-4 py-3.5 backdrop-blur-md shadow-[0_16px_36px_-8px_rgba(18,45,95,0.16)] transition-transform duration-200 group-hover:-translate-y-1">
            <div className="text-[11.5px] font-semibold text-[#1E1E26]">Channel routing</div>
            <div className="mt-3 space-y-2.5">
              {ROUTING_STEPS.map((st) => (
                <div key={st.id} onMouseEnter={() => setHoverStep(st.id)} onMouseLeave={() => setHoverStep(null)} className={`cursor-pointer transition-opacity ${hoverStep && hoverStep !== st.id ? "opacity-45" : "opacity-100"}`}>
                  <div className="text-[9px] font-medium text-[#545460]">{st.label}</div>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="h-[4.5px] flex-1 overflow-hidden rounded-full bg-[#EDF0F6]">
                      <div style={{ width: `${st.pct}%`, backgroundColor: st.color }} className="h-full rounded-full" />
                    </div>
                    <span className="w-6 text-right text-[8.5px] font-medium tabular-nums text-[#8E929E]">{st.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </article>

      {/* CARD 3: Unified Inbox & Auto-Pause (Peach) */}
      <article
        onMouseEnter={() => onHoverCard("inbox")}
        onMouseLeave={() => onHoverCard(null)}
        className={`group relative flex h-[368px] flex-col overflow-hidden rounded-[20px] border-[3px] border-white bg-gradient-to-b from-[#FDF2EA] via-[#FBECE2] to-[#F8E4D8] transition-shadow duration-300 ${
          activeCard === "inbox" ? "shadow-[0_16px_36px_-12px_rgba(165,85,40,0.2)]" : "shadow-[0_10px_28px_-10px_rgba(15,23,42,0.09)]"
        }`}
      >
        <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={meshStyle("rgba(185, 115, 70, 0.1)")} />
        <div className="relative z-10 px-6 pt-6">
          <div className="flex items-center gap-2 text-[#18181F]">
            <Inbox size={16} className="text-orange-700" />
            <h3 className="text-[16px] font-semibold tracking-[-0.02em]">Unified inbox &amp; auto-pause</h3>
          </div>
          <p className="mt-2 text-[12.5px] leading-[1.48] text-[#5F5E6B]">
            Prospect replies halt scheduled follow-ups and lock threads so reps never collide.
          </p>
        </div>

        <div className="relative z-10 mt-auto h-[232px] w-full">
          <div className="absolute bottom-0 left-[64px] right-[-10px] top-1 z-10 rounded-tl-[18px] border-l border-t border-white/85 bg-white/45 p-[4px] pb-0 pr-0">
            <div className="h-full w-full rounded-tl-[14px] border-l border-t border-[#F6ECE6] bg-white/95 px-4 pt-3.5">
              <div className="text-[11px] font-semibold text-[#22222A] truncate">Re: Quick idea for Acme</div>
              <div className="mt-2.5 flex justify-end">
                <div className="w-[108px] rounded-[12px] border border-[#F3ECE8] bg-white px-3 py-3 shadow-[0_8px_20px_-8px_rgba(90,45,15,0.08)]">
                  <div className="text-[9px] font-medium text-[#555562]">Flag rate</div>
                  <div className="mt-1 flex items-baseline gap-0.5 tabular-nums">
                    <span className="text-[24px] font-light tracking-[-0.04em] text-[#1C1C24]">0.02</span>
                    <span className="text-[11px] text-[#4B4B57]">%</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pr-3 space-y-1.5 text-[8.5px] text-[#363640]">
                <div className="flex items-center gap-1.5 font-semibold text-emerald-700">
                  <Check size={11} /> Sequence auto-paused on reply
                </div>
                <p className="text-[#6F6C6A] leading-snug">Thread locked while Sarah drafts response.</p>
              </div>
            </div>
          </div>

          <div className="absolute left-5 top-[34px] z-30 w-[158px] rounded-[14px] border border-white bg-white/95 px-4 py-3.5 backdrop-blur-xl shadow-[0_16px_36px_-8px_rgba(95,45,15,0.14)] transition-transform duration-200 group-hover:-translate-y-1">
            <div className="text-[9.5px] font-medium text-[#42424E]">Positive replies</div>
            <div className="mt-1.5 flex items-baseline gap-1 tabular-nums">
              <span className="text-[34px] font-light leading-none tracking-[-0.045em] text-[#1C1C24]">18</span>
              <span className="text-[12px] text-[#3E3E4A]">today</span>
            </div>
            <div className="mt-2.5 flex items-center gap-1.5 text-[9px] text-[#6F6C6A]">
              <span className="inline-flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-emerald-600 text-[8px] font-bold text-white">&#10003;</span>
              <span>0 rep collisions</span>
            </div>
          </div>
        </div>
      </article>
    </div>
  );
}
