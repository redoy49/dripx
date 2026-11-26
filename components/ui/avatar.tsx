"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const AvatarContext = React.createContext<{
  hasError: boolean;
  setHasError: (v: boolean) => void;
}>({ hasError: false, setHasError: () => {} });

export function Avatar({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const [hasError, setHasError] = React.useState(false);

  return (
    <AvatarContext.Provider value={{ hasError, setHasError }}>
      <div
        className={cn(
          "relative flex h-8 w-8 shrink-0 overflow-hidden rounded-full bg-slate-100",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </AvatarContext.Provider>
  );
}

export function AvatarImage({
  className,
  src,
  alt = "",
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement>) {
  const { hasError, setHasError } = React.useContext(AvatarContext);
  if (!src || hasError) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setHasError(true)}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
}

export function AvatarFallback({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
  const { hasError } = React.useContext(AvatarContext);
  if (!hasError && React.Children.count(children) === 0) return null;

  return (
    <span
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full bg-slate-100 text-[11px] font-semibold text-slate-700",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
