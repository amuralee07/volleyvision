import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppPageHeader, AppStatCard, AppEmptyState, AppPanel } from "@/components/app-ui";
import type { Video } from "@/lib/types";

function statusConfig(status: string) {
  switch (status) {
    case "ready": return { className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-400", label: "Ready", color: "bg-emerald-500" };
    case "processing": return { className: "border-amber-500/30 bg-amber-500/10 text-amber-400", label: "Processing", color: "bg-amber-500" };
    case "failed": return { className: "border-red-500/30 bg-red-500/10 text-red-400", label: "Failed", color: "bg-red-500" };
    default: return { className: "border-white/15 bg-white/5 text-white/60", label: status, color: "bg-gray-400" };
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

const QUICK_LINKS = [
  {
    href: "/upload",
    label: "Upload Film",
    desc: "Add match or practice footage",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
      </svg>
    ),
  },
  {
    href: "/clips",
    label: "View Clips",
    desc: "Browse auto-extracted highlights",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
      </svg>
    ),
  },
  {
    href: "/highlights/new",
    label: "Build Reel",
    desc: "Stitch clips for scouts",
    icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 0A2.25 2.25 0 015.625 3h12.75A2.25 2.25 0 0120.25 5.625m-19.5 0V9.75m0 0a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121.75 9.75v9.75" />
      </svg>
    ),
  },
];

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
  const readyCount = videos?.filter((v) => v.status === "ready").length ?? 0;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <AppPageHeader
        eyebrow="Dashboard"
        title={greeting}
        description={
          videos && videos.length > 0
            ? `${videos.length} video${videos.length !== 1 ? "s" : ""} in your film library — ${readyCount} ready for AI analysis.`
            : "Upload your first video to unlock AI coaching insights and auto-extracted clips."
        }
        action={
          <Button className="rounded-full bg-white px-6 text-black hover:bg-white/90" render={<Link href="/upload" />}>
            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload Video
          </Button>
        }
      />

      <div className="mb-10 grid gap-3 sm:grid-cols-3">
        {QUICK_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="group rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all hover:border-emerald-500/20 hover:bg-white/[0.05]"
          >
            <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-white/60 transition-colors group-hover:border-emerald-500/30 group-hover:text-emerald-400">
              {link.icon}
            </div>
            <p className="font-semibold">{link.label}</p>
            <p className="mt-0.5 text-xs text-white/40">{link.desc}</p>
          </Link>
        ))}
      </div>

      {videos && videos.length > 0 && (
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <AppStatCard label="Total Videos" value={videos.length} hint="In your library" />
          <AppStatCard label="Ready" value={readyCount} hint="Available to analyze" accent="emerald" />
          <AppStatCard label="Latest Upload" value={timeAgo(videos[0].created_at)} hint={formatDate(videos[0].created_at)} accent="white" />
        </div>
      )}

      {!videos || videos.length === 0 ? (
        <AppEmptyState
          icon={
            <svg className="h-10 w-10 text-emerald-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
          title="No film uploaded yet"
          description="Upload your first volleyball video to get AI-powered coaching analysis and highlight clips."
          action={
            <Button className="rounded-full bg-white px-8 text-black hover:bg-white/90" render={<Link href="/upload" />}>
              Upload Your First Video
            </Button>
          }
        />
      ) : (
        <AppPanel title="Your Film Library" badge={`${videos.length} videos`}>
          <div className="space-y-3">
            {videos.map((video, i) => {
              const sc = statusConfig(video.status);
              return (
                <Link key={video.id} href={`/video/${video.id}`} className="block">
                  <div className="group flex items-center gap-5 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition-all hover:border-white/20 hover:bg-white/[0.04]">
                    <div className="relative flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-white/10 to-white/[0.02]">
                      <span className="absolute left-1.5 top-1.5 font-mono text-[8px] text-white/30">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <svg className="h-6 w-6 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                      </svg>
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold transition-colors group-hover:text-white">{video.title}</p>
                      <p className="mt-0.5 font-mono text-xs text-white/40">
                        {formatDate(video.created_at)}
                        {video.duration_seconds && (
                          <> · {Math.round(video.duration_seconds / 60)} MIN</>
                        )}
                      </p>
                    </div>

                    <div className="flex shrink-0 items-center gap-3">
                      <Badge variant="outline" className={`rounded-full ${sc.className}`}>
                        <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full ${sc.color}`} />
                        {sc.label}
                      </Badge>
                      <svg className="h-4 w-4 text-white/30 transition-colors group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </AppPanel>
      )}
    </div>
  );
}
