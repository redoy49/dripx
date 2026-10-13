"use client";

import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath } from "@xyflow/react";
import { Clock } from "lucide-react";
import { formatDelay } from "./graph";

export function StepEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  markerEnd,
}) {
  const [path, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  const strokeColor =
    data?.color === "green" ? "#10b981" : data?.color === "red" ? "#f43f5e" : "#cbd5e1";
  const delayLabel = formatDelay(data?.delayMs || 0);

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: strokeColor,
          strokeWidth: 2,
          strokeDasharray: "4 4",
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: "all",
          }}
          className="nodrag nopan flex flex-col items-center gap-1.5"
        >
          {data?.label && (
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-2xs ${
                data.color === "green"
                  ? "border border-emerald-300 bg-emerald-50 text-emerald-600"
                  : "border border-rose-200 bg-rose-50 text-rose-500"
              }`}
            >
              {data.label}
            </span>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              data?.onEditDelay?.(id);
            }}
            title="Click to edit step delay"
            className="group flex items-center gap-1.5 rounded-full border border-purple-200 bg-[#F4F3FF] px-3 py-1 text-xs font-semibold text-[#6367FF] shadow-xs transition hover:bg-[#6367FF] hover:text-white"
          >
            <Clock size={12} className="text-[#6367FF] group-hover:text-white transition group-hover:rotate-45" />
            <span>{delayLabel}</span>
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const edgeTypes = { step: StepEdge };
