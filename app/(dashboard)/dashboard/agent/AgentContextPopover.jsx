"use client";

import { useEffect, useState } from "react";
import { Megaphone, Tag, Mail, Terminal } from "lucide-react";

const SLASH_COMMANDS = [
  { id: "cmd-campaign", label: "/new-campaign", meta: "Build draft multi-channel sequence", prompt: "Create a new draft campaign with a 3-step cold email and LinkedIn sequence: " },
  { id: "cmd-audit", label: "/audit-metrics", meta: "Analyze 7d performance & bottlenecks", prompt: "Audit my last 7 days workspace dashboard metrics and campaign reply rates." },
  { id: "cmd-inbox", label: "/triage-inbox", meta: "Summarize unread threads & draft replies", prompt: "List my unread Unified Inbox conversations and draft tailored replies for each." },
  { id: "cmd-health", label: "/check-health", meta: "Inspect sender mailbox limits & status", prompt: "Check my connected email accounts and mailbox health status." },
];

export default function AgentContextPopover({
  triggerType,
  query,
  onSelectContext,
  onSelectCommand,
  onClose,
}) {
  const [items, setItems] = useState([]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (triggerType !== "@") return;
    let ignore = false;
    fetch(`/api/agent/context?q=${encodeURIComponent(query)}`)
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        if (!ignore) {
          setItems(data.items || []);
          setActiveIndex(0);
        }
      })
      .catch(() => {});
    return () => {
      ignore = true;
    };
  }, [triggerType, query]);

  const list =
    triggerType === "/"
      ? SLASH_COMMANDS.filter((c) => !query || c.label.includes(query.toLowerCase()))
      : items;

  useEffect(() => {
    const onKeyDown = (e) => {
      if (!list.length) return;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % list.length);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + list.length) % list.length);
      } else if (e.key === "Enter" || e.key === "Tab") {
        e.preventDefault();
        const picked = list[activeIndex];
        if (!picked) return;
        if (triggerType === "/") onSelectCommand(picked.prompt);
        else onSelectContext(picked);
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown, true);
    return () => window.removeEventListener("keydown", onKeyDown, true);
  }, [list, activeIndex, triggerType, onSelectCommand, onSelectContext, onClose]);

  if (!triggerType || list.length === 0) return null;

  return (
    <div
      role="listbox"
      aria-label={triggerType === "/" ? "Slash commands" : "Workspace context"}
      className="absolute bottom-full left-0 mb-2 w-80 max-h-60 overflow-y-auto rounded-2xl border border-gray-200 bg-white p-1.5 shadow-xl z-40"
    >
      <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-gray-400">
        {triggerType === "/" ? "Quick Workflows" : "Attach Workspace Context"}
      </div>
      {list.map((item, idx) => {
        const active = idx === activeIndex;
        const Icon =
          triggerType === "/"
            ? Terminal
            : item.type === "campaign"
            ? Megaphone
            : item.type === "tag"
            ? Tag
            : Mail;

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => (triggerType === "/" ? onSelectCommand(item.prompt) : onSelectContext(item))}
            className={`w-full flex items-center justify-between gap-2 rounded-xl px-2.5 py-2 text-left text-xs transition cursor-pointer ${
              active ? "bg-indigo-50 text-indigo-700 font-semibold" : "text-gray-700 hover:bg-gray-50"
            }`}
          >
            <span className="inline-flex items-center gap-2 min-w-0">
              <Icon size={13} className="text-indigo-400 shrink-0" />
              <span className="truncate">{item.label}</span>
            </span>
            <span className="text-[10px] text-gray-400 shrink-0">{item.meta}</span>
          </button>
        );
      })}
    </div>
  );
}
