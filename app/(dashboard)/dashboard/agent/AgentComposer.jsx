"use client";

import { useRef, useState } from "react";
import { Plus, ArrowUp, Square, Mic, MicOff, X, Paperclip } from "lucide-react";
import AgentModelPicker from "./AgentModelPicker";
import AgentModePicker from "./AgentModePicker";
import AgentContextPopover from "./AgentContextPopover";

export default function AgentComposer({
  input,
  setInput,
  mode,
  setMode,
  modelId,
  sourceProviderId,
  setModelId,
  reasoningEffort,
  setReasoningEffort,
  contextRefs,
  setContextRefs,
  status,
  onSend,
  onStop,
  availableModels,
}) {
  const [trigger, setTrigger] = useState({ type: null, query: "" });
  const [listening, setListening] = useState(false);
  const fileRef = useRef(null);
  const recognitionRef = useRef(null);
  const busy = status === "submitted" || status === "streaming";

  const handleTextChange = (val) => {
    setInput(val);
    const slashMatch = val.match(/^\/([a-z0-9-]*)$/i);
    if (slashMatch) return setTrigger({ type: "/", query: slashMatch[1] });
    const atMatch = val.match(/(?:^|\s)@([^\s]*)$/);
    if (atMatch) return setTrigger({ type: "@", query: atMatch[1] });
    if (trigger.type) setTrigger({ type: null, query: "" });
  };

  const handleAttachFile = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setContextRefs((prev) => [
      ...prev.filter((r) => r.label !== file.name),
      { type: "file", id: `file-${Date.now()}`, label: file.name, content: text.slice(0, 4000) },
    ]);
    e.target.value = "";
  };

  const toggleVoice = () => {
    if (typeof window === "undefined") return;
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) return;

    if (listening && recognitionRef.current) {
      recognitionRef.current.stop();
      return setListening(false);
    }
    const rec = new SpeechRec();
    rec.lang = "en-US";
    rec.onresult = (ev) => {
      const t = ev.results?.[0]?.[0]?.transcript || "";
      if (t) setInput((prev) => (prev ? `${prev} ${t}` : t));
    };
    rec.onend = () => setListening(false);
    rec.onerror = () => setListening(false);
    recognitionRef.current = rec;
    setListening(true);
    rec.start();
  };

  return (
    <div className="px-4 sm:px-6 pb-4 pt-2 shrink-0">
      <div className="mx-auto max-w-3xl relative">
        <AgentContextPopover
          triggerType={trigger.type}
          query={trigger.query}
          onClose={() => setTrigger({ type: null, query: "" })}
          onSelectCommand={(prompt) => {
            setInput(prompt);
            setTrigger({ type: null, query: "" });
          }}
          onSelectContext={(item) => {
            setContextRefs((prev) => (prev.some((r) => r.id === item.id) ? prev : [...prev, item]));
            setInput((prev) => prev.replace(/@[^\s]*$/, "").trimEnd() + " ");
            setTrigger({ type: null, query: "" });
          }}
        />

        <div className="rounded-3xl border border-gray-200/90 bg-white p-3.5 shadow-sm focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-100 transition">
          {contextRefs.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-2">
              {contextRefs.map((ref) => (
                <span
                  key={ref.id}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-50 border border-indigo-200/80 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700"
                >
                  <Paperclip size={11} />
                  <span className="max-w-[160px] truncate">{ref.label}</span>
                  <button type="button" onClick={() => setContextRefs((p) => p.filter((r) => r.id !== ref.id))} className="hover:text-rose-500 cursor-pointer">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
          )}

          <textarea
            rows={2}
            value={input}
            onChange={(e) => handleTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey && !trigger.type) {
                e.preventDefault();
                if (!busy) onSend();
              }
            }}
            placeholder="Plan, Build, Automate — / for commands or @ for context"
            className="w-full resize-none bg-transparent px-1.5 py-1 text-sm text-gray-800 placeholder:text-gray-400 focus:outline-none"
          />

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <input ref={fileRef} type="file" accept=".csv,.txt,.md,.json" onChange={handleAttachFile} className="hidden" />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                title="Attach CSV or text snippet"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200/90 bg-white text-gray-500 hover:bg-gray-50 transition cursor-pointer"
              >
                <Plus size={15} />
              </button>

              <AgentModePicker mode={mode} onChangeMode={setMode} />

              <AgentModelPicker
                modelId={modelId}
                sourceProviderId={sourceProviderId}
                reasoningEffort={reasoningEffort}
                onChangeModel={setModelId}
                onChangeReasoning={setReasoningEffort}
                availableModels={availableModels}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleVoice}
                title={listening ? "Stop voice input" : "Voice dictation"}
                className={`flex h-8 w-8 items-center justify-center rounded-full border transition cursor-pointer ${
                  listening
                    ? "border-rose-300 bg-rose-50 text-rose-600 animate-pulse"
                    : "border-gray-200/90 bg-white text-gray-500 hover:bg-gray-50"
                }`}
              >
                {listening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>

              {busy ? (
                <button
                  type="button"
                  onClick={onStop}
                  title="Stop generation"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white hover:bg-gray-700 transition cursor-pointer"
                >
                  <Square size={12} fill="currentColor" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={!input.trim() && contextRefs.length === 0}
                  onClick={onSend}
                  title="Send prompt"
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-400 text-white hover:bg-indigo-500 disabled:opacity-40 transition active:scale-95 cursor-pointer"
                >
                  <ArrowUp size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
