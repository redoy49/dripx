"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { clearCache, prefetchData, setCacheScope } from "@/app/lib/swrCache";
import SidebarProfileMenu from "./SidebarProfileMenu";
import SidebarNav from "./SidebarNav";
import SidebarTrialCard from "./SidebarTrialCard";

const FeatureRequestModal = dynamic(() => import("./FeatureRequestModal"), {
  ssr: false,
});

export default function DashboardShell({
  initialUser,
  initialUnreadCount = 0,
  workspaceId = null,
  children,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [featureModalOpen, setFeatureModalOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setCacheScope(workspaceId || initialUser?.id || null);
  }, [initialUser?.id, workspaceId]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("dripx_sidebar_collapsed");
      if (saved !== null) {
        queueMicrotask(() => setCollapsed(saved === "true"));
      } else if (typeof window !== "undefined" && window.innerWidth < 1024) {
        queueMicrotask(() => setCollapsed(true));
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
          if (data && !ignore) setUnreadCount(data.totalUnread || 0);
        })
        .catch(() => {})
        .finally(() => {
          isFetching = false;
        });
    };

    const interval = setInterval(checkUnread, 15000);
    window.addEventListener("focus", checkUnread);

    const handleUnreadChanged = (event) => {
      const newTotal = event.detail?.totalUnread;
      queueMicrotask(() => {
        if (ignore) return;
        if (typeof newTotal === "number") setUnreadCount(newTotal);
        else checkUnread();
      });
    };
    window.addEventListener("dripx:unread-changed", handleUnreadChanged);

    return () => {
      ignore = true;
      clearInterval(interval);
      window.removeEventListener("focus", checkUnread);
      window.removeEventListener("dripx:unread-changed", handleUnreadChanged);
    };
  }, []);

  const handleLogout = async () => {
    clearCache();
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const isActive = (href) =>
    href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href);

  const handlePrefetch = (href) => {
    if (href === "/dashboard") prefetchData("/api/dashboard/summary?range=7d");
    else if (href === "/dashboard/campaigns") prefetchData("/api/campaigns");
    else if (href === "/dashboard/leads") prefetchData("/api/leads?page=1&limit=25");
    else if (href === "/dashboard/inbox") prefetchData("/api/conversations?filter=all");
    else if (href === "/dashboard/teams") prefetchData("/api/team/profile?range=7");
    else if (href === "/dashboard/agent") prefetchData("/api/agent/threads");
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F2F2F6] p-2.5 sm:p-3 gap-2.5 sm:gap-3">
      <aside
        className={`h-full rounded-[26px] border border-gray-200/90 bg-white shadow-2xs flex flex-col shrink-0 transition-all duration-300 ease-in-out relative select-none overflow-hidden ${
          collapsed ? "w-20 px-3 py-4" : "w-64 p-4.5"
        }`}
      >
        <div
          className={`flex items-center mb-5 ${
            collapsed ? "flex-col gap-3 justify-center" : "justify-between"
          }`}
        >
          <Link href="/" className="flex items-center group transition" title="Go to home page">
            {collapsed ? (
              <Image
                src="/dripx.svg"
                alt="DripX"
                width={32}
                height={32}
                priority
                className="h-8 w-8 object-cover object-left group-hover:scale-105 transition-transform shrink-0"
              />
            ) : (
              <Image
                src="/dripx.svg"
                alt="DripX"
                width={116}
                height={32}
                priority
                className="h-7 w-auto object-contain group-hover:scale-[1.02] transition-transform"
              />
            )}
          </Link>

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

        <SidebarProfileMenu user={initialUser} collapsed={collapsed} onLogout={handleLogout} />

        <SidebarNav
          collapsed={collapsed}
          unreadCount={unreadCount}
          isActive={isActive}
          onPrefetch={handlePrefetch}
        />

        <SidebarTrialCard
          collapsed={collapsed}
          onOpenFeatureModal={() => setFeatureModalOpen(true)}
        />
      </aside>

      {featureModalOpen && (
        <FeatureRequestModal
          isOpen={featureModalOpen}
          onClose={() => setFeatureModalOpen(false)}
        />
      )}

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
