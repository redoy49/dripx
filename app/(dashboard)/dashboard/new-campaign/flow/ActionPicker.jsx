"use client";

import { X } from "lucide-react";
import { ACTION_STEP_OPTIONS, CONDITION_OPTION, UNAVAILABLE_ACTIONS } from "./graph";

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

        <div className="max-h-[70vh] overflow-y-auto p-5">
          <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Actions
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {ACTION_STEP_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.type}
                  onClick={() => onPick(opt.type)}
                  className="card-option flex flex-col items-start gap-2 rounded-xl border border-gray-100 p-3 text-left hover:border-[#6367FF]/30"
                >
                  <div
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: opt.bg }}
                  >
                    <Icon size={15} strokeWidth={1.9} style={{ color: opt.accent }} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{opt.title}</span>
                </button>
              );
            })}
          </div>

          <p className="mb-2 mt-5 px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Conditions
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => onPick(CONDITION_OPTION.type)}
              className="card-option flex flex-col items-start gap-2 rounded-xl border border-gray-100 p-3 text-left hover:border-[#6367FF]/30"
            >
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg"
                style={{ background: CONDITION_OPTION.bg }}
              >
                <CONDITION_OPTION.icon size={15} strokeWidth={1.9} style={{ color: CONDITION_OPTION.accent }} />
              </div>
              <span className="text-xs font-semibold text-gray-700">{CONDITION_OPTION.title}</span>
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
                    <Icon size={15} strokeWidth={1.9} className="text-gray-400" />
                  </div>
                  <span className="text-xs font-semibold text-gray-500">{opt.title}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
