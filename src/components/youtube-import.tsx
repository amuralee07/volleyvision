"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export function YouTubeImport() {
  const [url, setUrl] = useState("");
  const [analyzeAfter, setAnalyzeAfter] = useState(true);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");
  const router = useRouter();

  const isValidUrl = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]+/.test(url);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValidUrl) return;

    setLoading(true);
    setStatus(analyzeAfter ? "Downloading and analyzing video..." : "Downloading video from YouTube...");

    try {
      const res = await fetch("/api/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, analyzeAfter }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Import failed");

      setStatus("");
      toast.success(`"${data.title}" imported successfully!`);

      setTimeout(() => {
        router.push(`/video/${data.videoId}`);
        router.refresh();
      }, 500);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Import failed");
      setStatus("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="rounded-2xl border bg-card p-8 space-y-6">
        <div className="text-center mb-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-100 text-red-600 mb-4">
            <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor">
              <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
          </div>
          <p className="text-lg font-semibold">Import from YouTube</p>
          <p className="text-sm text-muted-foreground mt-1">
            Paste a YouTube link and we&apos;ll download and analyze it
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="youtube-url" className="text-sm font-semibold">YouTube URL</Label>
          <Input
            id="youtube-url"
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            required
            disabled={loading}
            className="h-12 text-base"
          />
          {url && !isValidUrl && (
            <p className="text-xs text-destructive">Please enter a valid YouTube URL</p>
          )}
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={analyzeAfter}
            onChange={(e) => setAnalyzeAfter(e.target.checked)}
            disabled={loading}
            className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm">Automatically analyze after import</span>
        </label>

        {loading && status && (
          <div className="flex items-center gap-3 rounded-xl bg-primary/5 border border-primary/10 p-4">
            <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent shrink-0" />
            <div>
              <p className="text-sm font-medium">{status}</p>
              <p className="text-xs text-muted-foreground mt-0.5">This may take a couple minutes for longer videos</p>
            </div>
          </div>
        )}

        <Button
          type="submit"
          className="w-full h-11 rounded-lg font-semibold"
          disabled={loading || !isValidUrl}
        >
          {loading ? (
            <>
              <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Importing...
            </>
          ) : (
            <>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
              Import & Analyze
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
