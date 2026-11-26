import Link from "next/link";
import { ArrowRight, Star } from "lucide-react";
import PublicHeroBanner from "@/app/components/public/PublicHeroBanner";
import { BorderBeam } from "@/components/ui/border-beam";
import { AvatarStack } from "@/components/ui/avatar-08";
import HeroVideoPlayer from "./HeroVideoPlayer";

const HERO_AVATARS = [
  {
    name: "Olivia Sparks",
    src: "https://cdn.21st.dev/assets/localized/b539abc60701ab9cbcd73f9241d13a14a09582a4fd06c65784cb5567d77a2e0e.webp",
    fallback: "OS",
  },
  {
    name: "Hallie Richards",
    src: "https://cdn.21st.dev/assets/localized/61fda783ca2662349458bad61a434038016f05d6a14bd7c5a314f48c8ee8be03.webp",
    fallback: "HR",
  },
  {
    name: "Howard Lloyd",
    src: "https://cdn.21st.dev/assets/localized/2bc5f22fa3400c61a2161d14e3dce5a0804badebfc1b3d9cbe844feaa3b72180.webp",
    fallback: "HL",
  },
  {
    name: "Jenny Wilson",
    src: "https://cdn.21st.dev/assets/localized/c5ee2e124ea7334450d30a46607f793534f567e97d4b708cda110a06aeed4953.webp",
    fallback: "JW",
  },
  {
    name: "Daniel Park",
    src: "https://cdn.21st.dev/assets/localized/3ac4ad42a8a76abc8f29025d958460be1771e6e4d12a771e2bef33b21b0a30d6.jpg",
    fallback: "DP",
  },
  {
    name: "Alice Morgan",
    src: "https://cdn.21st.dev/assets/localized/c70d48e47d3a2d79ad07d16bff3aa3cff686580be031b6102cad73a15b47d8fd.jpg",
    fallback: "AM",
  },
];

export default function HomeHero() {
  return (
    <PublicHeroBanner
      variant="home"
      bottomSpacing="pb-14"
      title="Scale outbound across Email and LinkedIn"
      description="24/7 cloud sequences, automatic Spintax rotation, and a built-in AI Agent."
    >
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5">
        <Link
          href="/register"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full bg-indigo-400 hover:bg-indigo-500 text-white font-semibold px-7 py-3 text-sm shadow-ring-elevated active:scale-95 transition"
        >
          <span>Start 14-day free trial</span>
          <ArrowRight size={15} />
        </Link>

        <Link
          href="#interactive-product"
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold px-7 py-3 text-sm shadow-ring-card active:scale-95 transition"
        >
          Explore interactive demo
        </Link>
      </div>

      {/* Compact Verified Trust Strip */}
      <div className="mt-6 flex justify-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-2.5 rounded-full bg-white/95 p-1.5 pr-4 shadow-ring-card">
          <AvatarStack avatars={HERO_AVATARS} max={3} />
          <div className="flex items-center gap-1.5 text-xs text-slate-600">
            <span className="flex items-center text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={12} className="fill-amber-400 stroke-none" />
              ))}
            </span>
            <span className="tabular-nums">
              Trusted by <strong className="font-semibold text-slate-900">1,200+</strong> B2B revenue teams
            </span>
          </div>
        </div>
      </div>

      {/* Framed Product Video with Scroll Depth & BorderBeam */}
      <div className="scroll-depth-card relative w-full mx-auto mt-9">
        <div className="relative rounded-2xl sm:rounded-3xl bg-white p-2 shadow-ring-elevated overflow-hidden">
          <BorderBeam size={280} duration={12} anchor={90} borderWidth={1.25} colorFrom="#6366f1" colorTo="#38bdf8" />
          <HeroVideoPlayer />
        </div>
      </div>
    </PublicHeroBanner>
  );
}
