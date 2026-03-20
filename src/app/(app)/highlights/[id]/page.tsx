import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { HighlightReel, Clip } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function HighlightReelPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: reel } = await supabase
    .from("highlight_reels")
    .select("*")
    .eq("id", id)
    .single<HighlightReel>();

  if (!reel) notFound();

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

  const shareUrl = `/share/${reel.share_token}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{reel.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orderedClips.length} clips &middot; Created{" "}
            {new Date(reel.created_at).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <Button variant="outline" render={<Link href={shareUrl} target="_blank" />}>
          Share Link
        </Button>
      </div>

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
                  <video src={url} controls className="w-full aspect-video" preload="metadata" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
