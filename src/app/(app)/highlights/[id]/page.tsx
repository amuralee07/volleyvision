import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AppPageHeader } from "@/components/app-ui";
import { ShareLinkButton } from "@/components/share-link-button";
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

  const sharePath = `/share/${reel.share_token}`;

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <AppPageHeader
        eyebrow="Highlight Reel"
        title={reel.title}
        description={`${orderedClips.length} clips · Created ${new Date(reel.created_at).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        })}`}
        action={<ShareLinkButton path={sharePath} />}
      />

      <div className="space-y-6">
        {clipsWithUrls.map(({ clip, url }, i) => (
          <Card key={clip.id} className="border-white/10 bg-white/[0.03]">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="font-mono text-sm text-white/40">#{String(i + 1).padStart(2, "0")}</span>
                <Badge variant="outline" className="rounded-full border-white/15">
                  {clip.label}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {url && (
                <div className="overflow-hidden rounded-lg bg-black">
                  <video src={url} controls className="aspect-video w-full" preload="metadata" />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
