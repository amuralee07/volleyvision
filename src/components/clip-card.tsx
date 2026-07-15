"use client";

import { Badge } from "@/components/ui/badge";
import type { Clip } from "@/lib/types";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface ClipCardProps {
  clip: Clip;
  videoUrl?: string;
  selectable?: boolean;
  selected?: boolean;
  onToggle?: (clipId: string) => void;
}

export function ClipCard({ clip, videoUrl, selectable, selected, onToggle }: ClipCardProps) {
  return (
    <div
      className={`overflow-hidden rounded-xl border bg-white/[0.02] transition-all ${
        selectable ? "cursor-pointer hover:-translate-y-0.5" : ""
      } ${
        selected
          ? "border-emerald-400/50 bg-emerald-500/[0.06] shadow-[0_0_24px_rgba(52,211,153,0.12)]"
          : "border-white/10 hover:border-white/20 hover:bg-white/[0.04]"
      }`}
      onClick={() => selectable && onToggle?.(clip.id)}
    >
      {videoUrl && (
        <div className="bg-black">
          <video
            src={videoUrl}
            controls
            className="aspect-video w-full"
            preload="metadata"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Badge
              variant="outline"
              className="rounded-full border-white/15 bg-white/5 font-mono text-[10px] uppercase tracking-wider text-white/70"
            >
              {clip.label}
            </Badge>
            <span className="font-mono text-[10px] text-white/35">
              {formatTime(clip.start_time)} – {formatTime(clip.end_time)}
            </span>
          </div>
          {selectable && (
            <div
              className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                selected
                  ? "border-emerald-400 bg-emerald-400 text-black"
                  : "border-white/25"
              }`}
            >
              {selected && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path
                    d="M2 6L5 9L10 3"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          )}
        </div>
        <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-white/30">
          {Math.round(clip.end_time - clip.start_time)}s clip
        </p>
      </div>
    </div>
  );
}
