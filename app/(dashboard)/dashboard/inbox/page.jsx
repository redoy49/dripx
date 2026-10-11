"use client";

import { useCallback, useEffect, useState } from "react";
import { Info, Search, Mail, RefreshCw } from "lucide-react";
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
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [activeConversationData, setActiveConversationData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setRefreshing(true);
    const query = new URLSearchParams({ filter: tab });
    if (channel !== "all") query.set("channel", channel);

    return fetch(`/api/conversations?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setConversations(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load conversations:", err);
        setLoading(false);
      })
      .finally(() => {
        setRefreshing(false);
      });
  }, [tab, channel]);

  useEffect(() => {
    let ignore = false;
    const query = new URLSearchParams({ filter: tab });
    if (channel !== "all") query.set("channel", channel);

    fetch(`/api/conversations?${query.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (!ignore) {
          setConversations(data.items || []);
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error("Failed to load conversations:", err);
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [tab, channel]);

  const handleConversationLoaded = useCallback((data) => {
    setActiveConversationData(data);
  }, []);

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
        load();
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
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <h1
            className="text-2xl font-semibold"
            style={{
              background: "linear-gradient(90deg, #ee7aee 0%, #fe9b85 100%)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Unified Inbox
          </h1>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
            Multi-Channel Outreach
          </span>
          <Info className="w-4 h-4 text-gray-400" />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={load}
            disabled={refreshing}
            className="p-2 transition-colors rounded-lg bg-gray-50 hover:bg-gray-100 border border-gray-100 text-gray-500 hover:text-gray-700"
            title="Refresh inbox"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-violet-500" : ""}`} />
          </button>

          {totalUnread > 0 && (
            <span className="px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 border border-violet-100 text-xs font-semibold flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-violet-500 animate-pulse" />
              {totalUnread} unread
            </span>
          )}
        </div>
      </div>

      {/* 3-Column Layout */}
      <div className="grid grid-cols-[330px_1fr_310px] gap-4 h-[calc(100vh-115px)]">
        {/* Sidebar: Conversation List */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
          {/* Search & Channel Filter */}
          <div className="p-3.5 border-b border-gray-100 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email, company..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-10 pr-3 rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-300 transition-all"
              />
            </div>

            {/* Channel Badges Selector */}
            <div className="flex items-center gap-1.5 p-1 bg-gray-50 rounded-lg border border-gray-100">
              {CHANNELS.map((ch) => {
                const Icon = ch.icon;
                const active = channel === ch.key;
                return (
                  <button
                    key={ch.key}
                    onClick={() => setChannel(ch.key)}
                    className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-md text-[11px] font-medium transition-all ${
                      active
                        ? "bg-white text-violet-600 shadow-2xs font-semibold"
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
                  className={`text-xs font-medium transition-colors relative pb-1.5 ${
                    tab === t.key ? "text-violet-600 font-semibold" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {t.label}
                  {tab === t.key && (
                    <span className="absolute left-0 bottom-0 w-full h-[2px] bg-violet-500 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List Items */}
          <div className="overflow-y-auto flex-1 divide-y divide-gray-50">
            {loading ? (
              <p className="p-8 text-center text-xs text-gray-400">Loading conversations...</p>
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
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveId(item.id);
                      if (item.unreadCount > 0) {
                        setConversations((prev) =>
                          prev.map((c) => (c.id === item.id ? { ...c, unreadCount: 0 } : c)),
                        );
                      }
                    }}
                    className={`w-full px-3.5 py-3.5 flex items-start gap-3 text-left transition-colors relative ${
                      isSelected
                        ? "bg-violet-50/60"
                        : isUnread
                          ? "bg-white hover:bg-gray-50/80"
                          : "bg-white hover:bg-gray-50/50"
                    }`}
                  >
                    {/* Unread Accent Bar */}
                    {isUnread && (
                      <span className="absolute left-0 top-3 bottom-3 w-1 bg-violet-500 rounded-r-md" />
                    )}

                    {/* Avatar with Channel Badge */}
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-violet-50 text-violet-700 font-bold flex items-center justify-center text-xs border border-violet-100 shadow-2xs">
                        {(item.lead?.firstName?.[0] || "?").toUpperCase()}
                      </div>
                      <span
                        className={`absolute -bottom-0.5 -right-0.5 p-0.5 rounded-full text-white text-[9px] shadow-2xs ${
                          isEmail ? "bg-blue-500" : "bg-[#0A66C2]"
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
                        <span className="text-[11px] text-gray-400 shrink-0">
                          {formatMessageTime(item.lastMessageAt)}
                        </span>
                      </div>

                      {item.lead?.company && (
                        <p className="text-[11px] text-gray-400 truncate mt-0.5">
                          {item.lead.company}
                        </p>
                      )}

                      <div className="flex items-center justify-between gap-2 mt-1">
                        <p className="text-xs text-gray-500 truncate">
                          {item.lastMessageDirection === "outbound" && (
                            <span className="text-violet-600 font-medium">You: </span>
                          )}
                          {item.lastMessagePreview || "No messages yet"}
                        </p>
                        {isUnread && (
                          <span className="px-1.5 py-0.5 rounded-full bg-violet-600 text-white text-[10px] font-bold shrink-0">
                            {item.unreadCount}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Column 2: Thread View / Empty State */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 flex flex-col relative overflow-hidden">
          {activeId ? (
            <ConversationThread
              conversationId={activeId}
              onStatusChange={load}
              onConversationLoaded={handleConversationLoaded}
            />
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <div className="relative mb-6">
                <div className="w-24 h-24 rounded-full bg-violet-50 flex items-center justify-center border border-violet-100 shadow-2xs">
                  <Mail className="w-10 h-10 text-violet-400" />
                </div>
                <div className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-xl px-2.5 py-1 text-gray-400 text-xs shadow-xs font-mono">
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
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
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
