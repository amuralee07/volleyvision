"use client";

import { useEffect, useRef, useState } from "react";

const VIDEO_SRC = "/demo/volleyball.mp4?v=2";

const ACTIONS = [
  { action: "APPROACHING", x: 240, y: 165, vel: "2.1 m/s", metric: "0.18s", metricLabel: "Contact Timing" },
  { action: "JUMPING", x: 248, y: 158, vel: "0.4 m/s", metric: "0.82m", metricLabel: "Jump Height" },
  { action: "ARM COCKED", x: 252, y: 152, vel: "12.4 m/s", metric: "0.94", metricLabel: "Arm Speed" },
  { action: "FOLLOW THROUGH", x: 258, y: 168, vel: "1.8 m/s", metric: "Cross", metricLabel: "Shot Angle" },
];

const TRACKED_BOXES = [
  { id: 12, label: "Player #12", color: "#34d399", left: "44%", top: "32%", width: "12%", height: "48%", primary: true },
  { id: 7, label: "#7", color: "#60a5fa", left: "22%", top: "36%", width: "10%", height: "42%", primary: false },
  { id: 3, label: "#3", color: "#f97316", left: "58%", top: "30%", width: "11%", height: "45%", primary: false },
];

export function LandingHeroHud() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [frame, setFrame] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % ACTIONS.length), 2800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const play = () => {
      video.play().catch(() => {});
    };

    play();
    video.addEventListener("loadeddata", play);
    return () => video.removeEventListener("loadeddata", play);
  }, []);

  const current = ACTIONS[frame];
  const prev = ACTIONS[(frame - 1 + ACTIONS.length) % ACTIONS.length];
  const next = ACTIONS[(frame + 1) % ACTIONS.length];
  const boxOffset = frame * 0.4;

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
          onLoadedData={() => setVideoReady(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
            videoReady ? "opacity-100" : "opacity-0"
          }`}
          style={{ filter: "saturate(0.65) contrast(1.1) brightness(0.9)" }}
        >
          <source src={VIDEO_SRC} type="video/mp4" />
        </video>

        {/* Analysis tint — lighter so footage stays visible */}
        <div className="absolute inset-0 bg-emerald-950/15 mix-blend-overlay pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#050508]/70 via-transparent to-[#050508]/30 pointer-events-none" />

        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.1] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(rgba(52,211,153,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.2) 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />

        <p className="absolute left-6 top-5 z-20 font-mono text-[10px] tracking-[0.35em] text-white/30">
          &quot;AI COACHING&quot;
        </p>

        {TRACKED_BOXES.map((box) => (
          <div
            key={box.id}
            className="absolute z-10 transition-all duration-700 ease-in-out"
            style={{
              left: box.primary ? `calc(${box.left} + ${boxOffset}px)` : box.left,
              top: box.primary ? `calc(${box.top} - ${boxOffset * 0.5}px)` : box.top,
              width: box.width,
              height: box.height,
            }}
          >
            <TrackingBox color={box.color} label={box.label} active={box.primary} />
          </div>
        ))}

        <div className="absolute inset-x-0 top-0 z-10 h-px animate-[scan_3.5s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-emerald-400/70 to-transparent pointer-events-none" />

        <div className="absolute right-4 top-4 z-30 w-52 space-y-2 sm:right-6 sm:top-6 sm:w-56">
          <HudPanel label="Player No. 12" />
          <HudPanel label="Current Action">
            <p className="font-mono text-sm font-bold tracking-wide text-emerald-400 transition-all duration-500">
              {current.action}
            </p>
          </HudPanel>
          <div className="grid grid-cols-2 gap-2">
            <HudPanel label="Position">
              <p className="font-mono text-xs text-white/90">X: {current.x} Y: {current.y}</p>
            </HudPanel>
            <HudPanel label="Velocity">
              <p className="font-mono text-xs text-white/90">{current.vel}</p>
            </HudPanel>
          </div>
          <HudPanel label={current.metricLabel}>
            <p className="font-mono text-xs text-white/90">{current.metric}</p>
          </HudPanel>
        </div>

        <div className="absolute bottom-4 left-4 z-30 w-48 space-y-1.5 sm:bottom-6 sm:left-6 sm:w-52">
          <HudRow label="Previous" value={`${prev.x}, ${prev.y}`} dim />
          <HudRow label="Current" value={`${current.x}, ${current.y}`} highlight />
          <HudRow label="Next" value={`${next.x}, ${next.y}`} dim />
        </div>

        <div className="absolute bottom-4 left-1/2 z-30 hidden -translate-x-1/2 items-center gap-4 sm:flex">
          <LegendDot color="#34d399" label="Tracked" />
          <LegendDot color="#60a5fa" label="Teammate" />
          <LegendDot color="#f97316" label="Opponent" />
        </div>

        <div className="absolute bottom-4 right-4 z-30 flex items-center gap-2 sm:bottom-6 sm:right-6">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-wider text-white/50">Analyzing</span>
        </div>
      </div>
    </div>
  );
}

function TrackingBox({ color, label, active }: { color: string; label: string; active?: boolean }) {
  return (
    <div className="relative h-full w-full">
      <div className="absolute inset-0 border" style={{ borderColor: `${color}${active ? "99" : "55"}` }}>
        <div className="absolute -left-px -top-px h-3 w-3 border-l-2 border-t-2" style={{ borderColor: color }} />
        <div className="absolute -right-px -top-px h-3 w-3 border-r-2 border-t-2" style={{ borderColor: color }} />
        <div className="absolute -bottom-px -left-px h-3 w-3 border-b-2 border-l-2" style={{ borderColor: color }} />
        <div className="absolute -bottom-px -right-px h-3 w-3 border-b-2 border-r-2" style={{ borderColor: color }} />
      </div>
      {active && (
        <div className="absolute inset-0 opacity-10" style={{ backgroundColor: color }} />
      )}
      <span className="absolute -top-5 left-0 font-mono text-[10px] font-bold whitespace-nowrap" style={{ color }}>
        {label}
      </span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: color }} />
      <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">{label}</span>
    </div>
  );
}

function HudPanel({ label, children }: { label: string; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/70 px-3 py-2 backdrop-blur-md">
      <p className="mb-0.5 font-mono text-[9px] uppercase tracking-wider text-white/40">{label}</p>
      {children ?? <p className="font-mono text-xs text-white/80">{label}</p>}
    </div>
  );
}

function HudRow({ label, value, highlight, dim }: { label: string; value: string; highlight?: boolean; dim?: boolean }) {
  return (
    <div
      className={`flex items-center justify-between rounded-md border px-3 py-1.5 backdrop-blur-md ${
        highlight ? "border-emerald-400/30 bg-emerald-400/10" : "border-white/10 bg-black/60"
      }`}
    >
      <span className="font-mono text-[9px] uppercase tracking-wider text-white/40">{label}</span>
      <span className={`font-mono text-[11px] ${highlight ? "text-emerald-400" : dim ? "text-white/40" : "text-white/70"}`}>
        {value}
      </span>
    </div>
  );
}
