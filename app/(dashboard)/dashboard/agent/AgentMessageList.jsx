"use client";

import { useEffect, useRef } from "react";
import { Sparkles, ChevronRight, Zap, BarChart3, Inbox, MailCheck } from "lucide-react";
import AgentToolCard from "./AgentToolCard";

const STARTER_PROMPTS = [
  {
    icon: Zap,
    title: "Build a Multi-Channel Sequence",
    prompt: "Create a 4-step draft campaign for SaaS founders with an initial cold email, 2-day delay, LinkedIn profile visit, and follow-up email.",
  },
  {
    icon: BarChart3,
    title: "Audit Workspace Performance",
    prompt: "Analyze my last 7 days dashboard metrics, active campaigns, and suggest what to optimize first.",
  },
  {
    icon: Inbox,
    title: "Triage Unread Replies",
    prompt: "Summarize my unread Unified Inbox threads and draft polite, conversion-focused replies for interested leads.",
  },
  {
    icon: MailCheck,
    title: "Check Deliverability & Mailboxes",
    prompt: "Check all connected email accounts, daily limits, and flag any accounts needing attention.",
  },
];

function renderFormattedText(text) {
  const parts = String(text || "").split(/(\[[^\]]+\]\(\/[^\s)]+\)|\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((chunk, i) => {
    const linkMatch = chunk.match(/^\[([^\]]+)\]\((\/[^\s)]+)\)$/);
    if (linkMatch) {
      return (
        <a key={i} href={linkMatch[2]} className="text-indigo-600 font-semibold underline underline-offset-2 hover:text-indigo-700">
          {linkMatch[1]}
        </a>
      );
    }
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      return <strong key={i} className="font-bold text-gray-900">{chunk.slice(2, -2)}</strong>;
    }
    if (chunk.startsWith("`") && chunk.endsWith("`")) {
      return <code key={i} className="rounded bg-gray-100 px-1.5 py-0.5 text-[12px] font-mono text-indigo-700">{chunk.slice(1, -1)}</code>;
    }
    return chunk;
  });
}

export default function AgentMessageList({
  messages,
  status,
  onPickPrompt,
  onApproveTool,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-10 flex items-center justify-center">
        <div className="w-full max-w-3xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-400 to-violet-400 text-white flex items-center justify-center mx-auto shadow-sm">
              <Sparkles size={22} />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">
              DripX AI Command Center
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 max-w-lg mx-auto">
              Switch between Claude, ChatGPT, DeepSeek &amp; Gemini. Use <code className="px-1.5 py-0.5 rounded bg-gray-100 font-mono text-indigo-600">@</code> to target campaigns or leads and build sequences with one prompt.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {STARTER_PROMPTS.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => onPickPrompt(item.prompt)}
                  className="text-left rounded-2xl border border-gray-200/90 bg-white p-4 shadow-2xs hover:border-indigo-300 hover:shadow-sm transition group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="inline-flex items-center gap-2 text-xs font-bold text-gray-800 group-hover:text-indigo-600">
                      <Icon size={15} className="text-indigo-400" />
                      {item.title}
                    </span>
                    <ChevronRight size={14} className="text-gray-300 group-hover:text-indigo-400 transition" />
                  </div>
                  <p className="text-[11.5px] text-gray-500 line-clamp-2 leading-relaxed">{item.prompt}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-5">
      <div className="mx-auto max-w-3xl space-y-5">
        {messages.map((m) => {
          const isUser = m.role === "user";
          return (
            <div key={m.id} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
              <div
                className={
                  isUser
                    ? "max-w-[82%] rounded-2xl rounded-br-xs bg-indigo-400 text-white px-4 py-3 text-sm shadow-xs whitespace-pre-wrap"
                    : "w-full rounded-2xl border border-gray-200/80 bg-white px-5 py-4 text-sm text-gray-800 shadow-2xs space-y-2"
                }
              >
                {(m.parts || []).map((part, idx) => {
                  if (part.type === "text") {
                    return (
                      <div key={idx} className="whitespace-pre-wrap leading-relaxed">
                        {isUser ? part.text : renderFormattedText(part.text)}
                      </div>
                    );
                  }
                  if (part.type === "reasoning" && part.text) {
                    return (
                      <details key={idx} className="rounded-xl bg-gray-50 border border-gray-200/70 px-3 py-2 text-xs text-gray-500">
                        <summary className="cursor-pointer font-semibold text-gray-600 select-none">
                          Thought Process
                        </summary>
                        <div className="mt-1.5 whitespace-pre-wrap leading-relaxed text-[11.5px]">
                          {part.text}
                        </div>
                      </details>
                    );
                  }
                  if (part.type?.startsWith("tool-")) {
                    return <AgentToolCard key={part.toolCallId || idx} part={part} onApprove={onApproveTool} />;
                  }
                  return null;
                })}
              </div>
            </div>
          );
        })}

        {(status === "submitted" || status === "streaming") && (
          <div className="flex items-center gap-2 text-xs text-gray-400 pl-2">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span>DripX Agent is working...</span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
