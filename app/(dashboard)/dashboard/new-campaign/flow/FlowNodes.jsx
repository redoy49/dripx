"use client";

import { useState, useRef, useEffect } from "react";
import { Handle, Position } from "@xyflow/react";
import {
  MoreHorizontal,
  Trash2,
  Pencil,
  Plus,
  CircleSlash,
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
      className={`nodrag-children w-[270px] rounded-2xl bg-white shadow-sm transition-all ${
        hasError
          ? "border-2 border-rose-300 ring-4 ring-rose-50"
          : selected
            ? "border-2 border-[#6367FF] ring-4 ring-[#6367FF]/10 shadow-md"
            : "border border-gray-200 hover:border-[#6367FF]/40 hover:shadow-md"
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        className="!h-2.5 !w-2.5 !border-2 !border-white !bg-[#6367FF] transition"
      />

      {/* Node Header Row: Step number, Channel pill & Menu */}
      <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/50 px-3.5 py-2 rounded-t-2xl">
        <div className="flex items-center gap-1.5">
          {typeof stepIndex === "number" && (
            <span className="rounded-md bg-white border border-gray-200 px-1.5 py-0.5 text-[10px] font-bold text-gray-500 shadow-2xs">
              Step {stepIndex}
            </span>
          )}
          <span className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-medium text-gray-500">
            {isEmail ? (
              <Mail size={11} className="text-[#0A66C2]" />
            ) : (
              <FiLinkedin size={11} className="text-[#0A66C2]" />
            )}
            <span>{isEmail ? "Email" : "LinkedIn"}</span>
          </span>
        </div>

        <div ref={menuRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
          >
            <MoreHorizontal size={14} />
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

      {/* Main Node Body */}
      <div className="p-3.5">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition"
            style={{ background: opt.bg }}
          >
            <Icon size={17} strokeWidth={1.9} style={{ color: opt.accent }} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13.5px] font-semibold text-gray-800">{opt.title}</p>
            <p className="truncate text-[11px] text-gray-400" title={stepSummary(step)}>
              {stepSummary(step)}
            </p>
          </div>
        </div>

        {/* Validation Issues Pill */}
        {hasError && (
          <button
            onClick={() => onEdit(id)}
            title="Click to resolve this issue in step editor"
            className="mt-2.5 flex w-full items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-2 py-1 text-left text-[11px] font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <AlertCircle size={12} className="shrink-0 text-rose-600" />
            <span className="truncate">{validation.errorText}</span>
          </button>
        )}

        {hasWarning && (
          <button
            onClick={() => onEdit(id)}
            title="Click to inspect this advisory in step editor"
            className="mt-2.5 flex w-full items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50/70 px-2 py-1 text-left text-[11px] font-medium text-amber-700 transition hover:bg-amber-100"
          >
            <AlertTriangle size={12} className="shrink-0 text-amber-600" />
            <span className="truncate">{validation.warningText}</span>
          </button>
        )}
      </div>

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
  const { onAdd } = data;

  return (
    <div className="flex overflow-hidden rounded-2xl border-2 border-dashed border-gray-200 bg-white/90 shadow-sm transition hover:border-[#6367FF]/50 hover:bg-white">
      <Handle type="target" position={Position.Top} isConnectable={false} className="!opacity-0" />
      <button
        onClick={() => onAdd(id)}
        className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold text-[#6367FF] transition hover:bg-[#6367FF]/5"
      >
        <Plus size={14} /> Add Step
      </button>
      <div className="w-px bg-gray-200" />
      <div className="flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium text-gray-400">
        <CircleSlash size={14} /> End
      </div>
    </div>
  );
}

export const nodeTypes = { action: ActionNode, add: AddNode };
