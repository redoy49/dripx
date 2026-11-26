"use client";

import { useState } from "react";
import Image from "next/image";
import { Plus, Trash2, Sparkles, Pencil, Check } from "lucide-react";

export default function AgentThreadSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onRenameThread,
  onDeleteThread,
  openMobile,
  onCloseMobile,
}) {
  const [editingId, setEditingId] = useState(null);
  const [draftTitle, setDraftTitle] = useState("");

  const commitRename = (id) => {
    const clean = draftTitle.trim();
    if (clean) onRenameThread?.(id, clean);
    setEditingId(null);
  };

  return (
    <aside
      className={`${
        openMobile ? "fixed inset-y-3 left-3 z-40 flex shadow-xl" : "hidden lg:flex"
      } w-64 shrink-0 flex-col border-r border-gray-200/80 bg-white`}
    >
      <div className="p-3.5 border-b border-gray-100 flex items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onCloseMobile?.();
          }}
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-indigo-400 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-3 shadow-xs transition active:scale-95 cursor-pointer"
        >
          <Plus size={15} />
          <span>New Agent Chat</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-1">
        <p className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
          Recent Sessions
        </p>

        {threads.length === 0 ? (
          <div className="px-3 py-8 text-center text-xs text-gray-400 space-y-2">
            <Sparkles size={18} className="mx-auto text-indigo-300" />
            <p>No saved sessions yet. Ask the agent to build a campaign or analyze metrics.</p>
          </div>
        ) : (
          threads.map((t) => {
            const active = t.id === activeThreadId;
            const isEditing = editingId === t.id;

            return (
              <div
                key={t.id}
                className={`group flex items-center justify-between gap-1 rounded-full px-2 py-2 text-xs transition ${
                  active
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                {isEditing ? (
                  <div className="flex flex-1 items-center gap-1 min-w-0">
                    <input
                      autoFocus
                      value={draftTitle}
                      onChange={(e) => setDraftTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") commitRename(t.id);
                        if (e.key === "Escape") setEditingId(null);
                      }}
                      onBlur={() => commitRename(t.id)}
                      className="flex-1 min-w-0 rounded-lg border border-indigo-300 bg-white px-2 py-0.5 text-xs text-gray-800 focus:outline-none"
                    />
                    <button
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        commitRename(t.id);
                      }}
                      aria-label="Save name"
                      className="p-1 rounded-lg text-indigo-600 hover:bg-indigo-100 cursor-pointer shrink-0"
                    >
                      <Check size={12} />
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectThread(t.id);
                        onCloseMobile?.();
                      }}
                      className="flex flex-1 items-center gap-2 min-w-0 text-left cursor-pointer"
                    >
                      <Image
                        src="/grokbot.svg"
                        alt=""
                        width={18}
                        height={18}
                        className={`ml-1 h-[18px] w-[18px] shrink-0 object-contain transition-opacity ${
                          active ? "opacity-90" : "opacity-55 group-hover:opacity-80"
                        }`}
                      />
                      <span className="truncate">{t.title}</span>
                    </button>
                    <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition shrink-0">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingId(t.id);
                          setDraftTitle(t.title || "");
                        }}
                        title="Rename session"
                        aria-label="Rename session"
                        className="p-1 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-100/70 transition cursor-pointer"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteThread(t.id);
                        }}
                        title="Delete session"
                        aria-label="Delete session"
                        className="p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
