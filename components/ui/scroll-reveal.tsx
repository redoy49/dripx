"use client";

import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface ScrollRevealProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  delayMs?: number;
  className?: string;
  threshold?: number;
  rootMargin?: string;
}

export function ScrollReveal({
  children,
  delayMs = 0,
  className,
  threshold = 0.12,
  rootMargin = "-40px 0px",
  ...props
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isRevealed, setIsRevealed] = useState(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return true;
    }
    return false;
  });

  useEffect(() => {
    if (isRevealed) return;

    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          if (delayMs > 0) {
            setTimeout(() => {
              setIsRevealed(true);
            }, delayMs);
          } else {
            setIsRevealed(true);
          }
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [isRevealed, delayMs, threshold, rootMargin]);

  return (
    <div
      ref={ref}
      className={cn(
        "reveal-on-scroll",
        isRevealed && "is-revealed",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export default ScrollReveal;
