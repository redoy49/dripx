import Link from "next/link";
import { ArrowRight } from "lucide-react";
import PublicHeroBanner from "@/app/components/public/PublicHeroBanner";
import FeaturesInteractive from "./FeaturesInteractive";

export const metadata = {
  title: "Features & Architecture | DripX Cloud Outbound",
  description:
    "Explore DripX's multi-channel sequence engine, Spintax randomization, dedicated residential IP proxies, unified inbox, and BYOK AI Agent.",
};

export default function FeaturesPage() {
  return (
    <div className="bg-white text-slate-900 overflow-x-clip">
      <PublicHeroBanner
        variant="features"
        title="Multi-channel outreach architecture without extension risk"
        description="DripX unifies 24/7 cloud sequence execution, automatic Spintax rotation, RFC 2822 email threading, collision-locked inboxes, and a multi-model AI Agent."
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
            href="/pricing"
            className="w-full sm:w-auto inline-flex items-center justify-center rounded-full bg-white hover:bg-slate-50 text-slate-800 font-semibold px-6 py-3 text-sm shadow-ring-card active:scale-95 transition"
          >
            View pricing plans
          </Link>
        </div>
      </PublicHeroBanner>

      <FeaturesInteractive />
    </div>
  );
}
