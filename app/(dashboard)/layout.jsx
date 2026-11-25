"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { prefetchData } from "@/app/lib/swrCache";
import FeatureRequestModal from "./layout/FeatureRequestModal";
import {
  LayoutDashboard,
  Mail,
  Users,
  Settings,
  Megaphone,
  Database,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ArrowUpRight,
  Bell,
  BadgeCheck,
  Sparkles,
} from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
  { name: "Inbox", href: "/dashboard/inbox", icon: Mail },
  { name: "Leads", href: "/dashboard/leads", icon: Database },
  { name: "Teams", href: "/dashboard/teams", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "AI Agent", href: "/dashboard/agent", icon: Sparkles },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dripx_sidebar_collapsed");
      if (saved !== null) {
        queueMicrotask(() => {
          setCollapsed(saved === "true");
        });
      } else if (typeof window !== "undefined" && window.innerWidth < 1024) {
        queueMicrotask(() => {
          setCollapsed(true);
        });
      }
    } catch {}
  }, []);

  const toggleSidebar = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("dripx_sidebar_collapsed", String(next));
      } catch {}
      return next;
    });
  };

  useEffect(() => {
    let ignore = false;
    let isFetching = false;

    const checkUnread = () => {
      if (typeof document !== "undefined" && document.hidden) return;
      if (isFetching) return;
      isFetching = true;

      fetch("/api/conversations/unread-count")
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data && !ignore) {
            setUnreadCount(data.totalUnread || 0);
          }
        })
        .catch(() => {})
        .finally(() => {
          isFetching = false;
        });
    };

    // Initial check (asynchronous callback avoids react-hooks/set-state-in-effect)
    fetch("/api/conversations/unread-count")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && !ignore) {
          setUnreadCount(data.totalUnread || 0);
        }
      })
      .catch(() => {});

    // Auto-poll unread count every 15 seconds across any active section of DripX if visible
    const interval = setInterval(checkUnread, 15000);

    // Revalidate when user returns to window tab
    const handleFocus = () => {
      checkUnread();
    };
    window.addEventListener("focus", handleFocus);

    // Real-time synchronization event from Unified Inbox when messages are read or synced
    const handleUnreadChanged = (event) => {
      const newTotal = event.detail?.totalUnread;
      queueMicrotask(() => {
        if (ignore) return;
        if (typeof newTotal === "number") {
          setUnreadCount(newTotal);
        } else {
          checkUnread();
        }
      });
    };
    window.addEventListener("dripx:unread-changed", handleUnreadChanged);

    return () => {
      ignore = true;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("dripx:unread-changed", handleUnreadChanged);
    };
  }, []);

  useEffect(() => {
    let ignore = false;
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!ignore && data?.user) {
          setCurrentUser(data.user);
        }
      })
      .catch(() => {});

    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      ignore = true;
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // smarter active checker
  const isActive = (href) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname.startsWith(href);
  };

  // Pre-warms in-memory cache on link hover/touch so navigation data is ready before click
  const handlePrefetch = (href) => {
    if (href === "/dashboard") {
      prefetchData("/api/dashboard/summary?range=7d");
    } else if (href === "/dashboard/campaigns") {
      prefetchData("/api/campaigns");
    } else if (href === "/dashboard/leads") {
      prefetchData("/api/leads?page=1&limit=25");
    } else if (href === "/dashboard/inbox") {
      prefetchData("/api/conversations?filter=all");
    } else if (href === "/dashboard/agent") {
      prefetchData("/api/agent/threads");
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F2F6] p-2.5 sm:p-3 gap-2.5 sm:gap-3">
      {/* Floating Rounded Sidebar (matching user reference image) */}
      <aside
        className={`h-full rounded-[26px] border border-gray-200/90 bg-white shadow-2xs flex flex-col shrink-0 transition-all duration-300 ease-in-out relative select-none overflow-hidden ${
          collapsed ? "w-20 px-3 py-4" : "w-64 p-4.5"
        }`}
      >
        {/* Brand Logo & Collapse Toggle Arrow Button */}
        <div className={`flex items-center mb-5 ${collapsed ? "flex-col gap-3 justify-center" : "justify-between"}`}>
          <Link
            href="/"
            className="flex items-center gap-2 group transition"
            title="Go to home page"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-400 to-violet-400 flex items-center justify-center text-white font-black text-base shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <span>D</span>
            </div>
            {!collapsed && (
              <span className="text-xl font-bold tracking-tight text-gray-900 transition-opacity duration-200">
                Dripi<span className="text-[#FF385C] font-black text-2xl -ml-0.5 inline-block -rotate-3">X</span>
              </span>
            )}
          </Link>

          {/* Minimize / Expand Circular Arrow Button (matching reference image) */}
          <button
            type="button"
            onClick={toggleSidebar}
            className="w-7 h-7 rounded-full bg-indigo-400 hover:bg-indigo-500 text-white flex items-center justify-center shadow-2xs transition active:scale-95 hover:scale-105 cursor-pointer shrink-0"
            title={collapsed ? "Expand sidebar" : "Minimize sidebar"}
            aria-label={collapsed ? "Expand sidebar" : "Minimize sidebar"}
          >
            {collapsed ? (
              <ChevronRight size={15} strokeWidth={2.5} />
            ) : (
              <ChevronLeft size={15} strokeWidth={2.5} />
            )}
          </button>
        </div>

        {/* User Profile Card with Verified Badge & Dropdown */}
        <div ref={userMenuRef} className="relative mb-3">
          <button
            type="button"
            onClick={() => setUserMenuOpen((prev) => !prev)}
            className={`w-full flex items-center rounded-xl hover:bg-gray-50 transition cursor-pointer group ${
              collapsed ? "justify-center p-1.5" : "justify-between p-2 -mx-2 text-left"
            }`}
            title={collapsed ? (currentUser?.name || "User Profile") : undefined}
          >
            <div className="flex items-center gap-3 min-w-0">
              {/* Profile Picture with Green Verified Icon */}
              <div className="relative shrink-0">
                <Image
                  src={currentUser?.avatarUrl || "/avatar_judy.jpg"}
                  alt={currentUser?.name || "Judy Jackson"}
                  width={collapsed ? 36 : 40}
                  height={collapsed ? 36 : 40}
                  unoptimized
                  className={`${collapsed ? "w-9 h-9" : "w-10 h-10"} rounded-full object-cover border border-gray-100 shadow-2xs group-hover:ring-2 group-hover:ring-violet-200 transition`}
                />
                {/* Verified Green Badge */}
                <span className="absolute -bottom-1 -right-1 flex items-center justify-center">
                  <BadgeCheck
                    size={collapsed ? 15 : 18}
                    className="text-white fill-emerald-500"
                    strokeWidth={2.4}
                  />
                </span>
              </div>

              {!collapsed && (
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-gray-800 truncate leading-tight">
                    {currentUser?.name || "Judy Jackson"}
                  </p>
                  <div className="flex items-center gap-1 text-[11px] text-gray-400 mt-0.5">
                    <ArrowUpRight size={12} className="text-gray-400" />
                    <span>Warming up</span>
                  </div>
                </div>
              )}
            </div>

            {!collapsed && (
              <ChevronDown
                size={16}
                className={`text-gray-400 transition-transform duration-200 ${
                  userMenuOpen ? "rotate-180" : ""
                }`}
              />
            )}
          </button>

          {/* Dropdown Menu for Profile Details & Logout */}
          {userMenuOpen && (
            <div className={`absolute top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
              collapsed ? "left-12" : "left-0"
            }`}>
              <div className="px-3 py-2 border-b border-gray-50">
                <p className="text-xs font-bold text-gray-800 truncate">
                  {currentUser?.name || "Judy Jackson"}
                </p>
                <p className="text-[11px] text-gray-400 truncate">
                  {currentUser?.email || "judy@dripx.io"}
                </p>
              </div>

              <Link
                href="/dashboard/settings"
                onClick={() => setUserMenuOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
              >
                <Settings size={14} className="text-gray-400" />
                <span>Account & Settings</span>
              </Link>

              <div className="my-1 border-t border-gray-50" />

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition cursor-pointer text-left"
              >
                <LogOut size={14} />
                <span>Log out</span>
              </button>
            </div>
          )}

          {/* Subtle divider below user profile */}
          <div className="border-b border-gray-100 pt-2" />
        </div>

        {/* Navigation Menu */}
        <nav className="space-y-1.5 mt-1 flex-1">
          {menu.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={i}
                href={item.href}
                prefetch={true}
                onMouseEnter={() => handlePrefetch(item.href)}
                onTouchStart={() => handlePrefetch(item.href)}
                title={collapsed ? item.name : undefined}
                className={`flex items-center rounded-xl transition group relative ${
                  collapsed
                    ? "justify-center p-3 text-base"
                    : "gap-3 p-2.5 text-[15px]"
                } ${
                  active
                    ? "bg-indigo-400 text-white shadow-xs font-semibold"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon size={19} className="shrink-0" />
                {!collapsed && <span>{item.name}</span>}

                {/* Navigation-wide Unread Message Badge */}
                {item.name === "Inbox" && unreadCount > 0 && (
                  collapsed ? (
                    <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
                  ) : (
                    <span
                      className={`ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full shadow-xs ${
                        active ? "bg-white text-indigo-500" : "bg-indigo-400 text-white"
                      }`}
                    >
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom Section: Free Trial Card & Request New Feature */}
        <div className="mt-auto space-y-2.5 pt-3">
          {collapsed ? (
            /* Collapsed Compact Trial Indicator */
            <Link
              href="/dashboard/settings"
              title="Free trial (4d remaining) - Click to subscribe"
              className="w-10 h-10 rounded-xl bg-[#F8F9FE] border border-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-700 hover:bg-indigo-50 hover:text-indigo-400 hover:border-indigo-200 transition mx-auto shadow-2xs"
            >
              4d
            </Link>
          ) : (
            /* Expanded Full Free Trial Card */
            <div className="rounded-2xl border border-gray-100 bg-[#F8F9FE] p-4 shadow-2xs relative overflow-hidden">
              {/* Subtle soft backdrop accents */}
              <div className="absolute -top-6 -right-6 w-20 h-20 rounded-full bg-indigo-100/40 pointer-events-none blur-sm" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-orange-100/30 pointer-events-none blur-sm" />

              <div className="relative flex items-start justify-between gap-2 mb-3.5">
                <div>
                  <h4 className="text-sm font-bold text-gray-900 leading-tight">Free trial</h4>
                  <p className="text-[11px] text-[#C29068] font-medium mt-1">
                    Expires Jul 5, 2026
                  </p>
                </div>

                {/* Circular Gauge "4d" with partial progress ring */}
                <div className="relative w-10 h-10 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="14" fill="white" stroke="#F1F1F5" strokeWidth="3" />
                    <circle
                      cx="18"
                      cy="18"
                      r="14"
                      fill="transparent"
                      stroke="#F97316"
                      strokeWidth="3"
                      strokeDasharray="88"
                      strokeDashoffset="26"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute text-[11px] font-bold text-gray-700">4d</span>
                </div>
              </div>

              {/* Subscribe Button */}
              <Link
                href="/dashboard/settings"
                className="w-full block text-center rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-bold py-2 text-xs shadow-sm transition active:scale-95 cursor-pointer"
              >
                Subscribe
              </Link>
            </div>
          )}

          {/* Request New Feature Action */}
          <button
            type="button"
            onClick={() => setFeatureModalOpen(true)}
            title={collapsed ? "Request New Feature" : undefined}
            className={`w-full flex items-center rounded-full text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-100/80 transition active:scale-95 cursor-pointer ${
              collapsed ? "justify-center p-2.5" : "gap-2.5 px-3 py-2"
            }`}
          >
            <Bell size={17} className="text-gray-400 shrink-0" />
            {!collapsed && <span>Request New Feature</span>}
          </button>
        </div>
      </aside>

      {/* Feature Request Modal */}
      <FeatureRequestModal
        isOpen={featureModalOpen}
        onClose={() => setFeatureModalOpen(false)}
      />

      {/* Main Content Floating Card - Matching height, border & rounded corners */}
      <main className="flex-1 h-full rounded-[26px] border border-gray-200/90 bg-[#FAFAFC] shadow-2xs overflow-hidden flex flex-col min-w-0">
        <div
          className={`flex-1 min-h-0 ${
            pathname === "/dashboard/inbox" || pathname === "/dashboard/agent"
              ? "h-full overflow-hidden flex flex-col"
              : "h-full overflow-y-auto"
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
