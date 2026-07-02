"use client";

import { Card, CardContent } from "@/components/ui/card";
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
    <Card
      className={`overflow-hidden border-white/10 bg-white/[0.03] transition-all ${
        selectable ? "cursor-pointer" : ""
      } ${selected ? "ring-2 ring-emerald-400" : ""}`}
      onClick={() => selectable && onToggle?.(clip.id)}
    >
      {videoUrl && (
        <div className="bg-black">
          <video
            src={videoUrl}
            controls
            className="w-full aspect-video"
            preload="metadata"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{clip.label}</Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {formatTime(clip.start_time)} - {formatTime(clip.end_time)}
            </span>
          </div>
          {selectable && (
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                selected
                  ? "border-white bg-white text-black"
                  : "border-white/30"
              }`}
            >
              {selected && (
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-foreground">
          Duration: {Math.round(clip.end_time - clip.start_time)}s
        </p>
      </CardContent>
    </Card>
  );
}
