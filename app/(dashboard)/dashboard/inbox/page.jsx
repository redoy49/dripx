"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Info, Search, Mail } from "lucide-react";
import ConversationThread from "@/app/(dashboard)/dashboard/inbox/ConversationThread";

const TABS = [
  { key: "all", label: "All" },
  { key: "unread", label: "Unread" },
  { key: "important", label: "Important" },
  { key: "archived", label: "Archived" },
];

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-gray-500">
      <path d="M13.6 20H10.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17 10V10C17 7.239 14.761 5 12 5 9.239 5 7 7.239 7 10V12.504C7 12.828 6.817 13.123 6.528 13.268L6.025 13.519C5.397 13.834 5 14.476 5 15.178 5 16.202 5.83 17.032 6.854 17.032H17.146C18.17 17.032 19 16.202 19 15.178 19 14.476 18.603 13.834 17.975 13.52L17.472 13.269C17.183 13.123 17 12.828 17 12.504V10Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function InboxPage() {
  const [tab, setTab] = useState("all");
  const [search, setSearch] = useState("");
  const [conversations, setConversations] = useState([]);
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(() => {
    fetch(`/api/conversations?filter=${tab}`)
      .then((res) => res.json())
      .then((data) => {
        setConversations(data.items || []);
        setLoading(false);
      });
  }, [tab]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = conversations.filter((c) => {
    const name = c.lead ? `${c.lead.firstName} ${c.lead.lastName}` : "";
    return name.toLowerCase().includes(search.toLowerCase());
  });

  const totalUnread = conversations.reduce((sum, c) => sum + (c.unreadCount || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-xs border border-gray-100 p-4 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h1
            className="text-2xl font-semibold"
            style={{
              background: "linear-gradient(90deg, #ee7aee 0%, #fe9b85 100%)",
              WebkitBackgroundClip: "text",
              color: "transparent",
            }}
          >
            Inbox
          </h1>
          <Info className="w-4 h-4 text-gray-400" />
        </div>

        <button className="relative p-2 transition-colors rounded-full hover:ring bg-gray-100 hover:ring-gray-200">
          <BellIcon />
          {totalUnread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-red-400 text-[10px] text-white flex items-center justify-center">
              {totalUnread}
            </span>
          )}
        </button>
      </div>

      {/* Layout */}
      <div className="grid grid-cols-[320px_1fr_290px] gap-4 h-[calc(100vh-110px)]">
        {/* Sidebar */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="p-4 border-b border-gray-100">
            <div className="relative">
              <Search className="w-4 h-4 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 pl-11 pr-4 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-100 focus:border-violet-200 transition-all"
              />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 mt-4 px-1">
              {TABS.map((t) => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`text-sm font-medium transition-colors relative ${
                    tab === t.key ? "text-violet-500" : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  {t.label}
                  {tab === t.key && (
                    <span className="absolute left-0 -bottom-[13px] w-full h-[2px] bg-violet-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Conversation List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <p className="p-6 text-center text-sm text-gray-400">Loading...</p>
            ) : filtered.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-400">No conversations.</p>
            ) : (
              filtered.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveId(item.id)}
                  className={`w-full px-4 py-4 border-b border-gray-100 flex items-start gap-3 text-left transition-colors hover:bg-gray-50 ${
                    activeId === item.id ? "bg-gray-50/70" : "bg-white"
                  }`}
                >
                  <div className="w-11 h-11 rounded-full bg-gray-100 flex items-center justify-center text-sm font-bold text-gray-500 shrink-0">
                    {(item.lead?.firstName?.[0] || "?").toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-[15px] font-semibold text-gray-700 truncate">
                        {item.lead ? `${item.lead.firstName} ${item.lead.lastName}`.trim() : "Unknown"}
                      </h3>
                      <span className="text-xs text-gray-400 shrink-0">
                        {item.lastMessageAt
                          ? new Date(item.lastMessageAt).toLocaleDateString()
                          : ""}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 mt-1">
                      <p className="text-sm text-gray-400 truncate">
                        {item.lastMessageDirection === "outbound" && (
                          <span className="text-violet-500 font-medium">You: </span>
                        )}
                        {item.lastMessagePreview || "No messages yet"}
                      </p>
                      {item.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-md bg-orange-400 text-white text-[11px] flex items-center justify-center shrink-0">
                          {item.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Thread / Empty state */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100 flex flex-col items-center justify-center relative overflow-hidden">
          {activeId ? (
            <ConversationThread conversationId={activeId} onStatusChange={load} />
          ) : (
            <>
              <div className="relative">
                <div className="w-36 h-36 rounded-full bg-gray-100 flex items-center justify-center">
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/742/742751.png"
                    alt="chat"
                    className="w-24 h-24 object-contain opacity-90"
                  />
                </div>
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-white border border-dashed border-gray-300 rounded-xl px-4 py-2 text-gray-400 text-lg tracking-[6px] shadow-xs">
                  •••
                </div>
                <div className="absolute top-10 -left-10 bg-white border border-dashed border-gray-300 rounded-xl px-4 py-2 text-gray-400 text-lg tracking-[6px] shadow-xs">
                  •••
                </div>
              </div>
              <div className="mt-10 text-center">
                <h2 className="text-[34px] font-semibold text-gray-800 tracking-tight">
                  Ready to chat?
                </h2>
                <p className="text-gray-400 mt-2 text-[15px]">
                  Select a conversation to start messaging
                </p>
              </div>
            </>
          )}
        </div>

        {/* Right Panel */}
        <div className="bg-white rounded-xl shadow-xs border border-gray-100" />
      </div>

      {/* Floating Chat */}
      <button
        className="fixed bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center shadow-lg text-white"
        style={{ background: "linear-gradient(to right, #7f64f5, #ae79f8)" }}
      >
        <Mail className="w-5 h-5" />
        {totalUnread > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 rounded-full bg-red-400 text-[10px] flex items-center justify-center">
            {totalUnread}
          </span>
        )}
      </button>
    </div>
  );
}
