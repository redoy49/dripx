import * as React from "react"
import { cn } from "@/lib/utils"

export interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  pauseOnHover?: boolean
  direction?: "left" | "right"
  speed?: number
}

export function Marquee({
  children,
  pauseOnHover = false,
  direction = "left",
  speed = 30,
  className,
  ...props
}: MarqueeProps) {
  return (
    <div 
      className={cn(
        "w-full overflow-hidden z-10",
        className
      )} 
      {...props}
    >
      <div className="relative flex w-full overflow-hidden py-4">
        <div 
          className={cn(
            "flex w-max shrink-0 items-center gap-12 sm:gap-16",
            direction === "right" ? "animate-marquee-reverse" : "animate-marquee",
            pauseOnHover && "hover:[animation-play-state:paused]"
          )}
          style={{ "--duration": `${speed}s` } as React.CSSProperties}
        >
          {children}
          {children}
        </div>
      </div>
    </div>
  )
}

export default Marquee;
