"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const DEMO_CLIPS = [
  {
    label: "Spike",
    duration: "10s",
    time: "2:14",
    thumb: "/demo/clips/spike.jpg",
    color: "border-red-400/30 bg-red-400/10 text-red-300",
  },
  {
    label: "Dig",
    duration: "10s",
    time: "4:05",
    thumb: "/demo/clips/dig.jpg",
    color: "border-amber-400/30 bg-amber-400/10 text-amber-300",
  },
  {
    label: "Set",
    duration: "10s",
    time: "6:32",
    thumb: "/demo/clips/set.jpg",
    color: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300",
  },
  {
    label: "Ace",
    duration: "10s",
    time: "8:18",
    thumb: "/demo/clips/ace.jpg",
    color: "border-emerald-400/30 bg-emerald-400/10 text-emerald-300",
  },
];

const STEPS = [
  "Upload match or practice film",
  "AI tags key moments automatically",
  "Clips extracted and ready to share",
  "Build highlight reels in one click",
];

export function LandingClipsFeature() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % DEMO_CLIPS.length), 2400);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
      <div>
        <p className="mb-3 font-mono text-xs uppercase tracking-[0.25em] text-emerald-400/80">Clip Extraction</p>
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Full film in. Highlight clips out.
        </h2>
        <p className="mt-4 text-white/50 leading-relaxed">
          VolleyVision automatically finds spikes, digs, sets, and aces — then cuts them into
          shareable clips. No manual scrubbing through hours of footage.
        </p>
        <ol className="mt-8 space-y-3">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-3 text-sm text-white/60">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/15 font-mono text-[10px] text-white/50">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <div className="rounded-2xl border border-white/10 bg-[#0a0a0f] p-5">
        <div className="mb-4 flex items-center justify-between">
          <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">Your Clips</span>
          <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 font-mono text-[10px] text-white/50">
            4 extracted
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {DEMO_CLIPS.map((clip, i) => (
            <div
              key={clip.label}
              className={`overflow-hidden rounded-xl border transition-all duration-500 ${
                i === active
                  ? `${clip.color} scale-[1.02] shadow-lg shadow-black/40`
                  : "border-white/10 bg-white/[0.02]"
              }`}
            >
              <div className="relative aspect-video overflow-hidden bg-black">
                <Image
                  src={clip.thumb}
                  alt={`${clip.label} clip preview`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 50vw, 240px"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/10" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-black/45 backdrop-blur-sm ring-1 ring-white/20">
                    <svg className="ml-0.5 h-4 w-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
                <span className="absolute bottom-2 right-2 rounded bg-black/60 px-1.5 py-0.5 font-mono text-[9px] text-white/70">
                  {clip.duration}
                </span>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-xs font-semibold ${i === active ? "" : "text-white/70"}`}>
                    {clip.label}
                  </span>
                  <span className="font-mono text-[10px] text-white/40">{clip.time}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3">
          <span className="text-sm text-white/60">Build highlight reel</span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/80">
            4 clips selected
          </span>
        </div>
      </div>
    </div>
  );
}
