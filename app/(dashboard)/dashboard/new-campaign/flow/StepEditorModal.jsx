"use client";

import { X } from "lucide-react";
import { renderTemplate, BUILT_IN_VARIABLES, SAMPLE_LEAD } from "@/app/lib/personalization";
import { stepOption } from "./graph";

function VariableChips({ onInsert }) {
  return (
    <div className="mb-2 flex flex-wrap gap-1.5">
      {BUILT_IN_VARIABLES.map((v) => (
        <button
          key={v.key}
          type="button"
          onClick={() => onInsert(`{{${v.key}}}`)}
          className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-medium text-gray-500 transition hover:bg-[#6367FF]/10 hover:text-[#6367FF]"
        >
          {`{{${v.key}}}`}
        </button>
      ))}
    </div>
  );
}

/** Modal for editing the copy/config of one action node (opened via its "..." > Edit
 * menu). Condition and delay steps are never edited here — they have no visible node;
 * delay lives on the edge pill instead. */
export default function StepEditorModal({ open, step, onClose, onChange }) {
  if (!open || !step) return null;

  const opt = stepOption(step.type);
  const update = (patch) => onChange({ ...step, config: { ...step.config, ...patch } });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-6 backdrop-blur-[3px]">
      <div className="modal-enter w-full max-w-md overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-[15px] font-semibold text-gray-800">Edit &ldquo;{opt.title}&rdquo;</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={17} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto p-5">
          {step.type === "connection_request" && (
            <div>
              <VariableChips onInsert={(v) => update({ note: (step.config.note || "") + v })} />
              <textarea
                value={step.config.note || ""}
                onChange={(e) => update({ note: e.target.value })}
                placeholder="Optional note to include with the connection request (e.g. Hi {{firstName}}, I'd love to connect!)"
                rows={4}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40 focus:bg-white"
              />
              {step.config.note && (
                <p className="mt-2 text-xs text-gray-400">
                  Preview: <span className="text-gray-600">{renderTemplate(step.config.note, SAMPLE_LEAD)}</span>
                </p>
              )}
            </div>
          )}

          {(step.type === "message" || step.type === "follow_up") && (
            <div>
              <VariableChips onInsert={(v) => update({ template: (step.config.template || "") + v })} />
              <textarea
                value={step.config.template || ""}
                onChange={(e) => update({ template: e.target.value })}
                placeholder="Hi {{firstName|there}}, ..."
                rows={5}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40 focus:bg-white"
              />
              {step.config.template && (
                <p className="mt-2 text-xs text-gray-400">
                  Preview: <span className="text-gray-600">{renderTemplate(step.config.template, SAMPLE_LEAD)}</span>
                </p>
              )}
            </div>
          )}

          {(step.type === "inmail" || step.type === "email") && (
            <div className="space-y-3">
              <input
                value={step.config.subject || ""}
                onChange={(e) => update({ subject: e.target.value })}
                placeholder="Subject"
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40 focus:bg-white"
              />
              <VariableChips onInsert={(v) => update({ template: (step.config.template || "") + v })} />
              <textarea
                value={step.config.template || ""}
                onChange={(e) => update({ template: e.target.value })}
                placeholder="Hi {{firstName|there}}, ..."
                rows={5}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40 focus:bg-white"
              />
              {(step.config.subject || step.config.template) && (
                <p className="text-xs text-gray-400">
                  Preview:{" "}
                  <span className="text-gray-600">
                    {renderTemplate(step.config.subject || "", SAMPLE_LEAD)} —{" "}
                    {renderTemplate(step.config.template || "", SAMPLE_LEAD)}
                  </span>
                </p>
              )}
            </div>
          )}

          {(step.type === "profile_visit" || step.type === "like_post") && (
            <p className="text-xs text-gray-400">No configuration needed for this step.</p>
          )}
        </div>

        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#6367FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5254e8]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
