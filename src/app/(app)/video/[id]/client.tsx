"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer, type VideoPlayerHandle } from "@/components/video-player";
import { AnalysisResults } from "@/components/analysis-results";
import { toast } from "sonner";
import type { Video, Analysis } from "@/lib/types";

interface Props {
  video: Video;
  analysis: Analysis | null;
  videoUrl: string;
  isYouTube?: boolean;
}

export function VideoDetailClient({ video, analysis, videoUrl, isYouTube }: Props) {
  const [analyzing, setAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<Analysis | null>(analysis);
  const playerRef = useRef<VideoPlayerHandle>(null);
  const router = useRouter();

  useEffect(() => {
    setCurrentAnalysis(analysis);
  }, [analysis]);

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
        if (res.status === 409) toast.info("Analysis already exists for this video.");
        else throw new Error(data.error || "Analysis failed");
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

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Breadcrumb */}
      <div className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/dashboard" className="hover:text-foreground transition-colors">Dashboard</Link>
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-foreground font-medium truncate">{video.title}</span>
      </div>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{video.title}</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Uploaded {new Date(video.created_at).toLocaleDateString("en-US", {
              month: "long", day: "numeric", year: "numeric",
            })}
          </p>
        </div>
        <Badge variant={video.status === "ready" ? "default" : "secondary"} className="rounded-full">
          {video.status}
        </Badge>
      </div>

      {/* Video Player */}
      {videoUrl && isYouTube ? (
        <div className="rounded-2xl overflow-hidden border shadow-sm">
          <iframe
            src={videoUrl}
            className="w-full aspect-video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title={video.title}
          />
        </div>
      ) : videoUrl ? (
        <div className="rounded-2xl overflow-hidden border shadow-sm">
          <VideoPlayer ref={playerRef} url={videoUrl} title={video.title} />
        </div>
      ) : null}

      {/* Analyze Button */}
      {!currentAnalysis && (
        <div className="mt-8 rounded-2xl border-2 border-dashed border-primary/30 bg-primary/5 p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-1">Ready to analyze</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Let AI review your footage and provide coaching feedback, technique analysis, and highlight key moments.
          </p>
          <Button
            size="lg"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="rounded-full px-10 shadow-lg shadow-primary/20"
          >
            {analyzing ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Analyzing... This may take a minute
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                Analyze with AI
              </>
            )}
          </Button>
        </div>
      )}

      {/* Analysis Results */}
      {currentAnalysis && (
        <div className="mt-10 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">Analysis Results</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="rounded-full"
            >
              {analyzing ? (
                <>
                  <span className="mr-2 inline-block h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Re-analyzing...
                </>
              ) : (
                "Re-analyze"
              )}
            </Button>
          </div>
          <AnalysisResults analysis={currentAnalysis} />
          <div className="rounded-2xl border bg-card p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold">Extracted Clips</h3>
                <p className="text-sm text-muted-foreground">AI-identified highlight clips from this video</p>
              </div>
            </div>
            <Button render={<Link href="/clips" />} className="rounded-full">
              View All Clips
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
