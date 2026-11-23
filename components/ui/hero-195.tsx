"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { BorderBeam } from "@/components/ui/border-beam";
import { Marquee } from "@/components/ui/marquee";

export interface Hero195Props extends React.HTMLAttributes<HTMLDivElement> {
  titleLine1?: string;
  titleLine2Normal?: string;
  titleLine2Italic?: string;
  description?: string;
  ctaText?: string;
  ctaHref?: string;
  trustedCount?: string;
  marqueeHeading?: string;
}

export function Hero195({
  titleLine1 = "Building bold brands",
  titleLine2Normal = "with",
  titleLine2Italic = "thoughtful design",
  description = "At DripX, we help modern outbound teams tackle the world's biggest prospecting challenges with tailored multi-channel sequences, guiding you from strategy to closed deals.",
  ctaText = "Get Started",
  ctaHref = "/register",
  trustedCount = "Trusted by 1000+ clients",
  marqueeHeading = "Loved by 1000+ big and small brands around the world",
  className,
  ...props
}: Hero195Props) {
  // Brand SVG Logos for the Infinite Marquee
  const logos = [
    {
      name: "Logoipsum Waves",
      svg: (
        <svg className="h-6 w-auto text-sky-500 fill-current" viewBox="0 0 120 32">
          <path d="M12 4C7.58 4 4 7.58 4 12c0 3.32 2.03 6.16 4.95 7.37L6.5 24h4.2l1.5-3h1.6l1.5 3h4.2l-2.45-4.63C19.97 18.16 22 15.32 22 12c0-4.42-3.58-8-8-8zm0 4c2.21 0 4 1.79 4 4s-1.79 4-4 4-4-1.79-4-4 1.79-4 4-4z" />
          <text x="30" y="21" fontFamily="sans-serif" fontSize="15" fontWeight="bold" fill="currentColor">logoipsum</text>
        </svg>
      ),
    },
    {
      name: "Logoipsum Helix",
      svg: (
        <svg className="h-6 w-auto text-emerald-500 fill-current" viewBox="0 0 120 32">
          <circle cx="10" cy="16" r="6" />
          <circle cx="18" cy="10" r="4" opacity="0.7" />
          <circle cx="18" cy="22" r="4" opacity="0.7" />
          <text x="32" y="21" fontFamily="sans-serif" fontSize="15" fontWeight="bold" fill="currentColor">logoipsum</text>
        </svg>
      ),
    },
    {
      name: "Logoipsum Blocks",
      svg: (
        <svg className="h-6 w-auto text-rose-500 fill-current" viewBox="0 0 120 32">
          <rect x="4" y="8" width="7" height="7" rx="1.5" />
          <rect x="13" y="8" width="7" height="7" rx="1.5" />
          <rect x="8.5" y="17" width="7" height="7" rx="1.5" />
          <text x="28" y="21" fontFamily="sans-serif" fontSize="15" fontWeight="bold" fill="currentColor">logoipsum</text>
        </svg>
      ),
    },
    {
      name: "Logoipsum Spark",
      svg: (
        <svg className="h-6 w-auto text-amber-500 fill-current" viewBox="0 0 120 32">
          <path d="M12 4l2.5 5.5L20 12l-5.5 2.5L12 20l-2.5-5.5L4 12l5.5-2.5z" />
          <text x="28" y="21" fontFamily="sans-serif" fontSize="15" fontWeight="bold" fill="currentColor">logoipsum</text>
        </svg>
      ),
    },
    {
      name: "Logoipsum Flow",
      svg: (
        <svg className="h-6 w-auto text-indigo-500 fill-current" viewBox="0 0 120 32">
          <path d="M6 16c2-4 6-4 8 0s6 4 8 0" stroke="currentColor" strokeWidth="3" fill="none" strokeLinecap="round" />
          <text x="30" y="21" fontFamily="sans-serif" fontSize="15" fontWeight="bold" fill="currentColor">logoipsum</text>
        </svg>
      ),
    },
  ];

  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-white text-gray-900 pt-8 sm:pt-14 pb-16",
        className
      )}
      {...props}
    >
      {/* 1. Ambient Pastel Radial Glows matching image */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 h-[650px] w-[650px] rounded-full bg-gradient-to-tr from-sky-200/40 via-sky-100/30 to-transparent blur-3xl"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-40 -right-40 h-[650px] w-[650px] rounded-full bg-gradient-to-bl from-amber-200/35 via-orange-100/25 to-transparent blur-3xl"
        aria-hidden="true"
      />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* 2. Bold Headline with Serif Italic Accent */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-neutral-900 leading-[1.08]">
          <span className="block font-sans">{titleLine1}</span>
          <span className="block mt-1 sm:mt-2">
            <span className="font-sans font-semibold mr-3">{titleLine2Normal}</span>
            <span
              style={{ fontFamily: "var(--font-serif-display), 'Playfair Display', Georgia, serif" }}
              className="italic font-normal text-neutral-900 drop-shadow-2xs"
            >
              {titleLine2Italic}
            </span>
          </span>
        </h1>

        {/* 3. Balanced Subtitle */}
        <p className="mt-6 sm:mt-7 text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>

        {/* 4. Center Action Row: Pill CTA Button & Social Proof */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
          {/* Pill CTA Button with white circular arrow badge */}
          <Link
            href={ctaHref}
            className="group relative inline-flex items-center gap-2.5 rounded-full bg-neutral-950 hover:bg-neutral-800 text-white pl-6 pr-2.5 py-2.5 text-sm font-medium shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <span className="font-semibold tracking-wide">{ctaText}</span>
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-neutral-950 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
              <ArrowUpRight size={15} className="stroke-[2.5]" />
            </span>
          </Link>

          {/* Social Proof: Overlapping Avatars + 5 Stars + Trusted count */}
          <div className="flex items-center gap-3">
            {/* 4 Overlapping Avatars */}
            <div className="flex -space-x-2.5 overflow-hidden">
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-tr from-amber-400 to-rose-400 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs">
                JD
              </div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs">
                SK
              </div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs">
                MR
              </div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-tr from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shadow-2xs">
                AL
              </div>
            </div>

            {/* Stars & Text */}
            <div className="flex flex-col items-start text-left">
              <div className="flex items-center gap-0.5 text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} size={13} className="fill-amber-400 stroke-none" />
                ))}
              </div>
              <span className="text-xs font-semibold text-neutral-600">
                {trustedCount}
              </span>
            </div>
          </div>
        </div>

        {/* 5. Loved by brands section divider */}
        <div className="mt-14 sm:mt-20">
          <p className="text-xs sm:text-sm font-medium text-neutral-500 tracking-wide">
            {marqueeHeading}
          </p>
        </div>
      </div>

      {/* 6. Infinite Running Logo Marquee */}
      <div className="mt-4 sm:mt-6 max-w-6xl mx-auto px-4">
        <Marquee speed={32} pauseOnHover className="py-2">
          {logos.map((logo, idx) => (
            <div
              key={idx}
              className="flex items-center grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition duration-200 cursor-pointer"
            >
              {logo.svg}
            </div>
          ))}
        </Marquee>
      </div>

      {/* 7. Hero Interactive Dashboard Preview Island with BorderBeam */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 sm:mt-14">
        <div className="relative rounded-2xl sm:rounded-3xl border border-gray-200/80 bg-white p-2 sm:p-3 shadow-xl overflow-hidden">
          {/* Border Beam Animation */}
          <BorderBeam
            size={300}
            duration={12}
            anchor={90}
            borderWidth={2}
            colorFrom="#818CF8"
            colorTo="#38BDF8"
          />

          {/* Browser header bar */}
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-2.5 mb-2 bg-gray-50/80 rounded-t-xl sm:rounded-t-2xl">
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[11px] font-mono text-gray-500 bg-white px-4 py-1 rounded-full border border-gray-200/60 shadow-2xs">
              dripx.io/sequences/high-ticket-execs
            </div>
            <div className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Proxy Active (Dhaka UTC+6)</span>
            </div>
          </div>

          {/* Dashboard Preview Image */}
          <div className="relative aspect-[16/9] w-full rounded-xl overflow-hidden bg-neutral-900">
            <Image
              src="/hero-dashboard-preview.png"
              alt="DripX Multi-Channel Sequence Engine"
              fill
              priority
              className="object-cover object-top"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Hero195;
