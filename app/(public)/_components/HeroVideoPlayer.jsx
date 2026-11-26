"use client";

import { useRef, useState } from "react";
import { Pause, Play } from "lucide-react";

export default function HeroVideoPlayer() {
  const videoRef = useRef(null);
  const [paused, setPaused] = useState(false);

  const togglePlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      el.play().catch(() => {});
      setPaused(false);
    } else {
      el.pause();
      setPaused(true);
    }
  };

  return (
    <div className="relative aspect-video w-full rounded-xl sm:rounded-2xl overflow-hidden bg-slate-950">
      <video
        ref={videoRef}
        src="/Automate-LinkedIn-compressed.webm"
        poster="/hero-dashboard-preview.png"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
        className="h-full w-full object-cover object-center"
      />

      <button
        type="button"
        onClick={togglePlay}
        aria-label={paused ? "Play demo video" : "Pause demo video"}
        className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white px-3 py-1.5 text-[11px] font-medium backdrop-blur-sm transition cursor-pointer"
      >
        {paused ? <Play size={12} /> : <Pause size={12} />}
        <span>{paused ? "Play" : "Pause"}</span>
      </button>
    </div>
  );
}
