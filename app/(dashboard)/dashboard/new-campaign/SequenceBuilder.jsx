"use client";

import { useEffect, useState } from "react";
import {
  UserPlus,
  MessageSquare,
  Mail,
  Eye,
  ThumbsUp,
  RefreshCw,
  GitBranch,
  Clock,
  Plus,
  Trash2,
  ChevronDown,
  Loader2,
  Check,
} from "lucide-react";
import { renderTemplate, BUILT_IN_VARIABLES, SAMPLE_LEAD } from "@/app/lib/personalization";

const STEP_TYPE_OPTIONS = [
  { type: "connection_request", title: "Connection Request", desc: "Send a LinkedIn invite, optionally with a note", icon: UserPlus, accent: "#6367FF", bg: "#F3F2FF" },
  { type: "message", title: "Message", desc: "Send a direct message to a 1st-degree connection", icon: MessageSquare, accent: "#7C3AED", bg: "#F3EFFE" },
  { type: "inmail", title: "InMail", desc: "Send a paid InMail to an out-of-network profile", icon: Mail, accent: "#0891B2", bg: "#ECFBFE" },
  { type: "profile_visit", title: "Profile Visit", desc: "Visit the lead's profile to trigger a view notification", icon: Eye, accent: "#059669", bg: "#ECFDF5" },
  { type: "like_post", title: "Like Post", desc: "Like the lead's most recent LinkedIn post", icon: ThumbsUp, accent: "#D97706", bg: "#FFFBEB" },
  { type: "follow_up", title: "Follow-up", desc: "Send a follow-up LinkedIn message", icon: RefreshCw, accent: "#E11D48", bg: "#FFF1F2" },
  { type: "email", title: "Email", desc: "Send a cold email through the connected email channel", icon: Mail, accent: "#0A66C2", bg: "#EBF3FB" },
  { type: "condition", title: "Condition", desc: "Branch the sequence based on whether the lead replied", icon: GitBranch, accent: "#7C3AED", bg: "#F3EFFE" },
  { type: "delay", title: "Delay", desc: "Wait before running the next step", icon: Clock, accent: "#6b7280", bg: "#F3F4F6" },
];

function optionFor(type) {
  return STEP_TYPE_OPTIONS.find((o) => o.type === type) || STEP_TYPE_OPTIONS[0];
}

function newClientId() {
  return `temp_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function defaultConfigFor(type) {
  switch (type) {
    case "connection_request":
      return { note: "" };
    case "message":
    case "follow_up":
      return { template: "" };
    case "inmail":
    case "email":
      return { subject: "", template: "" };
    case "delay":
      return { amount: 1, unit: "days" };
    case "condition":
      return { rule: "has_replied" };
    default:
      return {};
  }
}

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

function StepEditor({ step, allSteps, onChange }) {
  const update = (patch) => onChange({ ...step, config: { ...step.config, ...patch } });

  if (step.type === "connection_request") {
    return (
      <div>
        <VariableChips onInsert={(v) => update({ note: (step.config.note || "") + v })} />
        <textarea
          value={step.config.note || ""}
          onChange={(e) => update({ note: e.target.value })}
          placeholder="Optional note to include with the connection request (e.g. Hi {{firstName}}, I'd love to connect!)"
          rows={3}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40 focus:bg-white"
        />
        {step.config.note && (
          <p className="mt-2 text-xs text-gray-400">
            Preview: <span className="text-gray-600">{renderTemplate(step.config.note, SAMPLE_LEAD)}</span>
          </p>
        )}
      </div>
    );
  }

  if (step.type === "message" || step.type === "follow_up") {
    return (
      <div>
        <VariableChips onInsert={(v) => update({ template: (step.config.template || "") + v })} />
        <textarea
          value={step.config.template || ""}
          onChange={(e) => update({ template: e.target.value })}
          placeholder="Hi {{firstName|there}}, ..."
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40 focus:bg-white"
        />
        {step.config.template && (
          <p className="mt-2 text-xs text-gray-400">
            Preview: <span className="text-gray-600">{renderTemplate(step.config.template, SAMPLE_LEAD)}</span>
          </p>
        )}
      </div>
    );
  }

  if (step.type === "inmail" || step.type === "email") {
    return (
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
          rows={4}
          className="w-full rounded-xl border border-gray-200 bg-gray-50/60 p-3 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40 focus:bg-white"
        />
        {(step.config.subject || step.config.template) && (
          <p className="text-xs text-gray-400">
            Preview: <span className="text-gray-600">{renderTemplate(step.config.subject || "", SAMPLE_LEAD)} — {renderTemplate(step.config.template || "", SAMPLE_LEAD)}</span>
          </p>
        )}
      </div>
    );
  }

  if (step.type === "delay") {
    return (
      <div className="flex items-center gap-3">
        <input
          type="number"
          min={1}
          value={step.config.amount ?? 1}
          onChange={(e) => update({ amount: Number(e.target.value) })}
          className="w-24 rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40 focus:bg-white"
        />
        <select
          value={step.config.unit || "days"}
          onChange={(e) => update({ unit: e.target.value })}
          className="rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40"
        >
          <option value="hours">hours</option>
          <option value="days">days</option>
        </select>
        <span className="text-xs text-gray-400">before the next step runs</span>
      </div>
    );
  }

  if (step.type === "condition") {
    const otherSteps = allSteps.filter((s) => s.clientId !== step.clientId);

    return (
      <div className="space-y-3">
        <p className="text-xs text-gray-500">
          If the lead has replied by the time this step runs:
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-green-500">
              Yes → go to
            </label>
            <select
              value={step.branches?.yes || ""}
              onChange={(e) =>
                onChange({ ...step, branches: { ...step.branches, yes: e.target.value || null } })
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40"
            >
              <option value="">Continue to next step</option>
              {otherSteps.map((s) => (
                <option key={s.clientId} value={s.clientId}>
                  {optionFor(s.type).title}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-medium uppercase tracking-wide text-red-400">
              No → go to
            </label>
            <select
              value={step.branches?.no || ""}
              onChange={(e) =>
                onChange({ ...step, branches: { ...step.branches, no: e.target.value || null } })
              }
              className="w-full rounded-xl border border-gray-200 bg-gray-50/60 px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-[#6367FF]/40"
            >
              <option value="">Continue to next step</option>
              {otherSteps.map((s) => (
                <option key={s.clientId} value={s.clientId}>
                  {optionFor(s.type).title}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  }

  return <p className="text-xs text-gray-400">No configuration needed for this step.</p>;
}

export default function SequenceBuilder({ campaignId }) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    if (!campaignId) return;

    fetch(`/api/campaigns/${campaignId}/steps`)
      .then((res) => res.json())
      .then((data) => {
        setSteps(
          (data.items || []).map((s) => ({
            clientId: s.id,
            id: s.id,
            type: s.type,
            config: s.config,
            branches: s.branches,
          })),
        );
        setLoading(false);
      });
  }, [campaignId]);

  const addStep = (type) => {
    setSteps((prev) => [
      ...prev,
      { clientId: newClientId(), type, config: defaultConfigFor(type), branches: type === "condition" ? { yes: null, no: null } : null },
    ]);
    setPickerOpen(false);
    setDirty(true);
  };

  const updateStep = (clientId, patch) => {
    setSteps((prev) => prev.map((s) => (s.clientId === clientId ? patch : s)));
    setDirty(true);
  };

  const removeStep = (clientId) => {
    setSteps((prev) => prev.filter((s) => s.clientId !== clientId));
    setDirty(true);
  };

  const moveStep = (index, direction) => {
    setSteps((prev) => {
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const res = await fetch(`/api/campaigns/${campaignId}/steps`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        steps: steps.map((s) => ({
          clientId: s.clientId,
          type: s.type,
          config: s.config,
          branches: s.branches,
        })),
      }),
    });
    const data = await res.json();

    if (res.ok) {
      setSteps(
        (data.items || []).map((s) => ({
          clientId: s.id,
          id: s.id,
          type: s.type,
          config: s.config,
          branches: s.branches,
        })),
      );
      setDirty(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } else {
      alert(data.message || "Failed to save sequence");
    }

    setSaving(false);
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-400">Loading sequence...</div>;
  }

  return (
    <div className="p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-800">Sequence</h2>
          <p className="text-xs text-gray-400">
            Build the step-by-step outreach flow leads will go through.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !dirty}
          className="flex items-center gap-2 rounded-xl bg-[#6367FF] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#5254e8] disabled:cursor-not-allowed disabled:opacity-40"
        >
          {saving && <Loader2 size={15} className="animate-spin" />}
          {saved && <Check size={15} />}
          {saving ? "Saving..." : saved ? "Saved" : "Save sequence"}
        </button>
      </div>

      <div className="space-y-3">
        {steps.map((step, index) => {
          const opt = optionFor(step.type);
          const Icon = opt.icon;
          const expanded = expandedId === step.clientId;

          return (
            <div key={step.clientId} className="card-option rounded-2xl border border-gray-200 bg-white">
              <button
                onClick={() => setExpandedId(expanded ? null : step.clientId)}
                className="flex w-full items-center gap-4 p-4 text-left"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-gray-400">
                  {index + 1}
                </span>
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: opt.bg }}
                >
                  <Icon size={18} strokeWidth={1.9} style={{ color: opt.accent }} />
                </div>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold text-gray-800">{opt.title}</p>
                  <p className="text-xs text-gray-400">{opt.desc}</p>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveStep(index, -1);
                    }}
                    className="rounded-lg p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-500"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      moveStep(index, 1);
                    }}
                    className="rounded-lg p-1.5 text-gray-300 hover:bg-gray-100 hover:text-gray-500"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeStep(step.clientId);
                    }}
                    className="rounded-lg p-1.5 text-gray-300 hover:bg-red-50 hover:text-red-400"
                  >
                    <Trash2 size={15} />
                  </button>
                  <ChevronDown
                    size={16}
                    className={`ml-1 text-gray-300 transition-transform ${expanded ? "rotate-180" : ""}`}
                  />
                </div>
              </button>

              {expanded && (
                <div className="border-t border-gray-100 p-4">
                  <StepEditor
                    step={step}
                    allSteps={steps}
                    onChange={(next) => updateStep(step.clientId, next)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add step */}
      <div className="relative mt-4">
        <button
          onClick={() => setPickerOpen((v) => !v)}
          className="add-btn flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 py-4 text-sm font-medium text-gray-500 transition hover:border-[#6367FF]/40 hover:text-[#6367FF]"
        >
          <Plus size={16} /> Add step
        </button>

        {pickerOpen && (
          <div className="absolute z-10 mt-2 w-full rounded-2xl border border-gray-100 bg-white p-3 shadow-xl">
            <div className="grid grid-cols-3 gap-2">
              {STEP_TYPE_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                return (
                  <button
                    key={opt.type}
                    onClick={() => addStep(opt.type)}
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
          </div>
        )}
      </div>

      {steps.length === 0 && !pickerOpen && (
        <p className="mt-4 text-center text-xs text-gray-400">
          No steps yet — add your first step above to start building this campaign&apos;s sequence.
        </p>
      )}
    </div>
  );
}
