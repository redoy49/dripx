"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, BadgeCheck, ChevronDown, LogOut, Settings } from "lucide-react";

function getInitials(name, email) {
  const source = (name || email?.split("@")[0] || "U").trim();
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.slice(0, 2).toUpperCase();
}

export default function SidebarProfileMenu({ user, collapsed, onLogout }) {
  const [open, setOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const displayName = user?.name || user?.email?.split("@")[0] || "Account";
  const displayEmail = user?.email || "";
  const avatarUrl = user?.avatarUrl && user.avatarUrl !== failedAvatarUrl ? user.avatarUrl : null;
  const initials = getInitials(displayName, displayEmail);

  return (
    <div ref={menuRef} className="relative mb-3">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={`w-full flex items-center rounded-xl hover:bg-gray-50 transition cursor-pointer group ${
          collapsed ? "justify-center p-1.5" : "justify-between p-2 -mx-2 text-left"
        }`}
        title={collapsed ? displayName : undefined}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Profile Picture or Initials Avatar with Green Verified Icon */}
          <div className="relative shrink-0">
            {avatarUrl ? (
              <Image
                src={avatarUrl}
                alt={displayName}
                width={collapsed ? 36 : 40}
                height={collapsed ? 36 : 40}
                unoptimized
                onError={() => setFailedAvatarUrl(avatarUrl)}
                className={`${
                  collapsed ? "w-9 h-9" : "w-10 h-10"
                } rounded-full object-cover border border-gray-100 shadow-2xs group-hover:ring-2 group-hover:ring-violet-200 transition`}
              />
            ) : (
              <div
                aria-label={displayName}
                className={`${
                  collapsed ? "w-9 h-9 text-xs" : "w-10 h-10 text-sm"
                } rounded-full bg-gradient-to-br from-indigo-400 to-violet-400 flex items-center justify-center text-white font-bold border border-gray-100 shadow-2xs group-hover:ring-2 group-hover:ring-violet-200 transition`}
              >
                {initials}
              </div>
            )}

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
                {displayName}
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
              open ? "rotate-180" : ""
            }`}
          />
        )}
      </button>

      {/* Dropdown Menu for Profile Details & Logout */}
      {open && (
        <div
          className={`absolute top-full mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 ${
            collapsed ? "left-12" : "left-0"
          }`}
        >
          <div className="px-3 py-2 border-b border-gray-50">
            <p className="text-xs font-bold text-gray-800 truncate">{displayName}</p>
            {displayEmail && (
              <p className="text-[11px] text-gray-400 truncate">{displayEmail}</p>
            )}
          </div>

          <Link
            href="/dashboard/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
          >
            <Settings size={14} className="text-gray-400" />
            <span>Account & Settings</span>
          </Link>

          <div className="my-1 border-t border-gray-50" />

          <button
            type="button"
            onClick={onLogout}
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
  );
}
