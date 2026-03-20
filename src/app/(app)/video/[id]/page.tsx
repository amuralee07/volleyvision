import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Video, Analysis } from "@/lib/types";
import { VideoDetailClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function VideoDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: video } = await supabase
    .from("videos")
    .select("*")
    .eq("id", id)
    .single<Video>();

  if (!video) notFound();

  const { data: analysis } = await supabase
    .from("analyses")
    .select("*")
    .eq("video_id", id)
    .single<Analysis>();

  // Get signed URL for video playback
  const { data: signedUrl } = await supabase.storage
    .from("videos")
    .createSignedUrl(video.storage_path, 3600);

  return (
    <VideoDetailClient
      video={video}
      analysis={analysis ?? null}
      videoUrl={signedUrl?.signedUrl ?? ""}
    />
  );
}
