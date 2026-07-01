import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Video } from "@/lib/types";

function statusConfig(status: string) {
  switch (status) {
    case "ready": return { variant: "default" as const, label: "Ready", color: "bg-emerald-500" };
    case "processing": return { variant: "secondary" as const, label: "Processing", color: "bg-amber-500" };
    case "failed": return { variant: "destructive" as const, label: "Failed", color: "bg-red-500" };
    default: return { variant: "outline" as const, label: status, color: "bg-gray-400" };
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(dateStr);
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Video[]>();

  const { data: { user } } = await supabase.auth.getUser();
  const { data: profile } = user ? await supabase
    .from("profiles")
    .select("name")
    .eq("user_id", user.id)
    .single() : { data: null };

  const greeting = profile?.name ? `Welcome back, ${profile.name.split(" ")[0]}` : "Welcome back";

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      {/* Header */}
      <div className="mb-10 flex items-end justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{greeting}</h1>
          <p className="mt-1 text-muted-foreground">
            {videos && videos.length > 0
              ? `You have ${videos.length} video${videos.length !== 1 ? "s" : ""} uploaded`
              : "Upload your first video to get started"}
          </p>
        </div>
        <Button className="rounded-full px-6 shadow-sm" render={<Link href="/upload" />}>
          <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Upload Video
        </Button>
      </div>

      {/* Quick stats */}
      {videos && videos.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mb-10">
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Total Videos</p>
            <p className="text-2xl font-bold mt-1">{videos.length}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Ready for Analysis</p>
            <p className="text-2xl font-bold mt-1">{videos.filter(v => v.status === "ready").length}</p>
          </div>
          <div className="rounded-2xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">Latest Upload</p>
            <p className="text-2xl font-bold mt-1">{timeAgo(videos[0].created_at)}</p>
          </div>
        </div>
      )}

      {/* Videos list */}
      {!videos || videos.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed p-16 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-6">
            <svg className="h-10 w-10 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold">No videos yet</h3>
          <p className="mt-2 text-muted-foreground max-w-sm mx-auto">
            Upload your first volleyball video to get AI-powered coaching analysis and highlight clips.
          </p>
          <Button className="mt-8 rounded-full px-8" render={<Link href="/upload" />}>
            Upload Your First Video
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold mb-4">Your Videos</h2>
          {videos.map((video) => {
            const sc = statusConfig(video.status);
            return (
              <Link key={video.id} href={`/video/${video.id}`} className="block">
                <div className="group flex items-center gap-5 rounded-xl border bg-card p-5 transition-all hover:shadow-md hover:border-primary/30">
                  {/* Video icon/thumbnail */}
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <svg className="h-6 w-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                    </svg>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold group-hover:text-primary transition-colors truncate">{video.title}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {formatDate(video.created_at)}
                      {video.duration_seconds && (
                        <> &middot; {Math.round(video.duration_seconds / 60)} min</>
                      )}
                    </p>
                  </div>

                  {/* Status */}
                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant={sc.variant} className="rounded-full">
                      <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${sc.color}`} />
                      {sc.label}
                    </Badge>
                    <svg className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
