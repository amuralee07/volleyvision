import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui/badge";
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
    <div className="min-h-screen bg-gradient-to-b from-muted/50 to-background">
      {/* Top bar */}
      <header className="border-b bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-center px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-xs">VV</div>
            <span className="font-bold text-sm">VolleyVision</span>
            <span className="text-xs text-muted-foreground">&middot; Highlight Reel</span>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {/* Player card */}
        <div className="mb-10 text-center">
          {profile && (
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-primary">
              <span className="text-2xl font-bold">
                {profile.name?.split(" ").map(n => n[0]).join("").toUpperCase() || "?"}
              </span>
            </div>
          )}
          <h1 className="text-3xl font-bold tracking-tight">{reel.title}</h1>
          {profile && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">{profile.name}</span>
              {profile.position && (
                <Badge variant="secondary" className="rounded-full text-xs">{profile.position}</Badge>
              )}
              {profile.team_name && <span>{profile.team_name}</span>}
              {profile.graduation_year && (
                <span>Class of {profile.graduation_year}</span>
              )}
            </div>
          )}
          <p className="mt-3 text-sm text-muted-foreground">
            {orderedClips.length} highlight{orderedClips.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Clips */}
        <div className="space-y-6">
          {clipsWithUrls.map(({ clip, url }, i) => (
            <div key={clip.id} className="rounded-2xl border bg-card overflow-hidden shadow-sm">
              <div className="flex items-center gap-3 px-5 py-3 border-b bg-muted/30">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary text-xs font-bold">
                  {i + 1}
                </span>
                <Badge variant="outline" className="rounded-full">{clip.label}</Badge>
                <span className="text-xs text-muted-foreground ml-auto">
                  {Math.round(clip.end_time - clip.start_time)}s
                </span>
              </div>
              {url && (
                <video src={url} controls className="w-full aspect-video bg-black" preload="metadata" />
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2.5 shadow-sm">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-[10px]">VV</div>
            <span className="text-sm">
              Powered by <span className="font-semibold">VolleyVision</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
