import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HighlightReel, Clip, Profile } from "@/lib/types";

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function SharedReelPage({ params }: PageProps) {
  const { token } = await params;
  const supabase = await createClient();

  const { data: reel } = await supabase
    .from("highlight_reels")
    .select("*")
    .eq("share_token", token)
    .single<HighlightReel>();

  if (!reel) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", reel.user_id)
    .single<Profile>();

  const { data: allClips } = await supabase
    .from("clips")
    .select("*")
    .in("id", reel.clip_ids)
    .returns<Clip[]>();

  const orderedClips = reel.clip_ids
    .map((cid: string) => allClips?.find((c) => c.id === cid))
    .filter(Boolean) as Clip[];

  const clipsWithUrls = await Promise.all(
    orderedClips.map(async (clip) => {
      const { data } = await supabase.storage
        .from("clips")
        .createSignedUrl(clip.storage_path, 3600);
      return { clip, url: data?.signedUrl || "" };
    })
  );

  return (
    <div className="min-h-screen bg-[#050508] text-white">
      <header className="border-b border-white/5 bg-[#050508]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-[10px] font-bold text-black">
              VV
            </div>
            <span className="text-sm font-bold tracking-[0.15em] uppercase">VolleyVision</span>
            <span className="text-xs text-white/40">&middot; Highlight Reel</span>
          </div>
          <Button variant="ghost" size="sm" className="text-white/50 hover:text-white" render={<Link href="/" />}>
            Learn more
          </Button>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="mb-10 text-center">
          {profile && (
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-white/10 bg-white/5 text-2xl font-bold text-white/80">
              {profile.name?.split(" ").map((n) => n[0]).join("").toUpperCase() || "?"}
            </div>
          )}
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-emerald-400/80">Scout Tape</p>
          <h1 className="text-3xl font-bold tracking-tight">{reel.title}</h1>
          {profile && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-white/50">
              <span className="font-semibold text-white">{profile.name}</span>
              {profile.position && (
                <Badge variant="outline" className="rounded-full border-white/15 text-xs">
                  {profile.position}
                </Badge>
              )}
              {profile.team_name && <span>{profile.team_name}</span>}
              {profile.graduation_year && <span>Class of {profile.graduation_year}</span>}
            </div>
          )}
          <p className="mt-3 font-mono text-sm text-white/40">
            {orderedClips.length} HIGHLIGHT{orderedClips.length !== 1 ? "S" : ""}
          </p>
        </div>

        <div className="space-y-6">
          {clipsWithUrls.map(({ clip, url }, i) => (
            <div key={clip.id} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
              <div className="flex items-center gap-3 border-b border-white/5 px-5 py-3">
                <span className="flex h-7 w-7 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10 font-mono text-xs font-bold text-emerald-400">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <Badge variant="outline" className="rounded-full border-white/15">
                  {clip.label}
                </Badge>
                <span className="ml-auto font-mono text-xs text-white/40">
                  {Math.round(clip.end_time - clip.start_time)}s
                </span>
              </div>
              {url && (
                <video src={url} controls className="aspect-video w-full bg-black" preload="metadata" />
              )}
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white text-[10px] font-bold text-black">
              VV
            </div>
            <span className="text-sm text-white/60">
              Powered by <span className="font-semibold text-white">VolleyVision</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
