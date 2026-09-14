"use client";

import { useState, useRef, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import { MoreHorizontal, Trash2, Pencil, Plus, CircleSlash } from "lucide-react";
import { stepOption, stepSummary } from "./graph";

function useClickAway(onAway) {
  const ref = useRef(null);
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) onAway();
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [onAway]);
  return ref;
}

export function ActionNode({ id, data }) {
  const { step, forks, onEdit, onDelete } = data;
  const opt = stepOption(step.type);
  const Icon = opt.icon;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useClickAway(() => setMenuOpen(false));

  return (
    <div className="nodrag-children w-[260px] rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="!h-2 !w-2 !border-2 !border-white !bg-gray-300"
      />

      <div className="flex items-center gap-3 p-3.5">
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: opt.bg }}
        >
          <Icon size={17} strokeWidth={1.9} style={{ color: opt.accent }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13.5px] font-semibold text-gray-800">{opt.title}</p>
          <p className="truncate text-[11px] text-gray-400">{stepSummary(step)}</p>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="rounded-lg p-1 text-gray-300 transition hover:bg-gray-100 hover:text-gray-500"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-20 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onEdit(id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-gray-600 hover:bg-gray-50"
              >
                <Pencil size={13} /> Edit
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onDelete(id);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-red-500 hover:bg-red-50"
              >
                <Trash2 size={13} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {forks ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            isConnectable={false}
            style={{ left: "32%" }}
            className="!h-2 !w-2 !border-2 !border-white !bg-red-400"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            isConnectable={false}
            style={{ left: "68%" }}
            className="!h-2 !w-2 !border-2 !border-white !bg-green-400"
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={false}
          className="!h-2 !w-2 !border-2 !border-white !bg-gray-300"
        />
      )}
    </div>
  );
}

export function AddNode({ id, data }) {
  const { onAdd } = data;

  return (
    <div className="flex overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-white shadow-sm">
      <Handle type="target" position={Position.Top} isConnectable={false} className="!opacity-0" />
      <button
        onClick={() => onAdd(id)}
        className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#6367FF] transition hover:bg-[#6367FF]/5"
      >
        <Plus size={14} /> Add
      </button>
      <div className="w-px bg-gray-200" />
      <div className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-gray-400">
        <CircleSlash size={14} /> End
      </div>
    </div>
  );
}

export const nodeTypes = { action: ActionNode, add: AddNode };
