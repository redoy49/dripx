"use client";

import "@xyflow/react/dist/style.css";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  Panel,
  applyNodeChanges,
  useReactFlow,
} from "@xyflow/react";
import {
  Loader2,
  Check,
  Maximize2,
  Minimize2,
  Focus,
  LayoutGrid,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  BookmarkPlus,
  Layers,
  Sparkles,
  Plus,
  CircleSlash,
} from "lucide-react";
import {
  ACTION_STEP_OPTIONS,
  CONDITION_OPTION,
  UNAVAILABLE_ACTIONS,
  BRANCH_END,
  buildGraph,
  autoLayout,
  newClientId,
  defaultConfigFor,
  applyAddStep,
  applyDeleteStep,
  applyDelayEdit,
} from "./flow/graph";
import { validateSequence, getStepValidationStatus } from "./flow/validation";
import { nodeTypes } from "./flow/FlowNodes";
import { edgeTypes } from "./flow/FlowEdge";
import ActionPicker from "./flow/ActionPicker";
import StepEditorModal from "./flow/StepEditorModal";
import DelayEditorModal from "./flow/DelayEditorModal";
import TemplateGalleryModal from "./flow/TemplateGalleryModal";
import SaveTemplateModal from "./flow/SaveTemplateModal";
import { instantiateTemplateSteps } from "@/app/lib/sequenceTemplates";

function serverStepsToLocal(items) {
  return (items || []).map((s) => ({
    clientId: s.id,
    id: s.id,
    type: s.type,
    config: s.config || {},
    branches: s.branches || null,
    next: s.next || null,
    position: s.position || null,
  }));
}

function FlowCanvasInner({ campaignId }) {
  const [steps, setSteps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [toast, setToast] = useState(null); // { type: 'success' | 'error' | 'warning', message: string }
  const [showHealthDetails, setShowHealthDetails] = useState(false);

  const [pickerTarget, setPickerTarget] = useState(null); // { fromId, handle }
  const [editingStepId, setEditingStepId] = useState(null);
  const [delayEdit, setDelayEdit] = useState(null);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [saveTemplateModalOpen, setSaveTemplateModalOpen] = useState(false);

  const { fitView } = useReactFlow();
  const didInitialFit = useRef(false);

  // Load campaign steps from server
  useEffect(() => {
    if (!campaignId) return;
    let cancelled = false;

    fetch(`/api/campaigns/${campaignId}/steps`)
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        setSteps(serverStepsToLocal(data.items));
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [campaignId]);

  const mutateSteps = useCallback((updater) => {
    setSteps((prev) => updater(prev));
    setDirty(true);
  }, []);

  const handleApplyTemplate = useCallback(
    (template) => {
      const newSteps = instantiateTemplateSteps(template);
      setSteps(newSteps);
      setDirty(true);
      setSaved(false);
      setToast({
        type: "success",
        message: `Template "${template.name}" applied! Review steps and save changes.`,
      });
      setTimeout(() => {
        fitView({ padding: 0.25, duration: 400 });
      }, 150);
    },
    [fitView],
  );

  // --- Real-time Sequence Validation -----------------------------------
  const sequenceValidation = useMemo(() => validateSequence(steps), [steps]);

  const actionStepIndices = useMemo(() => {
    const map = new Map();
    let idx = 1;
    steps.forEach((s) => {
      if (s.type !== "delay" && s.type !== "condition") {
        map.set(s.clientId, idx++);
      }
    });
    return map;
  }, [steps]);

  // --- Graph derivation -------------------------------------------------
  const { graphNodes, graphEdges, forkSources } = useMemo(() => {
    const { nodes, edges } = buildGraph(steps);
    const forks = new Set(
      edges
        .filter((e) => e.sourceHandle === "yes" || e.sourceHandle === "no")
        .map((e) => e.source),
    );
    return { graphNodes: nodes, graphEdges: edges, forkSources: forks };
  }, [steps]);

  const layoutPositions = useMemo(
    () => autoLayout(graphNodes, graphEdges),
    [graphNodes, graphEdges],
  );

  const nodeKindById = useMemo(() => {
    const m = new Map();
    graphNodes.forEach((n) => m.set(n.id, n.kind));
    return m;
  }, [graphNodes]);

  const openPicker = useCallback(
    (addNodeId) => {
      const node = graphNodes.find((n) => n.id === addNodeId && n.kind === "add");
      if (node) setPickerTarget({ fromId: node.fromId, handle: node.handle });
    },
    [graphNodes],
  );

  const openDelayEditor = useCallback(
    (edgeId) => {
      const edge = graphEdges.find((e) => e.id === edgeId);
      if (!edge) return;
      const targetKind = nodeKindById.get(edge.target) || "add";
      const hours = (edge.data.delayMs || 0) / (60 * 60 * 1000);
      const useDays = hours >= 24 && hours % 24 === 0;
      setDelayEdit({
        edgeId,
        sourceId: edge.source,
        handle: edge.data.handle,
        targetKind,
        targetId: edge.target,
        delayStepIds: edge.data.delayStepIds || [],
        amount: useDays ? hours / 24 : Math.round(hours * 10) / 10,
        unit: useDays ? "days" : "hours",
      });
    },
    [graphEdges, nodeKindById],
  );

  const builtNodes = useMemo(() => {
    return graphNodes.map((n) => {
      const pos =
        n.kind === "action" && n.step.position
          ? n.step.position
          : layoutPositions.get(n.id) || { x: 0, y: 0 };

      if (n.kind === "action") {
        return {
          id: n.id,
          type: "action",
          position: pos,
          draggable: true,
          data: {
            step: n.step,
            stepIndex: actionStepIndices.get(n.id) ?? null,
            validation: getStepValidationStatus(sequenceValidation, n.id),
            forks: forkSources.has(n.id),
            onEdit: (id) => setEditingStepId(id),
            onDelete: (id) => {
              mutateSteps((prev) => applyDeleteStep(prev, id));
              setTimeout(() => {
                fitView({ padding: 0.25, duration: 400 });
              }, 120);
            },
          },
        };
      }
      return {
        id: n.id,
        type: "add",
        position: pos,
        draggable: false,
        data: {
          onAdd: openPicker,
          isRoot: n.id === "add__root__main",
          onOpenTemplates: () => setTemplateModalOpen(true),
        },
      };
    });
  }, [
    graphNodes,
    layoutPositions,
    forkSources,
    actionStepIndices,
    sequenceValidation,
    mutateSteps,
    openPicker,
    fitView,
  ]);

  const [rfNodes, setRfNodes] = useState(builtNodes);
  const [prevBuiltNodes, setPrevBuiltNodes] = useState(builtNodes);

  if (builtNodes !== prevBuiltNodes) {
    setPrevBuiltNodes(builtNodes);
    setRfNodes(builtNodes);
  }

  useEffect(() => {
    if (!didInitialFit.current && builtNodes.length > 0) {
      didInitialFit.current = true;
      requestAnimationFrame(() => fitView({ padding: 0.25, duration: 0 }));
    }
  }, [builtNodes, fitView]);

  const rfEdges = useMemo(
    () =>
      graphEdges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        type: "step",
        data: {
          ...e.data,
          onEditDelay: nodeKindById.get(e.target) ? () => openDelayEditor(e.id) : undefined,
        },
      })),
    [graphEdges, nodeKindById, openDelayEditor],
  );

  const onNodesChange = useCallback(
    (changes) => setRfNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onNodeDragStop = useCallback(
    (_event, node) => {
      if (node.type !== "action") return;
      mutateSteps((prev) =>
        prev.map((s) =>
          s.clientId === node.id
            ? { ...s, position: { x: node.position.x, y: node.position.y } }
            : s,
        ),
      );
    },
    [mutateSteps],
  );

  // Auto-align layout resets saved manual positions to crisp hierarchical structure
  const handleAutoAlign = useCallback(() => {
    mutateSteps((prev) => prev.map((s) => ({ ...s, position: null })));
    requestAnimationFrame(() => {
      fitView({ padding: 0.25, duration: 400 });
    });
    setToast({ type: "success", message: "Sequence nodes auto-aligned" });
    setTimeout(() => setToast(null), 2500);
  }, [mutateSteps, fitView]);

  // --- Add / edit / delete -----------------------------------------------
  const handlePickType = useCallback(
    (type) => {
      if (!pickerTarget) return;
      const newStep = {
        clientId: newClientId(),
        type,
        config: defaultConfigFor(type),
        branches: type === "condition" ? { yes: BRANCH_END, no: BRANCH_END } : null,
      };
      mutateSteps((prev) => applyAddStep(prev, pickerTarget, newStep));
      setPickerTarget(null);
      setTimeout(() => {
        fitView({ padding: 0.25, duration: 400 });
      }, 120);
    },
    [pickerTarget, mutateSteps, fitView],
  );

  const addAtMainTip = useCallback(
    (type) => {
      const mainTip =
        graphNodes.find((n) => n.kind === "add" && n.handle === "main") ||
        graphNodes.find((n) => n.kind === "add");
      if (!mainTip) return;
      const newStep = {
        clientId: newClientId(),
        type,
        config: defaultConfigFor(type),
        branches: type === "condition" ? { yes: BRANCH_END, no: BRANCH_END } : null,
      };
      mutateSteps((prev) =>
        applyAddStep(prev, { fromId: mainTip.fromId, handle: mainTip.handle }, newStep),
      );
      setTimeout(() => {
        fitView({ padding: 0.25, duration: 400 });
      }, 120);
    },
    [graphNodes, mutateSteps, fitView],
  );

  const editingStep = editingStepId ? steps.find((s) => s.clientId === editingStepId) : null;

  const handleStepChange = useCallback(
    (updated) => {
      mutateSteps((prev) => prev.map((s) => (s.clientId === updated.clientId ? updated : s)));
    },
    [mutateSteps],
  );

  const handleDelaySave = useCallback(
    (value) => {
      if (!delayEdit) return;
      mutateSteps((prev) => applyDelayEdit(prev, delayEdit, value));
      setDelayEdit(null);
    },
    [delayEdit, mutateSteps],
  );

  // --- Save Sequence Handler ---------------------------------------------
  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    try {
      const res = await fetch(`/api/campaigns/${campaignId}/steps`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          steps: steps.map((s) => ({
            clientId: s.clientId,
            type: s.type,
            config: s.config,
            branches: s.branches,
            next: s.next,
            position: s.position,
          })),
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setSteps(serverStepsToLocal(data.items));
        setDirty(false);
        setSaved(true);
        setToast({
          type: sequenceValidation.errorCount > 0 ? "warning" : "success",
          message:
            sequenceValidation.errorCount > 0
              ? `Saved as draft (${sequenceValidation.errorCount} step issue(s) need attention before launch)`
              : "Sequence saved successfully!",
        });
        setTimeout(() => {
          setSaved(false);
          setToast(null);
        }, 3500);
      } else {
        setToast({
          type: "error",
          message: data.message || "Failed to save sequence",
        });
      }
    } catch {
      setToast({
        type: "error",
        message: "Network error saving sequence. Please try again.",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="py-20 text-center text-sm text-gray-400">Loading sequence...</div>;
  }

  return (
    <div className={fullscreen ? "fixed inset-0 z-40 bg-white" : "relative"}>
      <div
        className={`relative w-full overflow-hidden ${fullscreen ? "h-screen" : "h-[74vh] rounded-b-2xl"
          } bg-[#FAFAFC]`}
      >
        <ReactFlow
          nodes={rfNodes}
          edges={rfEdges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onNodeDragStop={onNodeDragStop}
          nodesConnectable={false}
          elementsSelectable
          minZoom={0.2}
          maxZoom={1.5}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={18} size={1.2} color="#dedde6" />
          <Controls
            position="bottom-right"
            showInteractive={false}
            className="!rounded-2xl !border !border-gray-100/90 !bg-white !p-1 !shadow-lg [&_button]:!rounded-full [&_button]:!border-0 [&_button]:!text-gray-500 [&_button:hover]:!bg-gray-100"
          />

          {/* Left Sidebar: Step Type Picker (Matches Reference Image 2) */}
          <Panel position="top-left" className="!ml-5 !mt-5">
            <div className="w-56 max-h-[66vh] overflow-y-auto rounded-2xl border border-gray-100/90 bg-white p-4 shadow-xl">
              <p className="mb-2 px-1 text-xs font-semibold text-gray-500">
                Actions:
              </p>
              <div className="space-y-0.5">
                {ACTION_STEP_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => addAtMainTip(opt.type)}
                      className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-[13px] font-medium text-gray-700 transition hover:bg-[#6367FF]/5 hover:text-[#6367FF]"
                    >
                      <Icon size={15} strokeWidth={1.8} className="text-gray-400 group-hover:text-[#6367FF] transition" />
                      <span>{opt.title}</span>
                    </button>
                  );
                })}
                {UNAVAILABLE_ACTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.title}
                      title="Coming soon"
                      className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-[13px] font-medium text-gray-300"
                    >
                      <Icon size={15} strokeWidth={1.8} className="text-gray-300" />
                      <span>{opt.title}</span>
                    </div>
                  );
                })}
              </div>

              <p className="mb-2 mt-4 px-1 text-xs font-semibold text-gray-500">
                Conditions:
              </p>
              <button
                onClick={() => addAtMainTip(CONDITION_OPTION.type)}
                className="group flex w-full items-center gap-2.5 rounded-xl px-2.5 py-1.5 text-left text-[13px] font-medium text-gray-700 transition hover:bg-[#6367FF]/5 hover:text-[#6367FF]"
              >
                <CONDITION_OPTION.icon size={15} strokeWidth={1.8} className="text-gray-400 group-hover:text-[#6367FF] transition" />
                <span>{CONDITION_OPTION.title}</span>
              </button>
            </div>
          </Panel>

          {/* Top-Right Control Toolbar (All buttons rounded-full) */}
          <Panel position="top-right" className="!mr-5 !mt-5">
            <div className="flex items-center gap-2 rounded-full border border-gray-100/90 bg-white/95 p-1.5 shadow-lg backdrop-blur-xs">
              <button
                onClick={() => setTemplateModalOpen(true)}
                title="Load pre-built sequence template"
                className="flex items-center gap-1.5 rounded-full bg-[#6367FF] px-4 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#5254e8] active:scale-95 shrink-0"
              >
                <Sparkles size={14} />
                <span>Templates</span>
              </button>

              <button
                onClick={() => setSaveTemplateModalOpen(true)}
                disabled={steps.length === 0}
                title="Save current sequence as reusable template"
                className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 shadow-2xs transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <BookmarkPlus size={14} className="text-gray-500" />
                <span className="hidden sm:inline">Save as Template</span>
              </button>

              <button
                onClick={() => fitView({ padding: 0.25, duration: 350 })}
                title="Center sequence in view"
                className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 shadow-2xs transition hover:bg-gray-50"
              >
                <Focus size={14} className="text-gray-500" />
                <span>Center</span>
              </button>

              <button
                onClick={handleAutoAlign}
                title="Automatically organize nodes in hierarchical order"
                className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-semibold text-gray-600 shadow-2xs transition hover:bg-gray-50"
              >
                <LayoutGrid size={14} className="text-gray-500" />
                <span>Auto-align</span>
              </button>

              <button
                onClick={() => setFullscreen((v) => !v)}
                title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                className="flex items-center justify-center rounded-full border border-gray-200 bg-white p-2 text-gray-500 shadow-2xs transition hover:bg-gray-50"
              >
                {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>

              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white shadow-sm transition ${dirty
                  ? "bg-[#6367FF] hover:bg-[#5254e8]"
                  : "cursor-not-allowed bg-gray-300 text-gray-100"
                  }`}
              >
                {saving && <Loader2 size={13} className="animate-spin" />}
                {saved && <Check size={13} strokeWidth={2.5} />}
                {!saving && !saved && dirty && (
                  <span className="h-2 w-2 rounded-full bg-amber-300" />
                )}
                <span>
                  {saving
                    ? "Saving..."
                    : saved
                      ? "Saved"
                      : dirty
                        ? "Save changes"
                        : "Sequence saved"}
                </span>
              </button>
            </div>
          </Panel>

          {/* Centered Add & End Button and Browse Templates (When sequence is empty) */}
          {steps.length === 0 && !loading && (
            <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center">
              <div className="pointer-events-auto flex flex-col items-center gap-3.5">
                {/* Centered Add | End Split Pill */}
                <div className="flex items-center overflow-hidden rounded-full border border-gray-200/90 bg-white shadow-md transition hover:border-[#6367FF]/50 hover:shadow-lg">
                  <button
                    onClick={() => openPicker("add__root__main")}
                    className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-[#6367FF] transition hover:bg-[#6367FF]/5 active:scale-95"
                  >
                    <Plus size={15} className="text-[#6367FF]" />
                    <span>Add</span>
                  </button>
                  <div className="h-4 w-px bg-gray-200" />
                  <div className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-medium text-gray-400">
                    <CircleSlash
                      size={14} className="text-gray-400" />
                    <span>End</span>
                  </div>
                </div>

                {/* Centered Browse Sequence Templates Button */}
                <button
                  onClick={() => setTemplateModalOpen(true)}
                  className="flex items-center gap-2 rounded-full border border-[#6367FF]/30 bg-white px-5 py-2.5 text-xs font-semibold text-[#6367FF] shadow-sm backdrop-blur-xs transition hover:bg-[#6367FF] hover:text-white active:scale-95"
                >
                  <Sparkles size={14} />
                  <span>Browse sequence templates</span>
                </button>
              </div>
            </div>
          )}

          {/* Bottom-Left Sequence Health & Readiness Banner */}
          <Panel position="bottom-left" className="!ml-5 !mb-5">
            <div className="max-w-md">
              {steps.length === 0 ? (
                <div className="flex items-center gap-2 rounded-2xl border border-gray-200 bg-white/95 px-3.5 py-2 text-xs font-medium text-gray-600 shadow-md backdrop-blur-xs">
                  <Sparkles size={14} className="text-[#6367FF] shrink-0" />
                  <span>Click <strong>+ Add</strong> or <strong>Templates</strong> to begin your sequence</span>
                </div>
              ) : sequenceValidation.errorCount === 0 &&
                sequenceValidation.actionStepCount > 0 ? (
                <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/95 px-3.5 py-2 text-xs font-semibold text-emerald-800 shadow-lg backdrop-blur-xs">
                  <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
                  <span>
                    Sequence ready for outreach ({sequenceValidation.actionStepCount} steps)
                  </span>
                </div>
              ) : (
                <div className="rounded-2xl border border-amber-200 bg-white/95 p-3 shadow-xl backdrop-blur-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-800">
                      <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                      <span>
                        {sequenceValidation.errorCount > 0
                          ? `${sequenceValidation.errorCount} step issue(s) need attention`
                          : "Empty sequence — add an action step"}
                      </span>
                    </div>
                    {sequenceValidation.errorCount > 0 && (
                      <button
                        onClick={() => setShowHealthDetails((v) => !v)}
                        className="text-[11px] font-semibold text-[#6367FF] hover:underline"
                      >
                        {showHealthDetails ? "Hide" : "Details"}
                      </button>
                    )}
                  </div>

                  {showHealthDetails && sequenceValidation.allErrors.length > 0 && (
                    <div className="mt-2 space-y-1.5 border-t border-gray-100 pt-2 max-h-36 overflow-y-auto">
                      {sequenceValidation.allErrors.map((err, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-between rounded-lg bg-gray-50 px-2 py-1 text-[11px]"
                        >
                          <span className="truncate text-gray-700">{err.message}</span>
                          {err.stepId && (
                            <button
                              onClick={() => setEditingStepId(err.stepId)}
                              className="ml-2 font-bold text-[#6367FF] hover:underline shrink-0"
                            >
                              Configure →
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </Panel>

          {/* Floating Toast Notification */}
          {toast && (
            <Panel position="top-center">
              <div
                className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-xs font-semibold shadow-xl backdrop-blur-sm ${toast.type === "success"
                  ? "border border-emerald-200 bg-emerald-50 text-emerald-800"
                  : toast.type === "warning"
                    ? "border border-amber-200 bg-amber-50 text-amber-800"
                    : "border border-rose-200 bg-rose-50 text-rose-800"
                  }`}
              >
                {toast.type === "success" ? (
                  <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
                ) : toast.type === "warning" ? (
                  <AlertTriangle size={14} className="text-amber-600 shrink-0" />
                ) : (
                  <AlertCircle size={14} className="text-rose-600 shrink-0" />
                )}
                <span>{toast.message}</span>
                <button
                  onClick={() => setToast(null)}
                  className="ml-2 text-gray-400 hover:text-gray-600"
                >
                  <X size={12} />
                </button>
              </div>
            </Panel>
          )}
        </ReactFlow>
      </div>

      <ActionPicker
        open={!!pickerTarget}
        onClose={() => setPickerTarget(null)}
        onPick={handlePickType}
      />
      <StepEditorModal
        open={!!editingStep}
        step={editingStep}
        onClose={() => setEditingStepId(null)}
        onChange={handleStepChange}
      />
      <DelayEditorModal
        open={!!delayEdit}
        initial={delayEdit}
        onClose={() => setDelayEdit(null)}
        onSave={handleDelaySave}
      />
      <TemplateGalleryModal
        open={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        onSelectTemplate={handleApplyTemplate}
        currentStepsCount={steps.length}
      />
      <SaveTemplateModal
        open={saveTemplateModalOpen}
        onClose={() => setSaveTemplateModalOpen(false)}
        currentSteps={steps}
        onSaved={(newTpl) => {
          setToast({
            type: "success",
            message: `Template "${newTpl.name}" saved successfully! Available in your gallery.`,
          });
        }}
      />
    </div>
  );
}

export default function SequenceBuilder({ campaignId }) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner campaignId={campaignId} />
    </ReactFlowProvider>
  );
}
