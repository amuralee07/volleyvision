import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppPageHeader, AppEmptyState, AppPanel } from "@/components/app-ui";
import Link from "next/link";

interface ClipRow {
  id: string;
  video_id: string;
  analysis_id: string | null;
  label: string;
  start_time: number;
  end_time: number;
  storage_path: string | null;
  description: string;
  player_feedback: string;
  created_at: string;
  videos: { title: string; storage_path: string } | null;
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const labelColors: Record<string, string> = {
  spike: "bg-red-500/15 text-red-400 border-red-500/25",
  block: "bg-white/10 text-white/70 border-white/15",
  ace: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  serve: "bg-purple-500/15 text-purple-400 border-purple-500/25",
  dig: "bg-amber-500/15 text-amber-400 border-amber-500/25",
  rally: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  set: "bg-cyan-500/15 text-cyan-400 border-cyan-500/25",
  save: "bg-teal-500/15 text-teal-400 border-teal-500/25",
  kill: "bg-red-500/15 text-red-400 border-red-500/25",
  defense: "bg-white/10 text-white/70 border-white/15",
};

function getLabelColor(label: string) {
  const key = label.toLowerCase();
  for (const [k, v] of Object.entries(labelColors)) {
    if (key.includes(k)) return v;
  }
  return "bg-secondary text-secondary-foreground";
}

export default async function ClipsPage() {
  const supabase = await createClient();

  const { data: clips } = await supabase
    .from("clips")
    .select("*, videos(title, storage_path)")
    .order("start_time", { ascending: true })
    .returns<ClipRow[]>();

  // Resolve all clip URLs upfront
  const clipUrls = new Map<string, string>();
  for (const clip of clips || []) {
    if (clip.storage_path) {
      const { data } = await supabase.storage
        .from("clips")
        .createSignedUrl(clip.storage_path, 3600);
      if (data?.signedUrl) clipUrls.set(clip.id, data.signedUrl);
    }
  }

  const grouped = new Map<string, { title: string; videoPath: string; clips: ClipRow[] }>();
  for (const clip of clips || []) {
    const existing = grouped.get(clip.video_id);
    if (existing) {
      existing.clips.push(clip);
    } else {
      grouped.set(clip.video_id, {
        title: clip.videos?.title || "Untitled Video",
        videoPath: clip.videos?.storage_path || "",
        clips: [clip],
      });
    }
  }

  const totalClips = clips?.length || 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AppPageHeader
        eyebrow="Clip Extraction"
        title="Your highlight clips"
        description={
          totalClips > 0
            ? `${totalClips} clip${totalClips !== 1 ? "s" : ""} from ${grouped.size} video${grouped.size !== 1 ? "s" : ""} — auto-tagged by AI.`
            : "Upload and analyze a video — spikes, digs, sets, and aces appear here automatically."
        }
        action={
          totalClips > 0 ? (
            <Button className="rounded-full bg-white text-black hover:bg-white/90" render={<Link href="/highlights/new" />}>
              Build Highlight Reel
            </Button>
          ) : undefined
        }
      />

      {totalClips === 0 ? (
        <AppEmptyState
          icon={
            <svg className="h-8 w-8 text-emerald-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
          title="No clips yet"
          description="Upload a video and run AI analysis — key moments will automatically appear here as clips."
          action={
            <Button className="rounded-full bg-white text-black hover:bg-white/90" render={<Link href="/upload" />}>
              Upload a Video
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([videoId, group]) => (
            <AppPanel key={videoId} title={group.title} badge={`${group.clips.length} clips`}>
              <div className="mb-4">
                <Link
                  href={`/video/${videoId}`}
                  className="text-sm text-emerald-400/80 transition-colors hover:text-emerald-400"
                >
                  View full analysis →
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {group.clips.map((clip) => {
                  const clipUrl = clipUrls.get(clip.id) || "";
                  return (
                    <div key={clip.id}>
                      <Card className="overflow-hidden border-white/10 bg-white/[0.03] transition-all hover:border-white/20 hover:bg-white/[0.05]">
                        {clipUrl ? (
                          <div className="bg-black">
                            <video
                              src={clipUrl}
                              controls
                              className="w-full aspect-video"
                              preload="metadata"
                            />
                          </div>
                        ) : (
                          <Link href={`/video/${clip.video_id}`}>
                            <div className="flex aspect-video cursor-pointer items-center justify-center bg-gradient-to-br from-white/5 to-emerald-500/10">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white shadow-sm">
                                <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        )}
                        <CardContent className="p-3">
                          <div className="mb-1 flex items-center gap-2">
                            <Badge variant="outline" className={`border text-[10px] font-semibold ${getLabelColor(clip.label)}`}>
                              {clip.label}
                            </Badge>
                            <span className="font-mono text-[10px] text-white/40">
                              {formatTime(clip.start_time)}
                            </span>
                            <span className="text-[10px] text-white/30">
                              · {Math.round(clip.end_time - clip.start_time)}s
                            </span>
                          </div>
                          {clip.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{clip.description}</p>
                          )}
                          {clip.player_feedback && (
                            <p className="mt-1 line-clamp-2 text-xs italic text-emerald-400/80">{clip.player_feedback}</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </AppPanel>
          ))}
        </div>
      )}
    </div>
  );
}
