"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  Users,
  Settings,
  Megaphone,
  Database,
  LogOut,
} from "lucide-react";

const menu = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
  { name: "Inbox", href: "/dashboard/inbox", icon: Mail },
  { name: "Leads", href: "/dashboard/leads", icon: Database },
  { name: "Teams", href: "/dashboard/teams", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);

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
      if (typeof event.detail?.totalUnread === "number") {
        setUnreadCount(event.detail.totalUnread);
      } else {
        checkUnread();
      }
    };
    window.addEventListener("dripx:unread-changed", handleUnreadChanged);

    return () => {
      ignore = true;
      clearInterval(interval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("dripx:unread-changed", handleUnreadChanged);
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

  return (
    <div className="flex h-screen bg-[#FAF9F6]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-r-gray-100 p-5 flex flex-col">
        <h1 className="text-xl font-bold text-[#6367FF] mb-6">DripX</h1>

        <nav className="space-y-2">
          {menu.map((item, i) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={i}
                href={item.href}
                className={`flex items-center gap-3 p-2 rounded-md text-[15px] transition ${
                  active
                    ? "bg-[#6367FF]/10 text-[#6367FF]"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <Icon size={18} />
                <span>{item.name}</span>

                {/* Navigation-wide Unread Message Badge */}
                {item.name === "Inbox" && unreadCount > 0 && (
                  <span className="ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold text-white bg-[#6367FF] rounded-full shadow-xs animate-in fade-in duration-200">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Upgrade */}
        <div className="mt-auto p-4 bg-[#6367FF] text-white rounded-xl">
          <p className="text-sm">Free trial</p>
          <p className="text-xs opacity-80">5 days left</p>

          <button className="mt-3 w-full bg-white text-[#6367FF] py-2 rounded-full text-xs font-bold transition hover:bg-white/90 active:scale-95 shadow-sm">
            Upgrade
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="mt-3 flex items-center gap-2 px-3 py-2 rounded-full text-sm text-gray-500 hover:bg-gray-100 transition"
        >
          <LogOut size={16} />
          Log out
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">{children}</main>
    </div>
  );
}
