"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HighlightMoment } from "@/lib/types";
import { toast } from "sonner";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const labelColors: Record<string, string> = {
  spike: "bg-red-100 text-red-700 border-red-200",
  block: "bg-blue-100 text-blue-700 border-blue-200",
  ace: "bg-emerald-100 text-emerald-700 border-emerald-200",
  serve: "bg-purple-100 text-purple-700 border-purple-200",
  dig: "bg-amber-100 text-amber-700 border-amber-200",
  rally: "bg-orange-100 text-orange-700 border-orange-200",
  set: "bg-cyan-100 text-cyan-700 border-cyan-200",
  save: "bg-teal-100 text-teal-700 border-teal-200",
};

function getLabelColor(label: string) {
  const key = label.toLowerCase();
  for (const [k, v] of Object.entries(labelColors)) {
    if (key.includes(k)) return v;
  }
  return "bg-secondary text-secondary-foreground";
}

interface HighlightTimelineProps {
  highlights: HighlightMoment[];
  videoId: string;
  analysisId: string;
  onSeek?: (time: number) => void;
}

export function HighlightTimeline({ highlights, videoId, analysisId, onSeek }: HighlightTimelineProps) {
  const [extracting, setExtracting] = useState<number | null>(null);

  async function handleExtractClip(highlight: HighlightMoment, index: number) {
    setExtracting(index);
    try {
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId, analysisId,
          label: highlight.label,
          startTime: highlight.start_time,
          endTime: highlight.end_time,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to extract clip");
      }
      toast.success(`Clip "${highlight.label}" extracted!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to extract clip");
    } finally {
      setExtracting(null);
    }
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.562.562 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
          </svg>
        </div>
        <div>
          <h3 className="text-lg font-bold">Key Moments</h3>
          <p className="text-sm text-muted-foreground">{highlights.length} highlights detected</p>
        </div>
      </div>

      {highlights.length === 0 ? (
        <p className="text-sm text-muted-foreground">No highlights identified.</p>
      ) : (
        <div className="space-y-3">
          {highlights.map((h, i) => (
            <div
              key={i}
              className="group flex items-start gap-4 rounded-xl border p-4 transition-all hover:shadow-sm hover:border-primary/20"
            >
              {/* Timestamp */}
              <button
                className="shrink-0 flex flex-col items-center rounded-lg bg-muted px-3 py-2 hover:bg-primary/10 transition-colors cursor-pointer"
                onClick={() => onSeek?.(h.start_time)}
              >
                <span className="text-xs font-bold font-mono text-primary">{formatTime(h.start_time)}</span>
                <span className="text-[10px] text-muted-foreground">to {formatTime(h.end_time)}</span>
              </button>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <Badge variant="outline" className={`border text-xs font-semibold ${getLabelColor(h.label)}`}>
                    {h.label}
                  </Badge>
                </div>
                <p className="text-sm leading-relaxed">{h.description}</p>
                {h.player_feedback && (
                  <div className="mt-2 flex items-start gap-2 rounded-lg bg-primary/5 border border-primary/10 p-2.5">
                    <svg className="h-4 w-4 text-primary shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                    <p className="text-xs text-muted-foreground">{h.player_feedback}</p>
                  </div>
                )}
              </div>

              {/* Extract button */}
              <Button
                variant="outline"
                size="sm"
                className="shrink-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                disabled={extracting === i}
                onClick={() => handleExtractClip(h, i)}
              >
                {extracting === i ? (
                  <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <>
                    <svg className="mr-1.5 h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2m0 2v2m0-2h10M7 4H3m14 0V2m0 2v2m0-2h4M5 8h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2z" />
                    </svg>
                    Extract
                  </>
                )}
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
