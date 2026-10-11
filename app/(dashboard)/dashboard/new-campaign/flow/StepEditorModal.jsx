"use client";

import { useRef, useState } from "react";
import { X, Sparkles, AlertCircle, Eye, Info } from "lucide-react";
import { renderTemplate, BUILT_IN_VARIABLES, SAMPLE_LEAD } from "@/app/lib/personalization";
import { stepOption } from "./graph";

function VariableChips({ onInsert }) {
  return (
    <div className="mb-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-gray-500">
          <Sparkles size={13} className="text-[#6367FF]" /> Insert Variable
        </span>
        <span className="text-[11px] text-gray-400">Inserts at cursor</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {BUILT_IN_VARIABLES.map((v) => (
          <button
            key={v.key}
            type="button"
            onClick={() => onInsert(`{{${v.key}}}`)}
            className="rounded-lg border border-gray-200 bg-white px-2.5 py-1 text-xs font-medium text-gray-600 transition hover:border-[#6367FF] hover:bg-[#6367FF]/5 hover:text-[#6367FF]"
            title={`Insert {{${v.key}}}`}
          >
            {v.label}{" "}
            <span className="text-[10px] text-gray-400 font-mono">
              ({`{{${v.key}}}`})
            </span>
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1.5 rounded-lg bg-gray-50 px-2.5 py-1 text-[11px] text-gray-500 border border-gray-100">
        <Info size={12} className="shrink-0 text-gray-400" />
        <span>
          Use <code className="font-mono text-[#6367FF]">{"{{variable|fallback}}"}</code> (e.g.{" "}
          <code className="font-mono text-gray-700">{"{{company|your team}}"}</code>) for missing data.
        </span>
      </div>
    </div>
  );
}

/** Modal for editing the copy/config of one action node (opened via its "..." > Edit
 * menu). Condition and delay steps are never edited here — they have no visible node;
 * delay lives on the edge pill instead. */
export default function StepEditorModal({ open, step, onClose, onChange }) {
  const [activeField, setActiveField] = useState(
    step?.type === "connection_request" ? "note" : "template"
  );
  const [previewEmpty, setPreviewEmpty] = useState(false);

  const subjectRef = useRef(null);
  const bodyRef = useRef(null);

  if (!open || !step) return null;

  const opt = stepOption(step.type);
  const update = (patch) => onChange({ ...step, config: { ...step.config, ...patch } });

  const activeTargetLead = previewEmpty ? {} : SAMPLE_LEAD;

  // Insert token at exact cursor selection position
  const handleInsertToken = (token) => {
    let inputEl = null;
    let fieldKey = activeField;

    if (fieldKey === "subject" && subjectRef.current) {
      inputEl = subjectRef.current;
    } else if (bodyRef.current) {
      inputEl = bodyRef.current;
      fieldKey = step.type === "connection_request" ? "note" : "template";
    }

    if (!inputEl) {
      const fallbackField = step.type === "connection_request" ? "note" : "template";
      update({ [fallbackField]: (step.config[fallbackField] || "") + token });
      return;
    }

    const val = inputEl.value || "";
    const start = inputEl.selectionStart ?? val.length;
    const end = inputEl.selectionEnd ?? val.length;

    const nextVal = val.slice(0, start) + token + val.slice(end);
    update({ [fieldKey]: nextVal });

    requestAnimationFrame(() => {
      inputEl.focus();
      const nextPos = start + token.length;
      inputEl.setSelectionRange(nextPos, nextPos);
    });
  };

  const noteLength = (step.config.note || "").length;
  const isConnectionNoteOverLimit = noteLength > 300;
  const isConnectionNoteWarning = noteLength > 260 && !isConnectionNoteOverLimit;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4 backdrop-blur-[3px]">
      <div className="modal-enter flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h3 className="text-[16px] font-semibold text-gray-800">
              Edit &ldquo;{opt.title}&rdquo;
            </h3>
            <p className="text-xs text-gray-400">
              Personalize messaging and configure step behavior
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {step.type === "connection_request" && (
            <div>
              <VariableChips onInsert={handleInsertToken} />

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <label className="font-medium text-gray-700">Invitation Note</label>
                  <span
                    className={`font-mono text-xs font-semibold ${
                      isConnectionNoteOverLimit
                        ? "text-red-500"
                        : isConnectionNoteWarning
                        ? "text-amber-500"
                        : "text-gray-400"
                    }`}
                  >
                    {noteLength} / 300
                  </span>
                </div>

                <textarea
                  ref={bodyRef}
                  value={step.config.note || ""}
                  onFocus={() => setActiveField("note")}
                  onChange={(e) => update({ note: e.target.value })}
                  placeholder="Optional note to include with the connection request (e.g. Hi {{firstName}}, I noticed your work at {{company}}...)"
                  rows={4}
                  className={`w-full rounded-xl border bg-gray-50/60 p-3.5 text-sm text-gray-700 outline-none transition focus:bg-white ${
                    isConnectionNoteOverLimit
                      ? "border-red-300 focus:border-red-400 focus:ring-1 focus:ring-red-200"
                      : "border-gray-200 focus:border-[#6367FF]/40"
                  }`}
                />

                {isConnectionNoteOverLimit && (
                  <p className="flex items-center gap-1 text-xs text-red-500">
                    <AlertCircle size={13} /> LinkedIn connection notes must be 300 characters or less.
                  </p>
                )}
              </div>
            </div>
          )}

          {(step.type === "message" || step.type === "follow_up") && (
            <div>
              <VariableChips onInsert={handleInsertToken} />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">Message Body</label>
                <textarea
                  ref={bodyRef}
                  value={step.config.template || ""}
                  onFocus={() => setActiveField("template")}
                  onChange={(e) => update({ template: e.target.value })}
                  placeholder="Hi {{firstName|there}}, wanted to reach out regarding {{company}}..."
                  rows={6}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 text-sm text-gray-700 outline-none transition focus:border-[#6367FF]/40 focus:bg-white"
                />
              </div>
            </div>
          )}

          {(step.type === "inmail" || step.type === "email") && (
            <div className="space-y-4">
              <VariableChips onInsert={handleInsertToken} />

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Subject Line {activeField === "subject" && <span className="text-[#6367FF]">(focused)</span>}
                </label>
                <input
                  ref={subjectRef}
                  value={step.config.subject || ""}
                  onFocus={() => setActiveField("subject")}
                  onChange={(e) => update({ subject: e.target.value })}
                  placeholder="e.g. Quick question for {{firstName}} regarding {{company}}"
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3.5 py-2.5 text-sm text-gray-700 outline-none transition focus:border-[#6367FF]/40 focus:bg-white"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-gray-700">
                  Message Body {activeField === "template" && <span className="text-[#6367FF]">(focused)</span>}
                </label>
                <textarea
                  ref={bodyRef}
                  value={step.config.template || ""}
                  onFocus={() => setActiveField("template")}
                  onChange={(e) => update({ template: e.target.value })}
                  placeholder="Hi {{firstName|there}}, ..."
                  rows={6}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/60 p-3.5 text-sm text-gray-700 outline-none transition focus:border-[#6367FF]/40 focus:bg-white"
                />
              </div>
            </div>
          )}

          {(step.type === "profile_visit" || step.type === "like_post") && (
            <div className="rounded-2xl border border-gray-100 bg-gray-50/50 p-6 text-center text-sm text-gray-500">
              <p className="font-medium text-gray-700">Automated Step</p>
              <p className="mt-1 text-xs text-gray-400">
                This action runs automatically against the lead without requiring a message copy.
              </p>
            </div>
          )}

          {/* Live Preview Box */}
          {["connection_request", "message", "follow_up", "inmail", "email"].includes(step.type) && (
            <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-gray-600">
                  <Eye size={13} className="text-[#6367FF]" /> Live Preview
                </span>
                <button
                  type="button"
                  onClick={() => setPreviewEmpty((v) => !v)}
                  className="text-[11px] font-medium text-gray-500 hover:text-[#6367FF] transition"
                >
                  {previewEmpty ? "← Use Sample Lead" : "Test Fallbacks (Missing Data) →"}
                </button>
              </div>

              <div className="rounded-xl border border-gray-200 bg-white p-3 text-xs leading-relaxed text-gray-700 shadow-2xs space-y-2">
                {step.config.subject && (
                  <div className="border-b border-gray-100 pb-2">
                    <span className="font-semibold text-gray-400 uppercase text-[10px] block">Subject</span>
                    <p className="text-gray-900 font-medium">
                      {renderTemplate(step.config.subject, activeTargetLead) || (
                        <span className="italic text-gray-300">Empty subject</span>
                      )}
                    </p>
                  </div>
                )}

                <div>
                  <span className="font-semibold text-gray-400 uppercase text-[10px] block">
                    {step.type === "connection_request" ? "Note Body" : "Body"}
                  </span>
                  <p className="whitespace-pre-wrap text-gray-800">
                    {renderTemplate(
                      step.type === "connection_request" ? step.config.note || "" : step.config.template || "",
                      activeTargetLead
                    ) || <span className="italic text-gray-300">No copy entered yet</span>}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4 bg-gray-50/50">
          <span className="text-xs text-gray-400">
            Changes saved to draft
          </span>
          <button
            onClick={onClose}
            className="rounded-xl bg-[#6367FF] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5254e8]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
