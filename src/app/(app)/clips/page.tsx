import { createClient } from "@/lib/supabase/server";
import { ClipCard } from "@/components/clip-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import type { Clip } from "@/lib/types";

export default async function ClipsPage() {
  const supabase = await createClient();

  const { data: clips } = await supabase
    .from("clips")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Clip[]>();

  const clipsWithUrls = await Promise.all(
    (clips || []).map(async (clip) => {
      const { data } = await supabase.storage
        .from("clips")
        .createSignedUrl(clip.storage_path, 3600);
      return { clip, url: data?.signedUrl || "" };
    })
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Clips</h1>
          <p className="mt-1 text-muted-foreground">
            All extracted highlight clips from your footage
          </p>
        </div>
        {clips && clips.length > 0 && (
          <Button render={<Link href="/highlights/new" />}>
            Build Highlight Reel
          </Button>
        )}
      </div>

      {!clips || clips.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold">No clips yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Upload a video, run AI analysis, and extract clips from key moments.
            </p>
            <Button className="mt-6" render={<Link href="/upload" />}>
              Upload a Video
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {clipsWithUrls.map(({ clip, url }) => (
            <ClipCard key={clip.id} clip={clip} videoUrl={url} />
          ))}
        </div>
      )}
    </div>
  );
}
