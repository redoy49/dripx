"use client";

import { useState, useRef, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  MoreHorizontal,
  Trash2,
  Pencil,
  Plus,
  AlertCircle,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { FiLinkedin } from "react-icons/fi";
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

export function ActionNode({ id, data, selected }) {
  const { step, forks, onEdit, onDelete, stepIndex, validation } = data;
  const opt = stepOption(step.type);
  const Icon = opt.icon;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useClickAway(() => setMenuOpen(false));

  const isEmail = step.type === "email";
  const hasError = validation?.hasError;
  const hasWarning = validation?.hasWarning && !hasError;

  return (
    <div
      className={`nodrag-children w-[270px] rounded-2xl bg-white transition-all ${
        hasError
          ? "border-2 border-rose-300 ring-4 ring-rose-50 shadow-md"
          : selected
            ? "border-2 border-[#6367FF] ring-4 ring-[#6367FF]/10 shadow-lg"
            : "border border-gray-200/90 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:border-[#6367FF]/50 hover:shadow-md"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#6367FF] transition"
      />

      {/* Main Single-Row Card Body (Matches reference Dripify UI) */}
      <div className="flex items-center gap-3 px-3.5 py-3">
        {/* Left Circular Icon Badge */}
        <div
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-xs transition"
          style={{ background: opt.accent || "#6367FF" }}
        >
          <Icon size={16} strokeWidth={2} />
        </div>

        {/* Center Title & Context */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <p className="truncate text-[13.5px] font-semibold text-gray-800">{opt.title}</p>
            {typeof stepIndex === "number" && (
              <span className="rounded-md bg-gray-100 px-1.5 py-0.5 text-[9px] font-bold text-gray-400">
                #{stepIndex}
              </span>
            )}
          </div>
          <p className="truncate text-[11px] text-gray-400" title={stepSummary(step)}>
            {stepSummary(step)}
          </p>
        </div>

        {/* Right Menu Button */}
        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <MoreHorizontal size={15} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 w-36 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-xl">
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

      {/* Validation Issues Pill */}
      {hasError && (
        <div className="px-3 pb-2.5">
          <button
            onClick={() => onEdit(id)}
            title="Click to resolve this issue in step editor"
            className="flex w-full items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-2 py-1 text-left text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <AlertCircle size={12} className="shrink-0 text-rose-600" />
            <span className="truncate">{validation.errorText}</span>
          </button>
        </div>
      )}

      {hasWarning && (
        <div className="px-3 pb-2.5">
          <button
            onClick={() => onEdit(id)}
            title="Click to inspect this advisory in step editor"
            className="flex w-full items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 px-2 py-1 text-left text-[11px] font-medium text-amber-700 transition hover:bg-amber-100"
          >
            <AlertTriangle size={12} className="shrink-0 text-amber-600" />
            <span className="truncate">{validation.warningText}</span>
          </button>
        </div>
      )}

      {forks ? (
        <>
          <Handle
            type="source"
            position={Position.Bottom}
            id="no"
            isConnectable={false}
            style={{ left: "32%" }}
            className="!h-2.5 !w-2.5 !border-2 !border-white !bg-rose-500 shadow-sm"
          />
          <Handle
            type="source"
            position={Position.Bottom}
            id="yes"
            isConnectable={false}
            style={{ left: "68%" }}
            className="!h-2.5 !w-2.5 !border-2 !border-white !bg-emerald-500 shadow-sm"
          />
        </>
      ) : (
        <Handle
          type="source"
          position={Position.Bottom}
          isConnectable={false}
          className="!h-2.5 !w-2.5 !border-2 !border-white !bg-gray-400"
        />
      )}
    </div>
  );
}

export function AddNode({ id, data }) {
  if (id === "add__root__main") return null;
  const { onAdd } = data;

  return (
    <div className="flex items-center overflow-hidden rounded-full border border-gray-200/90 bg-white shadow-xs transition hover:border-[#6367FF]/50 hover:shadow-sm">
      <Handle type="target" position={Position.Top} isConnectable={false} className="!opacity-0" />
      <button
        onClick={() => onAdd(id)}
        className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#6367FF] transition hover:bg-[#6367FF]/5 active:scale-95"
      >
        <Plus size={14} className="text-[#6367FF]" />
        <span>Add</span>
      </button>
    </div>
  );
}

export const nodeTypes = { action: ActionNode, add: AddNode };
