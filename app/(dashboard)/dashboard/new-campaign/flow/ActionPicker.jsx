"use client";

import { X } from "lucide-react";
import {
  EMAIL_ACTION_OPTIONS,
  LINKEDIN_ACTION_OPTIONS,
  CONDITION_OPTION,
  UNAVAILABLE_ACTIONS,
} from "./graph";

/** Modal shown when the user clicks a "+ Add" tip on the canvas — picks what kind of
 * step to append there. */
export default function ActionPicker({ open, onClose, onPick }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-6 backdrop-blur-[3px]">
      <div className="modal-enter w-full max-w-lg overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-[15px] font-semibold text-gray-800">Add a step</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5 space-y-5">
          {/* Section 1: Email Outreach */}
          <div>
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-md bg-blue-50 text-[10px] font-bold text-blue-600">✉</span>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                Email Outreach
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {EMAIL_ACTION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.type}
                    onClick={() => onPick(opt.type)}
                    className="card-option flex flex-col items-start gap-2 rounded-xl border border-gray-100 p-3 text-left hover:border-blue-400/50 hover:bg-blue-50/20 transition"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: opt.bg }}
                    >
                      <Icon size={16} strokeWidth={2} style={{ color: opt.accent }} />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-800">{opt.title}</span>
                      <span className="block text-[11px] text-gray-400 leading-tight mt-0.5">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: LinkedIn Outreach */}
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-1.5 mb-2 px-1">
              <span className="flex h-4 w-4 items-center justify-center rounded-md bg-indigo-50 text-[10px] font-bold text-indigo-600">in</span>
              <p className="text-[11px] font-bold uppercase tracking-wide text-gray-500">
                LinkedIn Outreach
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {LINKEDIN_ACTION_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.type}
                    onClick={() => onPick(opt.type)}
                    className="card-option flex flex-col items-start gap-2 rounded-xl border border-gray-100 p-3 text-left hover:border-[#6367FF]/30 transition"
                  >
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-lg"
                      style={{ background: opt.bg }}
                    >
                      <Icon size={16} strokeWidth={2} style={{ color: opt.accent }} />
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-800">{opt.title}</span>
                      <span className="block text-[11px] text-gray-400 leading-tight mt-0.5">{opt.desc}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Conditions & Rules */}
          <div className="border-t border-gray-100 pt-4">
            <p className="mb-2 px-1 text-[11px] font-bold uppercase tracking-wide text-gray-500">
              Flow & Logic
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => onPick(CONDITION_OPTION.type)}
                className="card-option flex flex-col items-start gap-2 rounded-xl border border-gray-100 p-3 text-left hover:border-[#6367FF]/30 transition"
              >
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg"
                  style={{ background: CONDITION_OPTION.bg }}
                >
                  <CONDITION_OPTION.icon size={16} strokeWidth={2} style={{ color: CONDITION_OPTION.accent }} />
                </div>
                <div>
                  <span className="block text-xs font-semibold text-gray-800">{CONDITION_OPTION.title}</span>
                  <span className="block text-[11px] text-gray-400 leading-tight mt-0.5">{CONDITION_OPTION.desc}</span>
                </div>
              </button>

              {UNAVAILABLE_ACTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <div
                    key={opt.title}
                    title="Coming soon"
                    className="flex cursor-not-allowed flex-col items-start gap-2 rounded-xl border border-gray-100 p-3 opacity-40"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100">
                      <Icon size={16} strokeWidth={2} className="text-gray-400" />
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{opt.title}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
