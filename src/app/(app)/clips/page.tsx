import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  AppShell,
  AppPageHeader,
  AppEmptyState,
  AppPanel,
  AppMetaChip,
} from "@/components/app-ui";
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
  spike: "border-red-500/30 bg-red-500/15 text-red-300",
  block: "border-white/20 bg-white/10 text-white/70",
  ace: "border-emerald-500/30 bg-emerald-500/15 text-emerald-300",
  serve: "border-violet-500/30 bg-violet-500/15 text-violet-300",
  dig: "border-amber-500/30 bg-amber-500/15 text-amber-300",
  rally: "border-orange-500/30 bg-orange-500/15 text-orange-300",
  set: "border-cyan-500/30 bg-cyan-500/15 text-cyan-300",
  save: "border-teal-500/30 bg-teal-500/15 text-teal-300",
  kill: "border-red-500/30 bg-red-500/15 text-red-300",
  defense: "border-white/20 bg-white/10 text-white/70",
};

function getLabelColor(label: string) {
  const key = label.toLowerCase();
  for (const [k, v] of Object.entries(labelColors)) {
    if (key.includes(k)) return v;
  }
  return "border-white/15 bg-white/5 text-white/60";
}

export default async function ClipsPage() {
  const supabase = await createClient();

  const { data: clips } = await supabase
    .from("clips")
    .select("*, videos(title, storage_path)")
    .order("start_time", { ascending: true })
    .returns<ClipRow[]>();

  const clipUrls = new Map<string, string>();
  for (const clip of clips || []) {
    if (clip.storage_path) {
      const { data } = await supabase.storage
        .from("clips")
        .createSignedUrl(clip.storage_path, 3600);
      if (data?.signedUrl) clipUrls.set(clip.id, data.signedUrl);
    }
  }

  const grouped = new Map<
    string,
    { title: string; videoPath: string; clips: ClipRow[] }
  >();
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
    <AppShell wide>
      <AppPageHeader
        eyebrow="Clips"
        title="Your highlight clips"
        description={
          totalClips > 0
            ? "Tagged moments from your film — ready to review, download, or stitch into a reel."
            : "After you analyze a tape, spikes, digs, sets, and aces show up here as cut clips."
        }
        meta={
          totalClips > 0 ? (
            <>
              <AppMetaChip tone="emerald">{totalClips} clips</AppMetaChip>
              <AppMetaChip>
                {grouped.size} tape{grouped.size !== 1 ? "s" : ""}
              </AppMetaChip>
            </>
          ) : undefined
        }
        action={
          totalClips > 0 ? (
            <Button className="btn-emerald px-6" render={<Link href="/highlights/new" />}>
              Build reel
            </Button>
          ) : undefined
        }
      />

      {totalClips === 0 ? (
        <AppEmptyState
          icon={
            <svg
              className="h-9 w-9 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
              />
            </svg>
          }
          title="No clips yet"
          description="Upload a video and run analysis — key moments cut into clips you can share."
          action={
            <Button className="btn-emerald px-8" render={<Link href="/upload" />}>
              Upload film
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {Array.from(grouped.entries()).map(([videoId, group]) => (
            <AppPanel
              key={videoId}
              title={group.title}
              badge={`${group.clips.length} clips`}
              action={
                <Link
                  href={`/video/${videoId}`}
                  className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/70 transition-colors hover:text-emerald-300"
                >
                  Open tape →
                </Link>
              }
            >
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.clips.map((clip) => {
                  const clipUrl = clipUrls.get(clip.id) || "";
                  const duration = Math.round(clip.end_time - clip.start_time);
                  return (
                    <div
                      key={clip.id}
                      className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.02] transition-all hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/[0.04]"
                    >
                      {clipUrl ? (
                        <div className="relative bg-black">
                          <video
                            src={clipUrl}
                            controls
                            className="aspect-video w-full"
                            preload="metadata"
                          />
                        </div>
                      ) : (
                        <Link href={`/video/${clip.video_id}`}>
                          <div className="relative flex aspect-video cursor-pointer items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-500/10 via-white/[0.04] to-transparent">
                            <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white shadow-sm backdrop-blur-sm transition-transform group-hover:scale-105">
                              <svg
                                className="ml-0.5 h-5 w-5"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M8 5v14l11-7z" />
                              </svg>
                            </div>
                          </div>
                        </Link>
                      )}
                      <div className="p-3.5">
                        <div className="mb-2 flex items-center gap-2">
                          <span
                            className={`rounded-full border px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider ${getLabelColor(clip.label)}`}
                          >
                            {clip.label}
                          </span>
                          <span className="font-mono text-[10px] text-white/35">
                            {formatTime(clip.start_time)}
                          </span>
                          <span className="font-mono text-[10px] text-white/25">
                            · {duration}s
                          </span>
                        </div>
                        {clip.description && (
                          <p className="line-clamp-2 text-xs leading-relaxed text-white/45">
                            {clip.description}
                          </p>
                        )}
                        {clip.player_feedback && (
                          <p className="mt-1.5 line-clamp-2 text-xs italic text-emerald-400/75">
                            {clip.player_feedback}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </AppPanel>
          ))}
        </div>
      )}
    </AppShell>
  );
}
