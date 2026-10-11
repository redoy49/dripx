"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ExternalLink, Archive, Star, Mail, Linkedin, Loader2 } from "lucide-react";

export default function ConversationThread({ conversationId, onStatusChange, onConversationLoaded }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Derived (not stored) so switching conversations never flashes the previous thread's
  // content — as soon as conversationId changes, this is true again until fresh data lands.
  const loading = !conversation || conversation.id !== conversationId;

  const load = async () => {
    try {
      const [convoRes, msgRes] = await Promise.all([
        fetch(`/api/conversations/${conversationId}`),
        fetch(`/api/conversations/${conversationId}/messages`),
      ]);
      const convoData = await convoRes.json();
      const msgData = await msgRes.json();

      setConversation(convoData);
      setMessages(msgData.items || []);
      onConversationLoaded?.(convoData);
    } catch (err) {
      console.error("Failed to reload conversation thread:", err);
    }
  };

  useEffect(() => {
    let ignore = false;
    if (!conversationId) return;

    Promise.all([
      fetch(`/api/conversations/${conversationId}`),
      fetch(`/api/conversations/${conversationId}/messages`),
    ])
      .then(async ([convoRes, msgRes]) => {
        const convoData = await convoRes.json();
        const msgData = await msgRes.json();
        if (!ignore) {
          setConversation(convoData);
          setMessages(msgData.items || []);
          onConversationLoaded?.(convoData);
        }
      })
      .catch((err) => {
        console.error("Failed to load conversation thread:", err);
      });

    // Mark read on open
    fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markRead: true }),
    }).then(() => onStatusChange?.());

    return () => {
      ignore = true;
    };
  }, [conversationId, onConversationLoaded, onStatusChange]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!draft.trim() || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: draft }),
      });
      if (res.ok) {
        const msg = await res.json();
        setMessages((prev) => [...prev, msg]);
        setDraft("");
        onStatusChange?.();
      } else {
        const data = await res.json();
        alert(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Sending message failed:", err);
      alert("Network error: Failed to send message");
    } finally {
      setSending(false);
    }
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
      <div className="flex h-full flex-col items-center justify-center text-sm text-gray-400 gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-violet-400" />
        <span>Loading conversation...</span>
      </div>
    );
  }

  const lead = conversation.lead;
  const isEmail = conversation.channel === "email";

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3.5 bg-white shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-700 font-semibold flex items-center justify-center text-sm border border-violet-100">
            {(lead?.firstName?.[0] || "?").toUpperCase()}
          </div>
          <div>
            <p className="text-[15px] font-semibold text-gray-800">
              {lead ? `${lead.firstName} ${lead.lastName}`.trim() : "Unknown Contact"}
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-400">
              <span>{lead?.jobTitle || "Prospect"}</span>
              {lead?.company && (
                <>
                  <span>·</span>
                  <span className="font-medium text-gray-600">{lead.company}</span>
                </>
              )}
              <span>·</span>
              <span className="inline-flex items-center gap-1 font-medium capitalize text-gray-600">
                {isEmail ? <Mail className="w-3 h-3 text-blue-500" /> : <Linkedin className="w-3 h-3 text-[#0A66C2]" />}
                {conversation.channel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatus(conversation.status === "important" ? "open" : "important")}
            className={`rounded-lg p-2 transition ${
              conversation.status === "important"
                ? "bg-amber-50 text-amber-500"
                : "text-gray-400 hover:bg-gray-100"
            }`}
            title="Mark important"
          >
            <Star size={16} />
          </button>
          <button
            onClick={() => setStatus(conversation.status === "archived" ? "open" : "archived")}
            className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100"
            title="Archive"
          >
            <Archive size={16} />
          </button>
          {lead?.linkedinUrl && (
            <a
              href={lead.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg p-2 text-gray-400 transition hover:bg-gray-100"
              title="View on LinkedIn"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3.5 overflow-y-auto px-5 py-4 bg-gray-50/30">
        {messages.length === 0 && (
          <p className="py-12 text-center text-sm text-gray-400">No messages in this thread yet.</p>
        )}
        {messages.map((m) => {
          const isOutbound = m.direction === "outbound";
          return (
            <div key={m.id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-2xs ${
                  isOutbound
                    ? "bg-[#6367FF] text-white rounded-br-xs"
                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-xs"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{m.body}</div>
                <div
                  className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${
                    isOutbound ? "text-white/70 justify-end" : "text-gray-400 justify-start"
                  }`}
                >
                  {m.channel === "email" ? (
                    <Mail className="w-2.5 h-2.5" />
                  ) : (
                    <Linkedin className="w-2.5 h-2.5" />
                  )}
                  <span>{new Date(m.sentAt).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}</span>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Composer */}
      <div className="border-t border-gray-100 p-4 bg-white shrink-0 space-y-2">
        <div className="flex items-center justify-between text-[11px] text-gray-400 px-1">
          <div className="flex items-center gap-1.5 font-medium text-gray-600">
            {isEmail ? (
              <span className="inline-flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                <Mail className="w-3 h-3" />
                Replying via Email
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[#0A66C2] bg-blue-50 px-2 py-0.5 rounded-full">
                <Linkedin className="w-3 h-3" />
                Replying via LinkedIn
              </span>
            )}
          </div>
          <span className="text-[10px] text-gray-400 hidden sm:inline">
            Press <kbd className="px-1 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-600">Enter</kbd> to send, <kbd className="px-1 py-0.5 bg-gray-100 rounded border border-gray-200 text-gray-600">Shift + Enter</kbd> for new line
          </span>
        </div>

        <div className="flex items-end gap-2">
          <textarea
            rows={2}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            placeholder={
              isEmail
                ? `Reply to ${lead?.firstName || "lead"} via Email...`
                : `Send a message to ${lead?.firstName || "lead"} via LinkedIn...`
            }
            className="flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm text-gray-800 outline-none transition-all focus:border-violet-300 focus:bg-white focus:ring-2 focus:ring-violet-100"
          />
          <button
            onClick={send}
            disabled={sending || !draft.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-xs transition-all disabled:opacity-40 hover:opacity-95"
            style={{ background: "linear-gradient(to right, #6367FF, #7f64f5)" }}
            title="Send reply (Enter)"
          >
            {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
}
