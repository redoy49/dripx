"use client";

import * as React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

function AvatarGroup({ className, children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex items-center [&>*]:-ml-2.5 [&>*]:ring-2 [&>*]:ring-white first:[&>*]:ml-0",
        className
      )}
    >
      {children}
    </div>
  );
}

function AvatarGroupCount({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "bg-slate-100 text-slate-700 -ml-2.5 flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold ring-2 ring-white tabular-nums",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface AvatarStackItem {
  name: string;
  src?: string;
  fallback?: string;
}

interface AvatarStackProps {
  avatars: AvatarStackItem[];
  max?: number;
  className?: string;
}

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function AvatarStack({ avatars, max = 4, className }: AvatarStackProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - max;

  return (
    <AvatarGroup className={cn(className)}>
      {visible.map((avatar, i) => (
        <Avatar key={avatar.name || i} className="transition-transform duration-200 hover:-translate-y-0.5">
          <AvatarImage src={avatar.src} alt={avatar.name} />
          <AvatarFallback>{avatar.fallback ?? getInitials(avatar.name)}</AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && <AvatarGroupCount>+{overflow}</AvatarGroupCount>}
    </AvatarGroup>
  );
}
