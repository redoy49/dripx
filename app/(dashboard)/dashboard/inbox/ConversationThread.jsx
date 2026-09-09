"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ExternalLink, Archive, Star } from "lucide-react";

export default function ConversationThread({ conversationId, onStatusChange }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Derived (not stored) so switching conversations never flashes the previous thread's
  // content — as soon as conversationId changes, this is true again until fresh data lands.
  const loading = !conversation || conversation.id !== conversationId;

  const load = async () => {
    const [convoRes, msgRes] = await Promise.all([
      fetch(`/api/conversations/${conversationId}`),
      fetch(`/api/conversations/${conversationId}/messages`),
    ]);
    setConversation(await convoRes.json());
    const msgData = await msgRes.json();
    setMessages(msgData.items || []);

    // Mark read on open.
    fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markRead: true }),
    }).then(() => onStatusChange?.());
  };

  useEffect(() => {
    // load() only sets state after its internal `await` boundaries resolve (and `loading`
    // itself is derived above, not stored), so this doesn't cause the synchronous cascading
    // renders the rule guards against. `load` is intentionally omitted from deps — it closes
    // over conversationId and is recreated each render, which would otherwise refetch in a loop.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (conversationId) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!draft.trim()) return;
    setSending(true);
    const res = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: draft }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages((prev) => [...prev, msg]);
      setDraft("");
    } else {
      const data = await res.json();
      alert(data.message || "Failed to send");
    }
    setSending(false);
  };

  const setStatus = async (status) => {
    await fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setConversation((prev) => ({ ...prev, status }));
    onStatusChange?.();
  };

  if (loading || !conversation) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-gray-400">
        Loading conversation...
      </div>
    );
  }

  const lead = conversation.lead;

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <div>
          <p className="text-[15px] font-semibold text-gray-800">
            {lead ? `${lead.firstName} ${lead.lastName}`.trim() : "Unknown lead"}
          </p>
          <p className="text-xs text-gray-400">
            {lead?.jobTitle}
            {lead?.jobTitle && lead?.company ? " at " : ""}
            {lead?.company}
            {" · "}
            <span className="capitalize">{conversation.channel}</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setStatus(conversation.status === "important" ? "open" : "important")}
            className={`rounded-lg p-2 transition ${
              conversation.status === "important"
                ? "bg-amber-50 text-amber-500"
                : "text-gray-400 hover:bg-gray-100"
            }`}
            title="Mark important"
          >
            <Star size={15} />
          </button>
          <button
            onClick={() => setStatus(conversation.status === "archived" ? "open" : "archived")}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100"
            title="Archive"
          >
            <Archive size={15} />
          </button>
          {lead?.linkedinUrl && (
            <a
              href={lead.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100"
              title="View on LinkedIn"
            >
              <ExternalLink size={15} />
            </a>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {messages.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-400">No messages yet.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                m.direction === "outbound"
                  ? "bg-[#6367FF] text-white"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {m.body}
              <p className={`mt-1 text-[10px] ${m.direction === "outbound" ? "text-white/60" : "text-gray-400"}`}>
                {new Date(m.sentAt).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="flex items-center gap-2 border-t border-gray-100 p-4">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Type a message..."
          className="flex-1 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 outline-none focus:border-violet-200 focus:ring-2 focus:ring-violet-100"
        />
        <button
          onClick={send}
          disabled={sending || !draft.trim()}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-xs disabled:opacity-50"
          style={{ background: "linear-gradient(to right, #7f64f5, #ae79f8)" }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
}
