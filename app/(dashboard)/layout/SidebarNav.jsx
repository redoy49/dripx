"use client";

import Link from "next/link";
import {
  Database,
  LayoutDashboard,
  Mail,
  Megaphone,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";

const MENU = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Campaigns", href: "/dashboard/campaigns", icon: Megaphone },
  { name: "Inbox", href: "/dashboard/inbox", icon: Mail },
  { name: "Leads", href: "/dashboard/leads", icon: Database },
  { name: "Teams", href: "/dashboard/teams", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
  { name: "AI Agent", href: "/dashboard/agent", icon: Sparkles },
];

export default function SidebarNav({
  collapsed,
  unreadCount,
  isActive,
  onPrefetch,
}) {
  return (
    <nav className="space-y-1.5 mt-1 flex-1">
      {MENU.map((item, i) => {
        const Icon = item.icon;
        const active = isActive(item.href);

        return (
          <Link
            key={i}
            href={item.href}
            prefetch={true}
            onMouseEnter={() => onPrefetch(item.href)}
            onTouchStart={() => onPrefetch(item.href)}
            title={collapsed ? item.name : undefined}
            className={`flex items-center rounded-full transition group relative ${
              collapsed ? "justify-center p-3 text-base" : "gap-3 p-2 text-[15px]"
            } ${
              active
                ? "bg-indigo-400 text-white shadow-xs font-semibold"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            }`}
          >
            <Icon size={19} className="shrink-0 ml-1.5" />
            {!collapsed && <span>{item.name}</span>}

            {item.name === "Inbox" && unreadCount > 0 &&
              (collapsed ? (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white" />
              ) : (
                <span
                  className={`ml-auto flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full shadow-xs ${
                    active ? "bg-white text-indigo-500" : "bg-indigo-400 text-white"
                  }`}
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              ))}
          </Link>
        );
      })}
    </nav>
  );
}
