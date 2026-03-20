"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HighlightMoment } from "@/lib/types";
import { toast } from "sonner";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface HighlightTimelineProps {
  highlights: HighlightMoment[];
  videoId: string;
  analysisId: string;
  onSeek?: (time: number) => void;
}

export function HighlightTimeline({
  highlights,
  videoId,
  analysisId,
  onSeek,
}: HighlightTimelineProps) {
  const [extracting, setExtracting] = useState<number | null>(null);

  async function handleExtractClip(highlight: HighlightMoment, index: number) {
    setExtracting(index);
    try {
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          videoId,
          analysisId,
          label: highlight.label,
          startTime: highlight.start_time,
          endTime: highlight.end_time,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to extract clip");
      }

      toast.success(`Clip "${highlight.label}" extracted successfully!`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to extract clip");
    } finally {
      setExtracting(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Key Moments</CardTitle>
      </CardHeader>
      <CardContent>
        {highlights.length === 0 ? (
          <p className="text-sm text-muted-foreground">No highlights identified.</p>
        ) : (
          <div className="space-y-4">
            {highlights.map((h, i) => (
              <div
                key={i}
                className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50"
              >
                <div className="flex flex-col items-center gap-1">
                  <button
                    className="text-xs font-mono text-primary hover:underline cursor-pointer"
                    onClick={() => onSeek?.(h.start_time)}
                  >
                    {formatTime(h.start_time)}
                  </button>
                  <span className="text-xs text-muted-foreground">to</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatTime(h.end_time)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline">{h.label}</Badge>
                  </div>
                  <p className="text-sm">{h.description}</p>
                  {h.player_feedback && (
                    <p className="mt-2 text-sm text-muted-foreground italic">
                      Coach tip: {h.player_feedback}
                    </p>
                  )}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={extracting === i}
                  onClick={() => handleExtractClip(h, i)}
                >
                  {extracting === i ? "Extracting..." : "Extract Clip"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
