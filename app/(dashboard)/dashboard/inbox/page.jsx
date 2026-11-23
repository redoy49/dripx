"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Info, Search, Mail, RefreshCw, Trash2 } from "lucide-react";
import ConversationThread from "@/app/(dashboard)/dashboard/inbox/ConversationThread";
import LeadDetailPanel from "@/app/(dashboard)/dashboard/inbox/LeadDetailPanel";
import { FaLinkedin } from "react-icons/fa";

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "important", label: "Important" },
  { key: "archived", label: "Archived" },
];

const CHANNELS = [
  { key: "all", label: "All Channels" },
  { key: "email", label: "Email", icon: Mail },
  { key: "linkedin", label: "LinkedIn", icon: FaLinkedin },
];

import { getCached, setCached, clearCache } from "@/app/lib/swrCache";

function formatMessageTime(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
  }
  return date.toLocaleDateString([], { month: "short", day: "numeric" });
}

export default function InboxPage() {
  const [tab, setTab] = useState("all");
  const [channel, setChannel] = useState("all");
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState(() => {
    const cached = getCached("/api/conversations?filter=all");
    return cached?.items || [];
  });
  const [activeId, setActiveId] = useState(null);
  const [activeConversationData, setActiveConversationData] = useState(null);
  const [loading, setLoading] = useState(() => {
    return !getCached("/api/conversations?filter=all");
  });
  const [refreshing, setRefreshing] = useState(false);
  const isSyncingRef = useRef(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Synchronizes external mailbox in the background and reloads conversations
  const fetchConversations = useCallback(
    async (triggerSync = false) => {
      const query = new URLSearchParams({ filter: tab });
      if (channel !== "all") query.set("channel", channel);
      const cacheKey = `/api/conversations?${query.toString()}`;

      // Decoupled Background Mailbox Sync: non-blocking so initial list loads in ~40ms
      if (triggerSync && !isSyncingRef.current) {
        isSyncingRef.current = true;
        fetch("/api/conversations/sync", { method: "POST" })
          .then((res) => (res.ok ? res.json() : null))
          .then((syncRes) => {
            // If new incoming messages were synced, quietly revalidate the list
            if (syncRes?.syncedCount > 0 && isMountedRef.current) {
              fetch(cacheKey)
                .then((r) => (r.ok ? r.json() : null))
                .then((fresh) => {
                  if (fresh?.items && isMountedRef.current) {
                    setCached(cacheKey, fresh);
                    setConversations(fresh.items);
                  }
                });
            }
          })
          .catch((err) => {
            console.warn("Mailbox sync failed during background refresh:", err);
          })
          .finally(() => {
            isSyncingRef.current = false;
          });
      }

      if (!isMountedRef.current) return;

      return fetch(cacheKey)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data || !isMountedRef.current) return;
          const items = data.items || [];
          setCached(cacheKey, data);
          setConversations(items);

          // Preserve active conversation only if the user has already explicitly selected one
          setActiveId((curr) => {
            if (curr && items.some((item) => item.id === curr)) {
              return curr;
            }
            // Do not auto-select on enter: conversations remain unread until explicitly clicked
            return null;
          });

          // Dispatch updated unread count to parent Dashboard layout
          const unreadSum = items.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
          queueMicrotask(() => {
            window.dispatchEvent(
              new CustomEvent("dripx:unread-changed", { detail: { totalUnread: unreadSum } })
            );
          });
        })
        .catch((err) => {
          if (isMountedRef.current) {
            console.error("Failed to load conversations:", err);
          }
        })
        .finally(() => {
          if (isMountedRef.current) {
            setLoading(false);
          }
        });
    },
    [tab, channel]
  );

  // Stable callback passed to ConversationThread to avoid breaking child effect dependencies
  const handleThreadStatusChange = useCallback(() => {
    if (!isMountedRef.current) return;
    fetchConversations(false);
  }, [fetchConversations]);

  // Initial load + immediate mailbox sync so incoming replies appear immediately
  useEffect(() => {
    let ignore = false;

    const loadInbox = () => {
      if (!ignore && isMountedRef.current && (typeof document === "undefined" || !document.hidden)) {
        fetchConversations(true);
      }
    };

    loadInbox();

    // Auto-refresh interval (every 15 seconds) while inbox is open and tab is visible
    const interval = setInterval(loadInbox, 15000);

    // Revalidate when user returns to this browser tab
    const handleFocus = () => {
      if (!ignore && isMountedRef.current && (typeof document === "undefined" || !document.hidden)) {
        loadInbox();
      }
    };
    window.addEventListener("focus", handleFocus);

    return () => {
      ignore = true;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
    };
  }, [fetchConversations]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    fetchConversations(true).finally(() => {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    });
  };

  const handleConversationLoaded = useCallback((data) => {
    setActiveConversationData(data);
  }, []);

  const handleDeleteConversation = useCallback((conversationId) => {
    // Clear cached conversation lists to prevent resurrection on tab change
    clearCache("/api/conversations");

    setConversations((prev) => {
      const updated = prev.filter((c) => c.id !== conversationId);
      const unreadSum = updated.reduce((sum, c) => sum + (c.unreadCount || 0), 0);
      queueMicrotask(() => {
        window.dispatchEvent(
          new CustomEvent("dripx:unread-changed", { detail: { totalUnread: unreadSum } })
        );
      });
      return updated;
    });

    setActiveId((curr) => (curr === conversationId ? null : curr));
    setActiveConversationData((curr) => (curr?.id === conversationId ? null : curr));
  }, []);

  const handleQuickDelete = async (conversationId) => {
    if (!confirm("Are you sure you want to delete this conversation and its messages?")) return;
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, { method: "DELETE" });
      if (res.ok) {
        handleDeleteConversation(conversationId);
      } else {
        alert("Failed to delete conversation");
      }
    } catch (err) {
      console.error("Delete conversation failed:", err);
    }
  };

  const handleSelectConversation = (item) => {
    setActiveId(item.id);
    if (item.unreadCount > 0) {
      setConversations((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, unreadCount: 0 } : c))
      );
      const newTotal = Math.max(0, totalUnread - (item.unreadCount || 0));
      queueMicrotask(() => {
        window.dispatchEvent(
          new CustomEvent("dripx:unread-changed", { detail: { totalUnread: newTotal } })
        );
      });
    }
  };

  const handleSequenceAction = async (action) => {
    if (!activeId) return;
    try {
      const res = await fetch(`/api/conversations/${activeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        // Refresh active conversation details
        const updated = await fetch(`/api/conversations/${activeId}`).then((r) => r.json());
        setActiveConversationData(updated);
        fetchConversations(false);
      }
    } catch (err) {
      console.error("Failed to toggle sequence status:", err);
    }
  };

  const filtered = conversations.filter((c) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const name = c.lead ? `${c.lead.firstName || ""} ${c.lead.lastName || ""}`.toLowerCase() : "";
    const email = (c.lead?.email || "").toLowerCase();
    const company = (c.lead?.company || "").toLowerCase();
    const preview = (c.lastMessagePreview || "").toLowerCase();

    return name.includes(q) || email.includes(q) || company.includes(q) || preview.includes(q);
  });

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="h-full min-h-0 flex flex-col p-4 bg-[#F2F2F6] overflow-hidden">
      {/* Header */}
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
            Unified Inbox
          </h1>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
            Multi-Channel Outreach
          </span>
          <Info className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200/90 bg-white text-gray-500 shadow-2xs transition hover:bg-gray-50 active:scale-95 cursor-pointer"
            title="Refresh inbox"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-indigo-400" : ""}`} />
          </button>

          {totalUnread > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-500 border border-indigo-100 text-xs font-semibold flex items-center gap-1.5 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              {totalUnread} unread
            </span>
          )}
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-[330px_1fr_310px] gap-4 flex-1 min-h-0 overflow-hidden">
        {/* Sidebar: Conversation List */}
        <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden flex flex-col min-h-0">
          {/* Search & Channel Filter */}
          <div className="p-3.5 border-b border-gray-100 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-full border border-gray-200/90 bg-white text-xs text-gray-700 placeholder:text-gray-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-400/40 shadow-2xs transition-all"
              />
            </div>

            {/* Channel Badges Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-full border border-gray-100">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const active = channel === ch.key;
                return (
                  <button
                    key={ch.key}
                    onClick={() => setChannel(ch.key)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-full text-[11px] font-medium transition-all cursor-pointer active:scale-95 ${
                      active
                        ? "bg-white text-indigo-600 shadow-2xs font-semibold border border-gray-200/60"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {Icon && <Icon className="w-3 h-3" />}
                    <span>{ch.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Status Tabs */}
            <div className="flex items-center gap-5 px-1 pt-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`text-xs font-medium transition-colors relative pb-1.5 cursor-pointer ${
                    tab === t.key ? "text-indigo-600 font-semibold" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {t.label}
                  {tab === t.key && (
                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-indigo-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {loading ? (
              <div className="p-2 space-y-2 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50/70">
                    <div className="w-10 h-10 rounded-full bg-gray-200 shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 w-28 bg-gray-200 rounded" />
                      <div className="h-3 w-40 bg-gray-100 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400 space-y-1">
                <p className="font-medium text-gray-500">No conversations found</p>
                <p>Try switching filter tabs or clearing your search.</p>
              </div>
            ) : (
              filtered.map((item) => {
                const isSelected = activeId === item.id;
                const isUnread = item.unreadCount > 0;
                const isEmail = item.channel === "email";

                return (
                  <div
                    key={item.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => handleSelectConversation(item)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        handleSelectConversation(item);
                      }
                    }}
                    className={`w-full px-3.5 py-3.5 flex items-start gap-3 text-left transition-colors relative group cursor-pointer ${
                      isSelected
                        ? "bg-indigo-50/50"
                        : isUnread
                          ? "bg-white hover:bg-gray-50/80"
                          : "bg-white hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Unread Accent Bar */}
                    {isUnread && (
                      <span className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-400 rounded-r-md" />
                    )}

                    {/* Avatar with Channel Badge */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 font-bold flex items-center justify-center text-xs border border-indigo-100 shadow-2xs">
                        {(item.lead?.firstName?.[0] || "?").toUpperCase()}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full text-white text-[9px] shadow-2xs ${
                          isEmail ? "bg-sky-500" : "bg-[#0A66C2]"
                        }`}
                        title={isEmail ? "Email conversation" : "LinkedIn conversation"}
                      >
                        {isEmail ? <Mail className="w-2.5 h-2.5" /> : <FaLinkedin className="w-2.5 h-2.5" />}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className={`text-xs truncate ${
                            isUnread ? "font-bold text-gray-900" : "font-semibold text-gray-700"
                          }`}
                        >
                          {item.lead
                            ? `${item.lead.firstName || ""} ${item.lead.lastName || ""}`.trim() || item.lead.email
                            : "Unknown Contact"}
                        </h3>
                        {/* Zero-jitter fixed-width container: timestamp fades out, trash button fades in */}
                        <div className="relative flex items-center justify-end shrink-0 min-w-[56px] h-5">
                          <span className="text-[11px] text-gray-400 transition-opacity duration-150 group-hover:opacity-0 select-none">
                            {formatMessageTime(item.lastMessageAt)}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleQuickDelete(item.id);
                            }}
                            className="absolute right-0 opacity-0 group-hover:opacity-100 p-1 rounded-full text-gray-400 hover:text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-all duration-150 cursor-pointer active:scale-95"
                            title="Delete conversation"
                            aria-label="Delete conversation"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.lead?.company && (
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {item.lead.company}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-xs text-gray-500 truncate">
                          {item.lastMessageDirection === "outbound" && (
                            <span className="text-indigo-500 font-semibold">You: </span>
                          )}
                          {item.lastMessagePreview || "No messages yet"}
                        </p>
                        {isUnread && (
                          <span className="px-1.5 py-0.5 rounded-full bg-indigo-400 text-white text-[10px] font-bold shrink-0">
                            {item.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Thread View / Empty State */}
        <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 flex flex-col relative overflow-hidden min-h-0">
          {activeId ? (
            <ConversationThread
              conversationId={activeId}
              onStatusChange={handleThreadStatusChange}
              onConversationLoaded={handleConversationLoaded}
              onDeleteConversation={handleDeleteConversation}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100 shadow-2xs">
                  <Mail className="w-10 h-10 text-indigo-400" />
                </div>
                <div className="absolute -top-2 -right-2 bg-white border border-gray-200/90 rounded-full px-3 py-1 text-gray-400 text-xs shadow-2xs font-mono">
                  Inbox
                </div>
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Ready to respond?</h2>
              <p className="text-gray-400 mt-1 text-xs max-w-sm">
                Select any conversation on the left to review prospect responses, reply across Email or LinkedIn, and manage active sequences.
              </p>
            </div>
          )}
        </div>

        {/* Column 3: Lead Intelligence & Campaign Journey */}
        <div className="bg-white rounded-2xl shadow-2xs border border-gray-200/90 overflow-hidden flex flex-col min-h-0">
          <LeadDetailPanel
            conversation={activeConversationData}
            lead={activeConversationData?.lead}
            campaign={activeConversationData?.campaign}
            loading={loading && !!activeId}
            onSequenceAction={handleSequenceAction}
          />
        </div>
      </div>
    </div>
  );
}
