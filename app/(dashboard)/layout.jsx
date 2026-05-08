"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Mail,
  Users,
  Settings,
  Megaphone,
  Database,
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
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Footer / Upgrade */}
        <div className="mt-auto p-4 bg-[#6367FF] text-white rounded-xl">
          <p className="text-sm">Free trial</p>
          <p className="text-xs opacity-80">5 days left</p>

          <button className="mt-3 w-full bg-white text-[#6367FF] py-2 rounded-lg text-sm">
            Upgrade
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 overflow-y-auto">{children}</main>
    </div>
  );
}
