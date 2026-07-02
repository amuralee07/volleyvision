"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer, type VideoPlayerHandle } from "@/components/video-player";
import { AnalysisResults } from "@/components/analysis-results";
import { AppPanel, HudCorners } from "@/components/app-ui";
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
      <div className="mb-8 flex items-center gap-2 font-mono text-xs text-white/40">
        <Link href="/dashboard" className="transition-colors hover:text-white">Dashboard</Link>
        <span>/</span>
        <span className="truncate text-white/70">{video.title}</span>
      </div>

      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-emerald-400/80">Film Analysis</p>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{video.title}</h1>
          <p className="mt-2 font-mono text-sm text-white/40">
            UPLOADED{" "}
            {new Date(video.created_at).toLocaleDateString("en-US", {
              month: "short", day: "numeric", year: "numeric",
            }).toUpperCase()}
            {video.duration_seconds && <> · {Math.round(video.duration_seconds / 60)} MIN</>}
          </p>
        </div>
        <Badge variant="outline" className="shrink-0 rounded-full border-white/15 bg-white/5 text-white/70">
          {video.status}
        </Badge>
      </div>

      {videoUrl && (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f] shadow-[0_0_60px_rgba(16,185,129,0.06)]">
          <HudCorners />
          <div className="absolute left-4 top-4 z-10 rounded border border-white/10 bg-black/50 px-2 py-0.5 font-mono text-[10px] text-emerald-400/90 backdrop-blur-sm">
            LIVE FEED
          </div>
          {isYouTube ? (
            <iframe
              src={videoUrl}
              className="aspect-video w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            />
          ) : (
            <VideoPlayer ref={playerRef} url={videoUrl} title={video.title} />
          )}
        </div>
      )}

      {!currentAnalysis && (
        <AppPanel className="mt-8" title="AI Analysis" badge="Pending">
          <div className="py-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold">Ready to analyze</h3>
            <p className="mx-auto mt-2 mb-6 max-w-md text-sm text-white/50">
              AI will review your footage for technique, coaching feedback, and highlight moments.
            </p>
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="rounded-full bg-white px-10 text-black hover:bg-white/90"
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
        </AppPanel>
      )}

      {currentAnalysis && (
        <div className="mt-10 space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-emerald-400/80">Results</p>
              <h2 className="text-xl font-bold">Coaching Analysis</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="rounded-full border-white/20 hover:bg-white/5"
            >
              {analyzing ? "Re-analyzing..." : "Re-analyze"}
            </Button>
          </div>
          <AnalysisResults analysis={currentAnalysis} />
          <AppPanel title="Extracted Clips" badge="Auto-tagged">
            <p className="mb-4 text-sm text-white/50">
              AI-identified highlight clips from this video are ready in your library.
            </p>
            <Button render={<Link href="/clips" />} className="rounded-full bg-white text-black hover:bg-white/90">
              View All Clips
            </Button>
          </AppPanel>
        </div>
      )}
    </div>
  );
}
