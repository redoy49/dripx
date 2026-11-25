"use client";

import { Plus, MessageSquare, Trash2, Sparkles } from "lucide-react";

export default function AgentThreadSidebar({
  threads,
  activeThreadId,
  onSelectThread,
  onNewChat,
  onDeleteThread,
  openMobile,
  onCloseMobile,
}) {
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
          className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-400 hover:bg-indigo-500 text-white text-xs font-bold py-2.5 px-3 shadow-xs transition active:scale-95 cursor-pointer"
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
            return (
              <div
                key={t.id}
                className={`group flex items-center justify-between gap-1 rounded-xl px-2.5 py-2 text-xs transition ${
                  active
                    ? "bg-indigo-50 text-indigo-700 font-semibold"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <button
                  type="button"
                  onClick={() => {
                    onSelectThread(t.id);
                    onCloseMobile?.();
                  }}
                  className="flex flex-1 items-center gap-2 min-w-0 text-left cursor-pointer"
                >
                  <MessageSquare size={13} className={active ? "text-indigo-500 shrink-0" : "text-gray-400 shrink-0"} />
                  <span className="truncate">{t.title}</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteThread(t.id);
                  }}
                  title="Delete session"
                  aria-label="Delete session"
                  className="opacity-0 group-hover:opacity-100 focus:opacity-100 p-1 rounded-lg text-gray-400 hover:text-rose-500 hover:bg-rose-50 transition cursor-pointer shrink-0"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
