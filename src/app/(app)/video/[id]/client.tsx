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
    <div className="mx-auto max-w-6xl px-6 py-10 sm:py-12">
      <div className="mb-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-white/35">
        <Link href="/dashboard" className="transition-colors hover:text-emerald-300">
          Film
        </Link>
        <span className="text-white/15">/</span>
        <span className="truncate text-white/60">{video.title}</span>
      </div>

      <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="mb-3 flex items-center gap-3">
            <span className="h-px w-6 bg-emerald-400/60" />
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-emerald-400/80">
              Tape
            </p>
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{video.title}</h1>
          <p className="mt-2 font-mono text-xs text-white/40">
            Uploaded{" "}
            {new Date(video.created_at).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
            {video.duration_seconds && <> · {Math.round(video.duration_seconds / 60)} min</>}
          </p>
        </div>
        <Badge
          variant="outline"
          className="w-fit shrink-0 rounded-full border-emerald-500/25 bg-emerald-500/10 font-mono text-[10px] uppercase tracking-wider text-emerald-300"
        >
          {video.status}
        </Badge>
      </div>

      {videoUrl && (
        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f] shadow-[0_0_60px_rgba(16,185,129,0.08)]">
          <HudCorners />
          <div className="absolute left-4 top-4 z-10 rounded border border-emerald-500/20 bg-black/50 px-2 py-0.5 font-mono text-[10px] text-emerald-400/90 backdrop-blur-sm">
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
        <AppPanel className="mt-8" title="Analysis" badge="Pending">
          <div className="py-8 text-center">
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_40px_rgba(16,185,129,0.12)]">
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-bold tracking-tight">Ready to break down this tape</h3>
            <p className="mx-auto mt-2 mb-7 max-w-md text-sm leading-relaxed text-white/50">
              Get technique notes, drills, and tagged highlight moments from this film.
            </p>
            <Button
              size="lg"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="btn-emerald px-10"
            >
              {analyzing ? (
                <>
                  <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Analyzing… this may take a minute
                </>
              ) : (
                "Analyze this film"
              )}
            </Button>
          </div>
        </AppPanel>
      )}

      {currentAnalysis && (
        <div className="mt-10 space-y-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex items-center gap-3">
                <span className="h-px w-5 bg-emerald-400/60" />
                <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/80">
                  Results
                </p>
              </div>
              <h2 className="text-2xl font-bold tracking-tight">Coaching notes</h2>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAnalyze}
              disabled={analyzing}
              className="rounded-full border-white/15 hover:bg-white/5"
            >
              {analyzing ? "Re-analyzing…" : "Re-analyze"}
            </Button>
          </div>
          <AnalysisResults analysis={currentAnalysis} />
          <AppPanel title="Extracted clips" badge="Tagged">
            <p className="mb-5 text-sm leading-relaxed text-white/50">
              Key moments from this tape are cut and waiting in your clip library.
            </p>
            <Button render={<Link href="/clips" />} className="btn-emerald px-6">
              View all clips
            </Button>
          </AppPanel>
        </div>
      )}
    </div>
  );
}
