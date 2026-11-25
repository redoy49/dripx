"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, lastAssistantMessageIsCompleteWithApprovalResponses } from "ai";
import { PanelLeft, ShieldAlert, KeyRound, Sparkles } from "lucide-react";
import { DEFAULT_MODEL_ID } from "@/app/lib/ai/models";
import AgentThreadSidebar from "./AgentThreadSidebar";
import AgentMessageList from "./AgentMessageList";
import AgentComposer from "./AgentComposer";

function createHexObjectId() {
  const bytes = new Uint8Array(12);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");
}

export default function AgentWorkspaceClient() {
  const [threadId, setThreadId] = useState(() => createHexObjectId());
  const [threads, setThreads] = useState([]);
  const [hasAccess, setHasAccess] = useState(true);
  const [hasGateway, setHasGateway] = useState(false);
  const [configuredProviders, setConfiguredProviders] = useState([]);
  const [mobileSidebar, setMobileSidebar] = useState(false);

  const [input, setInput] = useState("");
  const [mode, setMode] = useState("build");
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [reasoningEffort, setReasoningEffort] = useState("high");
  const [contextRefs, setContextRefs] = useState([]);

  const refreshThreads = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/threads");
      if (!res.ok) return;
      const data = await res.json();
      setHasAccess(Boolean(data.hasAccess));
      setHasGateway(Boolean(data.hasGateway));
      setConfiguredProviders(data.configuredProviders || []);
      setThreads(data.threads || []);
    } catch {}
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      refreshThreads();
    });
  }, [refreshThreads]);

  const { messages, setMessages, sendMessage, status, stop, error, addToolApprovalResponse } = useChat({
    id: threadId,
    transport: new DefaultChatTransport({ api: "/api/agent/chat" }),
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithApprovalResponses,
    onFinish: () => {
      refreshThreads();
    },
  });

  const handleSend = (overrideText) => {
    const text = (typeof overrideText === "string" ? overrideText : input).trim();
    if (!text && contextRefs.length === 0) return;
    sendMessage(
      { text: text || "Analyze the attached context." },
      { body: { threadId, modelId, mode, reasoningEffort, contextRefs } }
    );
    if (typeof overrideText !== "string") setInput("");
    setContextRefs([]);
  };

  const handleSelectThread = async (id) => {
    const res = await fetch(`/api/agent/threads/${id}`);
    if (!res.ok) return;
    const data = await res.json();
    setThreadId(data.id);
    if (data.modelId) setModelId(data.modelId);
    if (data.mode) setMode(data.mode);
    setMessages(data.messages || []);
  };

  const handleNewChat = () => {
    setThreadId(createHexObjectId());
    setMessages([]);
    setContextRefs([]);
  };

  const handleDeleteThread = async (id) => {
    await fetch(`/api/agent/threads/${id}`, { method: "DELETE" });
    setThreads((prev) => prev.filter((t) => t.id !== id));
    if (id === threadId) handleNewChat();
  };

  if (!hasAccess) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <div className="max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-2xs space-y-3">
          <ShieldAlert size={28} className="mx-auto text-amber-500" />
          <h2 className="text-lg font-bold text-gray-900">AI Agent Access Restricted</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your workspace Owner or Admin controls AI Agent access for team members. Ask them to enable your toggle in <strong>Teams → Members</strong>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full w-full overflow-hidden bg-[#FAFAFC]">
      <AgentThreadSidebar
        threads={threads}
        activeThreadId={threadId}
        onSelectThread={handleSelectThread}
        onNewChat={handleNewChat}
        onDeleteThread={handleDeleteThread}
        openMobile={mobileSidebar}
        onCloseMobile={() => setMobileSidebar(false)}
      />

      <div className="flex flex-1 flex-col min-w-0 h-full">
        <header className="flex items-center justify-between border-b border-gray-200/80 bg-white px-4 sm:px-6 py-3 shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileSidebar((v) => !v)}
              className="lg:hidden rounded-lg border border-gray-200 p-1.5 text-gray-600 hover:bg-gray-50 cursor-pointer"
              aria-label="Toggle sessions"
            >
              <PanelLeft size={16} />
            </button>
            <Sparkles size={16} className="text-indigo-500" />
            <h1 className="text-sm font-bold text-gray-900">AI Agent Workspace</h1>
          </div>
          <Link
            href="/dashboard/settings?tab=AI%20Providers"
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 px-3 py-1 text-[11px] font-semibold text-gray-600 transition"
          >
            <KeyRound size={12} />
            <span>{hasGateway || configuredProviders.length ? "Keys Active" : "Add API Keys"}</span>
          </Link>
        </header>

        {error && (
          <div className="mx-auto mt-3 w-full max-w-3xl px-4">
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-2.5 text-xs text-rose-700 flex items-center justify-between gap-3">
              <span>{error.message || "AI request failed. Check your provider credentials."}</span>
              <Link href="/dashboard/settings?tab=AI%20Providers" className="font-bold underline shrink-0">
                Open Settings
              </Link>
            </div>
          </div>
        )}

        <AgentMessageList
          messages={messages}
          status={status}
          onPickPrompt={(prompt) => handleSend(prompt)}
          onApproveTool={addToolApprovalResponse}
        />

        <AgentComposer
          input={input}
          setInput={setInput}
          mode={mode}
          setMode={setMode}
          modelId={modelId}
          setModelId={setModelId}
          reasoningEffort={reasoningEffort}
          setReasoningEffort={setReasoningEffort}
          contextRefs={contextRefs}
          setContextRefs={setContextRefs}
          status={status}
          onSend={() => handleSend()}
          onStop={stop}
          hasGateway={hasGateway}
          configuredProviders={configuredProviders}
        />
      </div>
    </div>
  );
}
