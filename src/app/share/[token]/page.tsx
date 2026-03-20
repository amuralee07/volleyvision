import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

  // Get player profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("user_id", reel.user_id)
    .single<Profile>();

  // Fetch clips in order
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
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Player Info Header */}
        <div className="mb-8 text-center">
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-2">
            VolleyVision Highlight Reel
          </p>
          <h1 className="text-3xl font-bold tracking-tight">{reel.title}</h1>
          {profile && (
            <div className="mt-3 flex items-center justify-center gap-3 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{profile.name}</span>
              {profile.position && <span>&middot; {profile.position}</span>}
              {profile.team_name && <span>&middot; {profile.team_name}</span>}
              {profile.graduation_year && (
                <span>&middot; Class of {profile.graduation_year}</span>
              )}
            </div>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {orderedClips.length} highlight{orderedClips.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Clips */}
        <div className="space-y-6">
          {clipsWithUrls.map(({ clip, url }, i) => (
            <Card key={clip.id}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <span className="text-muted-foreground text-sm">#{i + 1}</span>
                  <Badge variant="outline">{clip.label}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {url && (
                  <div className="overflow-hidden rounded-lg bg-black">
                    <video
                      src={url}
                      controls
                      className="w-full aspect-video"
                      preload="metadata"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Powered by{" "}
            <span className="font-semibold text-foreground">VolleyVision</span>{" "}
            &mdash; AI-Powered Volleyball Coaching
          </p>
        </div>
      </div>
    </div>
  );
}
