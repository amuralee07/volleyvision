"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer, type VideoPlayerHandle } from "@/components/video-player";
import { AnalysisResults } from "@/components/analysis-results";
import { HighlightTimeline } from "@/components/highlight-timeline";
import { toast } from "sonner";
import type { Video, Analysis } from "@/lib/types";

interface Props {
  video: Video;
  analysis: Analysis | null;
  videoUrl: string;
}

export function VideoDetailClient({ video, analysis, videoUrl }: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(analysis);
  const playerRef = useRef<VideoPlayerHandle>(null);
  const router = useRouter();

  async function handleAnalyze() {
    setAnalyzing(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId: video.id }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.info("Analysis already exists for this video.");
        } else {
          throw new Error(data.error || "Analysis failed");
        }
      } else {
        toast.success("Analysis complete!");
        router.refresh();
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleSeek(time: number) {
    playerRef.current?.seekTo(time);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{video.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Uploaded {new Date(video.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <Badge variant={video.status === "ready" ? "default" : "secondary"}>
          {video.status}
        </Badge>
      </div>

      {/* Video Player */}
      {videoUrl && <VideoPlayer ref={playerRef} url={videoUrl} title={video.title} />}

      {/* Analyze Button */}
      {!currentAnalysis && (
        <div className="mt-6 flex justify-center">
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="px-8"
          >
            {analyzing ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Analyzing... This may take a minute
              </>
            ) : (
              "Analyze with AI"
            )}
          </Button>
        </div>
      )}

      {/* Analysis Results */}
      {currentAnalysis && (
        <div className="mt-8 space-y-6">
          <AnalysisResults analysis={currentAnalysis} />
          <HighlightTimeline
            highlights={currentAnalysis.highlights}
            videoId={video.id}
            analysisId={currentAnalysis.id}
            onSeek={handleSeek}
          />
        </div>
      )}
    </div>
  );
}
