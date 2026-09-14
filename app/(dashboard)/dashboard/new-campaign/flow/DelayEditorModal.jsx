"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";

/** Modal for editing the delay pill shown on an edge. Backed by zero, one, or several
 * `delay`-type steps in the flat array (invisible on the canvas) — this UI always
 * collapses them down to a single equivalent delay step on save. */
export default function DelayEditorModal({ open, initial, onClose, onSave }) {
  const [amount, setAmount] = useState(initial?.amount ?? 1);
  const [unit, setUnit] = useState(initial?.unit ?? "days");

  useEffect(() => {
    if (open) {
      setAmount(initial?.amount ?? 1);
      setUnit(initial?.unit ?? "days");
    }
  }, [open, initial]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-6 backdrop-blur-[3px]">
      <div className="modal-enter w-full max-w-xs overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
          <h3 className="text-[15px] font-semibold text-gray-800">Wait before next step</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={17} />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-24 rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40 focus:bg-white"
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40"
            >
              <option value="hours">hours</option>
              <option value="days">days</option>
            </select>
          </div>
          <p className="mt-2 text-xs text-gray-400">Set to 0 for no delay.</p>
        </div>

        <div className="flex justify-end border-t border-gray-100 px-5 py-4">
          <button
            onClick={() => onSave({ amount: Math.max(0, Number(amount) || 0), unit })}
            className="rounded-xl bg-[#6367FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5254e8]"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
