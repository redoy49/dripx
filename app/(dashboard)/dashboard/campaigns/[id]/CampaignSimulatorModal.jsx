"use client";

import { useState, useEffect } from "react";
import {
  X,
  Play,
  FlaskConical,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Mail,
  User,
  Loader2,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

export default function CampaignSimulatorModal({ campaignId, isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [simulateReplied, setSimulateReplied] = useState(false);
  const [simulation, setSimulation] = useState(null);
  const [error, setError] = useState(null);

  // Fetch leads and run initial dry-run simulation cleanly on open
  useEffect(() => {
    if (!isOpen) return;

    let ignore = false;
    fetch(`/api/campaigns/${campaignId}/leads`)
      .then((res) => res.json())
      .then((data) => {
        if (ignore) return null;
        const items = data.items || [];
        setLeads(items);
        const leadId = items[0]?.leadId;
        if (leadId) {
          setSelectedLeadId(leadId);
          return fetch(`/api/campaigns/${campaignId}/simulate`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ leadId, simulateReplied: false }),
          }).then((r) => r.json());
        }
        return null;
      })
      .then((simData) => {
        if (ignore || !simData) return;
        if (simData.simulation) {
          setSimulation(simData.simulation);
        } else if (simData.message) {
          setError(simData.message);
        }
      })
      .catch((err) => {
        if (!ignore) {
          console.error("Failed to load leads for simulator:", err);
          setError(err.message);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [campaignId, isOpen]);

  const handleRunSimulation = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/campaigns/${campaignId}/simulate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLeadId || undefined,
          simulateReplied,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || "Simulation failed");
      }
      setSimulation(data.simulation);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-violet-50/50 to-indigo-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-violet-600 text-white flex items-center justify-center shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">Sequence Dispatch Simulator</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-violet-100 text-violet-700 tracking-wider">
                  Dry-Run Mode
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Test sequence progression, variables, delays, and branch logic safely.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-white/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Safety Guarantee Banner */}
        <div className="bg-emerald-50/90 border-b border-emerald-100 px-6 py-2.5 flex items-center gap-2.5 text-xs text-emerald-800">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Zero-Mutation Guarantee:</strong> 0 real emails sent, 0 LinkedIn calls, 0 database writes. Simulated events are strictly separated from real campaign analytics.
          </span>
        </div>

        {/* Controls Toolbar */}
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Lead Picker */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Simulate Prospect
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => setSelectedLeadId(e.target.value)}
                className="px-3 py-1.5 text-xs bg-white border border-gray-200 rounded-xl font-medium text-gray-700 focus:outline-hidden focus:ring-2 focus:ring-violet-400 min-w-[200px]"
              >
                {leads.map((item) => (
                  <option key={item.leadId} value={item.leadId}>
                    {item.lead?.firstName ? `${item.lead.firstName} ${item.lead.lastName || ""}` : item.lead?.email || "Lead"}
                    {item.lead?.company ? ` (${item.lead.company})` : ""}
                  </option>
                ))}
                {leads.length === 0 && <option value="">No enrolled leads</option>}
              </select>
            </div>

            {/* Condition Branch Toggle */}
            <div>
              <label className="block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1">
                Condition Branch Test
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-gray-700 py-1">
                <input
                  type="checkbox"
                  checked={simulateReplied}
                  onChange={(e) => setSimulateReplied(e.target.checked)}
                  className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                />
                <span>Simulate &quot;Prospect Replied&quot; (YES branch)</span>
              </label>
            </div>
          </div>

          <button
            onClick={handleRunSimulation}
            disabled={loading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition"
          >
            {loading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Play className="w-3.5 h-3.5 fill-current" />
            )}
            <span>Run Simulation</span>
          </button>
        </div>

        {/* Content Body: Timeline & Previews */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-100 text-xs text-rose-700 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {simulation && (
            <>
              {/* Executive Summary Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Total Sequence Touchpoints
                  </span>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {simulation.totalSteps} steps
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Estimated Sequence Duration
                  </span>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {simulation.estimatedTotalDuration}
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-100">
                  <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
                    Validation Health
                  </span>
                  <p className="text-xl font-bold mt-1 flex items-center gap-1.5">
                    {simulation.warnings?.length === 0 ? (
                      <span className="text-emerald-600 flex items-center gap-1 text-sm font-semibold">
                        <CheckCircle2 className="w-4 h-4" /> 100% Ready
                      </span>
                    ) : (
                      <span className="text-amber-600 flex items-center gap-1 text-sm font-semibold">
                        <AlertTriangle className="w-4 h-4" /> {simulation.warnings.length} Warnings
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Warnings List */}
              {simulation.warnings?.length > 0 && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/60 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Advisory Warnings Detected:</span>
                  </div>
                  <ul className="text-xs text-amber-700 list-disc list-inside space-y-1 pl-1">
                    {simulation.warnings.map((w, idx) => (
                      <li key={idx}>{w}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Step Timeline */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
                  Simulated Execution Timeline
                </h3>

                {simulation.timeline?.map((step) => {
                  const isEmail = step.channel === "email";
                  const isLinkedin = step.channel === "linkedin";

                  return (
                    <div
                      key={step.stepId}
                      className="p-5 rounded-2xl border border-gray-200/80 bg-white shadow-2xs space-y-3 relative"
                    >
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl text-xs font-bold ${
                            isEmail
                              ? "bg-violet-50 text-violet-700"
                              : isLinkedin
                                ? "bg-blue-50 text-blue-700"
                                : "bg-gray-100 text-gray-700"
                          }`}>
                            {isEmail ? <Mail className="w-4 h-4" /> : isLinkedin ? <FaLinkedin className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-bold text-gray-900 text-sm">
                              {step.title}
                            </span>
                            <span className="text-gray-400 text-xs ml-2">
                              (Step {step.order})
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-gray-100 text-gray-600">
                            <Clock className="w-3 h-3 text-gray-400" />
                            Delay: {step.delayBefore}
                          </span>
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            step.status === "VALID"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                              : "bg-amber-50 text-amber-700 border border-amber-100"
                          }`}>
                            {step.status}
                          </span>
                        </div>
                      </div>

                      {/* Rendered Subject */}
                      {step.renderedSubject && (
                        <div className="text-xs bg-gray-50/70 p-2.5 rounded-xl border border-gray-100">
                          <span className="font-semibold text-gray-500 mr-2">Subject:</span>
                          <span className="font-medium text-gray-800">{step.renderedSubject}</span>
                        </div>
                      )}

                      {/* Rendered Body */}
                      {step.renderedBody && (
                        <div className="text-xs bg-gray-50/70 p-3 rounded-xl border border-gray-100 whitespace-pre-wrap font-sans text-gray-700 leading-relaxed">
                          {step.renderedBody}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-semibold transition"
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}
