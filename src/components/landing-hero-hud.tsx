"use client";

import { useEffect, useRef, useState } from "react";
import { DEMO_PLAYBACK_RATE, PLAYER_META, getAnalysisAtTime } from "@/components/landing-keyframes";

const VIDEO_SRC = "/demo/volleyball.mp4?v=5";
/** Crop pillar on left + slight right trim (percent of source frame). */
const CROP_LEFT = 17;
const CROP_RIGHT = 2;
const CROP_VISIBLE = 100 - CROP_LEFT - CROP_RIGHT;

export function LandingHeroHud() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoReady, setVideoReady] = useState(false);
  const [analysis, setAnalysis] = useState(() => getAnalysisAtTime(0));

  const activeMeta = PLAYER_META[analysis.playerId];

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.playbackRate = DEMO_PLAYBACK_RATE;

    const play = () => {
      video.playbackRate = DEMO_PLAYBACK_RATE;
      video.play().catch(() => {});
    };

    const sync = () => setAnalysis(getAnalysisAtTime(video.currentTime));

    play();
    video.addEventListener("loadeddata", play);
    video.addEventListener("timeupdate", sync);

    let raf = 0;
    const tick = () => {
      sync();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      video.removeEventListener("loadeddata", play);
      video.removeEventListener("timeupdate", sync);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl border border-white/10 shadow-2xl shadow-black/50">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-black">
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onLoadedData={() => {
            if (videoRef.current) videoRef.current.playbackRate = DEMO_PLAYBACK_RATE;
            setVideoReady(true);
          }}
          className={`absolute top-0 h-full max-w-none object-cover transition-opacity duration-500 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          style={{
            width: `${(10000 / CROP_VISIBLE).toFixed(2)}%`,
            left: `${((-CROP_LEFT / CROP_VISIBLE) * 100).toFixed(2)}%`,
          }}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>

        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />

        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <p className="absolute left-6 top-5 z-20 font-mono text-[10px] tracking-[0.35em] text-white/25">
          &quot;AI COACHING&quot;
        </p>

        <div className="absolute inset-x-0 top-0 z-10 h-px animate-[scan_3.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="absolute right-4 top-4 z-30 w-52 space-y-2 sm:right-6 sm:top-6 sm:w-56">
          <HudPanel label="Role">
            <p className="font-mono text-sm font-bold tracking-wide text-white">{activeMeta.role}</p>
          </HudPanel>
          <HudPanel label="Current Action">
            <p className="font-mono text-sm font-bold tracking-wide text-white">{analysis.action}</p>
          </HudPanel>
          <div className="grid grid-cols-2 gap-2">
            <HudPanel label="Position">
              <p className="font-mono text-xs text-white/90">
                X: {analysis.x} Y: {analysis.y}
              </p>
            </HudPanel>
            <HudPanel label="Velocity">
              <p className="font-mono text-xs text-white/90">{analysis.vel}</p>
            </HudPanel>
          </div>
          <HudPanel label={analysis.metricLabel}>
            <p className="font-mono text-xs text-white/90">{analysis.metric}</p>
          </HudPanel>
        </div>

        <div className="absolute bottom-4 left-4 z-30 w-48 space-y-1.5 sm:bottom-6 sm:left-6 sm:w-52">
          <HudRow label="Previous" value={`${analysis.prev.x}, ${analysis.prev.y}`} dim />
          <HudRow label="Current" value={`${analysis.x}, ${analysis.y}`} highlight />
          <HudRow label="Next" value={`${analysis.next.x}, ${analysis.next.y}`} dim />
        </div>

        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2 sm:bottom-6 sm:right-6">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
            Analyzing · 2×
          </span>
        </div>
      </div>
    </div>
  );
}

function HudPanel({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/75 px-3 py-2 backdrop-blur-md">
      <p className="mb-0.5 font-mono text-[9px] uppercase tracking-wider text-white/40">{label}</p>
      {children ?? <p className="font-mono text-xs text-white/80">{label}</p>}
    </div>
  );
}

function HudRow({ label, value, highlight, dim }: { label: string; value: string; highlight?: boolean; dim?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-md border px-3 py-1.5 backdrop-blur-md ${
        highlight ? "border-white/25 bg-white/5" : "border-white/10 bg-black/60"
      }`}
    >
      <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">{label}</span>
      <span className={`font-mono text-[11px] ${highlight ? "text-white" : dim ? "text-white/40" : "text-white/70"}`}>
        {value}
      </span>
    </div>
  );
}
