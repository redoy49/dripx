"use client";

import { useEffect, useRef, useState } from "react";
import { Send, ExternalLink, Archive, Star, Mail, Loader2 } from "lucide-react";
import { FaLinkedin } from "react-icons/fa";

function stripQuotedContent(text) {
  if (!text || typeof text !== "string") return "";
  const quoteHeaderRegex = /(?:\r?\n)(?:On\s+[\s\S]+?\s+wrote:|-----Original Message-----|_{20,}|From:\s+.+?\r?\n(?:Sent|Date):|(?=>\s*[\w\s]))/i;
  const match = text.search(quoteHeaderRegex);
  if (match !== -1) {
    const mainText = text.slice(0, match).trim();
    if (mainText) return mainText;
  }
  return text.trim();
}

export default function ConversationThread({ conversationId, onStatusChange, onConversationLoaded }) {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  // Derived so switching conversations never flashes the previous thread's content
  const loading = !conversation || conversation.id !== conversationId;

  // Stabilize external callbacks with refs so effect dependencies depend strictly on conversationId
  const onConversationLoadedRef = useRef(onConversationLoaded);
  const onStatusChangeRef = useRef(onStatusChange);

  useEffect(() => {
    onConversationLoadedRef.current = onConversationLoaded;
    onStatusChangeRef.current = onStatusChange;
  });

  useEffect(() => {
    let ignore = false;
    if (!conversationId) return;

    Promise.all([
      fetch(`/api/conversations/${conversationId}`),
      fetch(`/api/conversations/${conversationId}/messages`),
    ])
      .then(async ([convoRes, msgRes]) => {
        const convoData = convoRes.ok ? await convoRes.json() : null;
        const msgData = msgRes.ok ? await msgRes.json() : null;
        if (!ignore && convoData) {
          setConversation(convoData);
          setMessages(msgData?.items || []);
          onConversationLoadedRef.current?.(convoData);
        }
      })
      .catch((err) => {
        console.error("Failed to load conversation thread:", err);
      });

    // Mark read on open in the background.
    // Parent handleSelectConversation already zeroed unreadCount locally and dispatched the layout event,
    // so we intentionally do NOT trigger onStatusChange here to avoid redundant conversation list refetches.
    fetch(`/api/conversations/${conversationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ markRead: true }),
    }).catch((err) => {
      console.error("Failed to mark conversation read:", err);
    });

    return () => {
      ignore = true;
    };
  }, [conversationId]);

  // Live auto-polling for new incoming messages in this open thread
  useEffect(() => {
    if (!conversationId) return;

    let isPolling = false;

    const checkNewMessages = async () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (isPolling) return;
      isPolling = true;

      try {
        const msgRes = await fetch(`/api/conversations/${conversationId}/messages`);
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          const items = msgData.items || [];
          setMessages((prev) => {
            const hasChanged =
              items.length !== prev.length ||
              (items.length > 0 && items[items.length - 1].id !== prev[prev.length - 1]?.id);

            if (hasChanged) {
              // New reply arrived in currently active conversation:
              // Auto-mark as read and inform parent list so previews/status stay synced
              fetch(`/api/conversations/${conversationId}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ markRead: true }),
              }).then(() => onStatusChangeRef.current?.());

              return items;
            }
            return prev;
          });
        }
      } catch {
        // Ignore background polling network glitches
      } finally {
        isPolling = false;
      }
    };

    const interval = setInterval(checkNewMessages, 10000);
    const handleFocus = () => {
      checkNewMessages();
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [conversationId]);

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
        onStatusChangeRef.current?.();
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
    onStatusChangeRef.current?.();
  };

  if (loading || !conversation) {
    return (
      <div className="flex h-full flex-col justify-between p-6 animate-pulse">
        {/* Thread Header Skeleton */}
        <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-4 w-32 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
          </div>
        </div>

        {/* Message Bubbles Skeleton */}
        <div className="space-y-4 py-8 flex-1">
          <div className="h-14 w-2/3 bg-gray-100 rounded-2xl" />
          <div className="h-16 w-3/4 bg-violet-50/70 rounded-2xl ml-auto" />
          <div className="h-12 w-1/2 bg-gray-100 rounded-2xl" />
        </div>

        {/* Reply Box Skeleton */}
        <div className="h-12 w-full bg-gray-100 rounded-xl" />
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
                {isEmail ? <Mail className="w-3 h-3 text-blue-500" /> : <FaLinkedin className="w-3 h-3 text-[#0A66C2]" />}
                {conversation.channel}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setStatus(conversation.status === "important" ? "open" : "important")}
            className={`rounded-full p-2 transition ${
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
            className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100"
            title="Archive"
          >
            <Archive size={16} />
          </button>
          {lead?.linkedinUrl && (
            <a
              href={lead.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full p-2 text-gray-400 transition hover:bg-gray-100"
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
          const cleanBody = stripQuotedContent(m.body);

          return (
            <div key={m.id} className={`flex ${isOutbound ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm shadow-2xs ${
                  isOutbound
                    ? "bg-[#6367FF] text-white rounded-br-xs"
                    : "bg-white text-gray-800 border border-gray-100 rounded-bl-xs"
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed">{cleanBody || m.body}</div>

                <div
                  className={`mt-1.5 flex items-center gap-1.5 text-[10px] ${
                    isOutbound ? "text-white/70 justify-end" : "text-gray-400 justify-start"
                  }`}
                >
                  {m.channel === "email" ? (
                    <Mail className="w-2.5 h-2.5" />
                  ) : (
                    <FaLinkedin className="w-2.5 h-2.5" />
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
                <FaLinkedin className="w-3 h-3" />
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
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white shadow-xs transition-all disabled:opacity-40 hover:opacity-95"
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
