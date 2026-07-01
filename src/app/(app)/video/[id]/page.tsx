import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Video, Analysis } from "@/lib/types";
import { VideoDetailClient } from "./client";

interface PageProps {
  params: Promise<{ id: string }>;
}

function isYouTubeUrl(path: string) {
  return path.startsWith("http") && (path.includes("youtube.com") || path.includes("youtu.be"));
}

function getYouTubeEmbedUrl(url: string): string {
  let videoId = "";
  if (url.includes("youtu.be/")) {
    videoId = url.split("youtu.be/")[1]?.split(/[?&#]/)[0] ?? "";
  } else if (url.includes("watch?v=")) {
    videoId = url.split("watch?v=")[1]?.split(/[&#]/)[0] ?? "";
  } else if (url.includes("shorts/")) {
    videoId = url.split("shorts/")[1]?.split(/[?&#]/)[0] ?? "";
  }
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
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

  let videoUrl = "";

  if (isYouTubeUrl(video.storage_path)) {
    videoUrl = getYouTubeEmbedUrl(video.storage_path);
  } else {
    const { data: signedUrl } = await supabase.storage
      .from("videos")
      .createSignedUrl(video.storage_path, 3600);
    videoUrl = signedUrl?.signedUrl ?? "";
  }

  return (
    <VideoDetailClient
      video={video}
      analysis={analysis ?? null}
      videoUrl={videoUrl}
      isYouTube={isYouTubeUrl(video.storage_path)}
    />
  );
}
