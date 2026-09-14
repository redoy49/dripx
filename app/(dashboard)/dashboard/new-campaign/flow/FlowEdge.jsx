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
    borderRadius: 14,
  });

  const color = data?.color === "green" ? "#16a34a" : data?.color === "red" ? "#dc2626" : "#d1d5db";
  const delayLabel = formatDelay(data?.delayMs || 0);

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{ stroke: color, strokeWidth: 1.6, strokeDasharray: "4 4" }}
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
              className={`text-[11px] font-semibold ${
                data.color === "green" ? "text-green-600" : "text-red-500"
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
            className="flex items-center gap-1 rounded-full border border-[#6367FF]/25 bg-[#F3F2FF] px-2.5 py-1 text-[11px] font-medium text-[#6367FF] shadow-sm transition hover:bg-[#6367FF]/10"
          >
            <Clock size={11} /> {delayLabel}
          </button>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const edgeTypes = { step: StepEdge };
