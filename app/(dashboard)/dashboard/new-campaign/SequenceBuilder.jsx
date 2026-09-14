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
import { Loader2, Check, Maximize2, Minimize2 } from "lucide-react";
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
import { nodeTypes } from "./flow/FlowNodes";
import { edgeTypes } from "./flow/FlowEdge";
import ActionPicker from "./flow/ActionPicker";
import StepEditorModal from "./flow/StepEditorModal";
import DelayEditorModal from "./flow/DelayEditorModal";

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

  const [pickerTarget, setPickerTarget] = useState(null); // { fromId, handle }
  const [editingStepId, setEditingStepId] = useState(null);
  const [delayEdit, setDelayEdit] = useState(null); // { edgeId, sourceId, handle, targetKind, targetId, delayStepIds, amount, unit }

  const { fitView } = useReactFlow();
  const didInitialFit = useRef(false);

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

  // --- Graph derivation -------------------------------------------------
  const { graphNodes, graphEdges, forkSources } = useMemo(() => {
    const { nodes, edges } = buildGraph(steps);
    const forks = new Set(edges.filter((e) => e.sourceHandle === "yes" || e.sourceHandle === "no").map((e) => e.source));
    return { graphNodes: nodes, graphEdges: edges, forkSources: forks };
  }, [steps]);

  const layoutPositions = useMemo(() => autoLayout(graphNodes, graphEdges), [graphNodes, graphEdges]);

  const nodeKindById = useMemo(() => {
    const m = new Map();
    graphNodes.forEach((n) => m.set(n.id, n.kind));
    return m;
  }, [graphNodes]);

  const openPicker = useCallback((addNodeId) => {
    const node = graphNodes.find((n) => n.id === addNodeId && n.kind === "add");
    if (node) setPickerTarget({ fromId: node.fromId, handle: node.handle });
  }, [graphNodes]);

  const openDelayEditor = useCallback((edgeId) => {
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
  }, [graphEdges, nodeKindById]);

  const [rfNodes, setRfNodes] = useState([]);

  useEffect(() => {
    const built = graphNodes.map((n) => {
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
            forks: forkSources.has(n.id),
            onEdit: (id) => setEditingStepId(id),
            onDelete: (id) => mutateSteps((prev) => applyDeleteStep(prev, id)),
          },
        };
      }
      return {
        id: n.id,
        type: "add",
        position: pos,
        draggable: false,
        data: { onAdd: openPicker },
      };
    });
    setRfNodes(built);

    if (!didInitialFit.current && built.length > 0) {
      didInitialFit.current = true;
      requestAnimationFrame(() => fitView({ padding: 0.25, duration: 0 }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [graphNodes, layoutPositions, forkSources, mutateSteps, openPicker]);

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

  const onNodesChange = useCallback((changes) => setRfNodes((nds) => applyNodeChanges(changes, nds)), []);

  const onNodeDragStop = useCallback((_event, node) => {
    if (node.type !== "action") return;
    mutateSteps((prev) =>
      prev.map((s) => (s.clientId === node.id ? { ...s, position: { x: node.position.x, y: node.position.y } } : s)),
    );
  }, [mutateSteps]);

  // --- Add / edit / delete -----------------------------------------------
  const handlePickType = useCallback((type) => {
    if (!pickerTarget) return;
    const newStep = {
      clientId: newClientId(),
      type,
      config: defaultConfigFor(type),
      branches: type === "condition" ? { yes: BRANCH_END, no: BRANCH_END } : null,
    };
    mutateSteps((prev) => applyAddStep(prev, pickerTarget, newStep));
    setPickerTarget(null);
  }, [pickerTarget, mutateSteps]);

  const addAtMainTip = useCallback((type) => {
    const mainTip = graphNodes.find((n) => n.kind === "add" && n.handle === "main");
    if (!mainTip) return;
    const newStep = {
      clientId: newClientId(),
      type,
      config: defaultConfigFor(type),
      branches: type === "condition" ? { yes: BRANCH_END, no: BRANCH_END } : null,
    };
    mutateSteps((prev) => applyAddStep(prev, { fromId: mainTip.fromId, handle: mainTip.handle }, newStep));
  }, [graphNodes, mutateSteps]);

  const editingStep = editingStepId ? steps.find((s) => s.clientId === editingStepId) : null;

  const handleStepChange = useCallback((updated) => {
    mutateSteps((prev) => prev.map((s) => (s.clientId === updated.clientId ? updated : s)));
  }, [mutateSteps]);

  const handleDelaySave = useCallback((value) => {
    if (!delayEdit) return;
    mutateSteps((prev) => applyDelayEdit(prev, delayEdit, value));
    setDelayEdit(null);
  }, [delayEdit, mutateSteps]);

  // --- Save ---------------------------------------------------------------
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
    <div className={fullscreen ? "fixed inset-0 z-40 bg-white" : "relative"}>
      <div className={`relative w-full overflow-hidden ${fullscreen ? "h-screen" : "h-[74vh] rounded-b-2xl"} bg-[#FAFAFC]`}>
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
            className="!rounded-2xl !border !border-gray-100 !bg-white !shadow-lg [&_button]:!border-gray-100 [&_button]:!text-gray-500"
          />

          {/* Sidebar */}
          <Panel position="top-left">
            <div className="w-56 max-h-[68vh] overflow-y-auto rounded-2xl border border-gray-100 bg-white p-4 shadow-xl">
              <p className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Actions
              </p>
              <div className="space-y-0.5">
                {ACTION_STEP_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <button
                      key={opt.type}
                      onClick={() => addAtMainTip(opt.type)}
                      className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] text-gray-600 transition hover:bg-gray-50"
                    >
                      <Icon size={15} strokeWidth={1.8} className="text-gray-400" />
                      {opt.title}
                    </button>
                  );
                })}
                {UNAVAILABLE_ACTIONS.map((opt) => {
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.title}
                      title="Coming soon"
                      className="flex w-full cursor-not-allowed items-center gap-2.5 rounded-lg px-2 py-1.5 text-[13px] text-gray-300"
                    >
                      <Icon size={15} strokeWidth={1.8} />
                      {opt.title}
                    </div>
                  );
                })}
              </div>

              <p className="mb-2 mt-4 px-1 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Conditions
              </p>
              <button
                onClick={() => addAtMainTip(CONDITION_OPTION.type)}
                className="flex w-full items-center gap-2.5 rounded-lg px-2 py-1.5 text-left text-[13px] text-gray-600 transition hover:bg-gray-50"
              >
                <CONDITION_OPTION.icon size={15} strokeWidth={1.8} className="text-gray-400" />
                {CONDITION_OPTION.title}
              </button>
            </div>
          </Panel>

          {/* Save / fullscreen */}
          <Panel position="top-right">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFullscreen((v) => !v)}
                className="flex items-center justify-center rounded-xl border border-gray-100 bg-white p-2.5 text-gray-500 shadow-lg transition hover:bg-gray-50"
              >
                {fullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !dirty}
                className="flex items-center gap-2 rounded-xl bg-[#6367FF] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[#5254e8] disabled:cursor-not-allowed disabled:opacity-40"
              >
                {saving && <Loader2 size={15} className="animate-spin" />}
                {saved && <Check size={15} />}
                {saving ? "Saving..." : saved ? "Saved" : "Save sequence"}
              </button>
            </div>
          </Panel>
        </ReactFlow>
      </div>

      <ActionPicker open={!!pickerTarget} onClose={() => setPickerTarget(null)} onPick={handlePickType} />
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
