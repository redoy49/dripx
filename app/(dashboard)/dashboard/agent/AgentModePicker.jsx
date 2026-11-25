"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

const MODES = [
  { id: "build", label: "Build", hint: "Full tools + Drafts" },
  { id: "plan", label: "Plan", hint: "Read-only strategy" },
  { id: "ask", label: "Ask", hint: "Direct model chat" },
];

export default function AgentModePicker({ mode, onChangeMode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const active = MODES.find((m) => m.id === mode) || MODES[0];

  useEffect(() => {
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-full border border-gray-200/90 bg-gray-50/80 hover:bg-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700 transition cursor-pointer"
      >
        <span>{active.label}</span>
        <ChevronDown size={13} className="text-gray-400" />
      </button>

      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-48 rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl z-40">
          {MODES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                onChangeMode(m.id);
                setOpen(false);
              }}
              className={`w-full rounded-xl px-2.5 py-2 text-left text-xs transition cursor-pointer ${
                mode === m.id ? "bg-indigo-50 text-indigo-700 font-bold" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <div>{m.label}</div>
              <div className="text-[10px] font-normal text-gray-400">{m.hint}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
