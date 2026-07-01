import { createClient } from "@/lib/supabase/server";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  spike: "bg-red-100 text-red-700 border-red-200",
  block: "bg-blue-100 text-blue-700 border-blue-200",
  ace: "bg-emerald-100 text-emerald-700 border-emerald-200",
  serve: "bg-purple-100 text-purple-700 border-purple-200",
  dig: "bg-amber-100 text-amber-700 border-amber-200",
  rally: "bg-orange-100 text-orange-700 border-orange-200",
  set: "bg-cyan-100 text-cyan-700 border-cyan-200",
  save: "bg-teal-100 text-teal-700 border-teal-200",
  kill: "bg-red-100 text-red-700 border-red-200",
  defense: "bg-blue-100 text-blue-700 border-blue-200",
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
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clips</h1>
          <p className="mt-1 text-muted-foreground">
            {totalClips} clip{totalClips !== 1 ? "s" : ""} from {grouped.size} video{grouped.size !== 1 ? "s" : ""}
          </p>
        </div>
        {totalClips > 0 && (
          <Button render={<Link href="/highlights/new" />}>
            Build Highlight Reel
          </Button>
        )}
      </div>

      {totalClips === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-4">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold">No clips yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Upload a video and run AI analysis — key moments will automatically appear here as clips.
            </p>
            <Button className="mt-6" render={<Link href="/upload" />}>
              Upload a Video
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([videoId, group]) => (
            <div key={videoId}>
              {/* Video folder header */}
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <svg className="h-4.5 w-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <Link href={`/video/${videoId}`} className="font-semibold hover:text-primary transition-colors truncate block">
                    {group.title}
                  </Link>
                  <p className="text-xs text-muted-foreground">{group.clips.length} clip{group.clips.length !== 1 ? "s" : ""}</p>
                </div>
              </div>

              {/* Clips grid */}
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 pl-12">
                {group.clips.map((clip) => {
                  const clipUrl = clipUrls.get(clip.id) || "";
                  return (
                    <div key={clip.id}>
                      <Card className="overflow-hidden transition-all hover:shadow-md hover:border-primary/20 group">
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
                            <div className="bg-gradient-to-br from-primary/5 to-primary/10 aspect-video flex items-center justify-center cursor-pointer">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80 text-primary shadow-sm">
                                <svg className="h-5 w-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              </div>
                            </div>
                          </Link>
                        )}
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`border text-[10px] font-semibold ${getLabelColor(clip.label)}`}>
                              {clip.label}
                            </Badge>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {Math.round(clip.end_time - clip.start_time)}s
                            </span>
                          </div>
                          {clip.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{clip.description}</p>
                          )}
                          {clip.player_feedback && (
                            <p className="text-xs text-primary/70 line-clamp-2 mt-1 italic">{clip.player_feedback}</p>
                          )}
                        </CardContent>
                      </Card>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
