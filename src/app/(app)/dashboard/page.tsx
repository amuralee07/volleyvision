import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  AppShell,
  AppPageHeader,
  AppStatCard,
  AppEmptyState,
  AppPanel,
  AppMetaChip,
  HudCorners,
} from "@/components/app-ui";
import { FilmHowItWorks } from "@/components/film-how-it-works";
import type { Video } from "@/lib/types";

function statusConfig(status: string) {
  switch (status) {
    case "ready":
      return {
        className: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
        label: "Ready",
        color: "bg-emerald-400",
        pulse: false,
      };
    case "processing":
      return {
        className: "border-amber-500/30 bg-amber-500/10 text-amber-300",
        label: "Processing",
        color: "bg-amber-400",
        pulse: true,
      };
    case "failed":
      return {
        className: "border-red-500/30 bg-red-500/10 text-red-300",
        label: "Failed",
        color: "bg-red-400",
        pulse: false,
      };
    default:
      return {
        className: "border-white/15 bg-white/5 text-white/60",
        label: status,
        color: "bg-white/40",
        pulse: false,
      };
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

function formatDuration(seconds: number | null | undefined) {
  if (!seconds) return null;
  const m = Math.round(seconds / 60);
  return `${m} min`;
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Video[]>();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("name").eq("user_id", user.id).single()
    : { data: null };

  const firstName = profile?.name?.split(" ")[0];
  const greeting = firstName ? `Hey, ${firstName}` : "Film room";
  const readyCount = videos?.filter((v) => v.status === "ready").length ?? 0;
  const processingCount = videos?.filter((v) => v.status === "processing").length ?? 0;
  const hasFilm = Boolean(videos && videos.length > 0);
  const latest = videos?.[0];

  return (
    <AppShell wide>
      <AppPageHeader
        eyebrow="Film room"
        title={greeting}
        description={
          hasFilm
            ? "Your match and practice film — open a tape to coach, clip, or build a reel."
            : "Drop in your first match or practice tape. Notes and clips land here after analysis."
        }
        meta={
          hasFilm ? (
            <>
              <AppMetaChip tone="emerald">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                {readyCount} ready
              </AppMetaChip>
              {processingCount > 0 && (
                <AppMetaChip tone="amber">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-400" />
                  {processingCount} processing
                </AppMetaChip>
              )}
              <AppMetaChip>
                {videos!.length} tape{videos!.length !== 1 ? "s" : ""}
              </AppMetaChip>
            </>
          ) : undefined
        }
        action={
          <div className="flex flex-wrap items-center gap-2">
            <FilmHowItWorks />
            <Button className="btn-emerald px-6" render={<Link href="/upload" />}>
              <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Upload film
            </Button>
          </div>
        }
      />

      {!hasFilm ? (
        <AppEmptyState
          icon={
            <svg
              className="h-9 w-9 text-emerald-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
              />
            </svg>
          }
          title="No film on the shelf yet"
          description="Upload a match or practice video to start tagging plays, pulling clips, and coaching from the tape."
          action={
            <div className="flex flex-wrap items-center justify-center gap-2">
              <FilmHowItWorks />
              <Button className="btn-emerald px-8" render={<Link href="/upload" />}>
                Upload your first tape
              </Button>
            </div>
          }
        />
      ) : (
        <div className="space-y-8">
          {/* Latest feature + stats */}
          <div className="grid gap-4 lg:grid-cols-5">
            <Link
              href={`/video/${latest!.id}`}
              className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a0f]/80 lg:col-span-3"
            >
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(52,211,153,0.14),transparent_55%)]" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#050508] via-transparent to-transparent opacity-90" />
              <HudCorners />

              <div className="relative flex min-h-[220px] flex-col justify-between p-6 sm:min-h-[260px] sm:p-7">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-emerald-400/80">
                      Latest upload
                    </p>
                    <h2 className="mt-2 max-w-md text-2xl font-bold tracking-tight sm:text-3xl">
                      {latest!.title}
                    </h2>
                  </div>
                  {(() => {
                    const sc = statusConfig(latest!.status);
                    return (
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider ${sc.className}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${sc.color} ${sc.pulse ? "animate-pulse" : ""}`}
                        />
                        {sc.label}
                      </span>
                    );
                  })()}
                </div>

                <div className="flex items-end justify-between gap-4">
                  <div className="space-y-1">
                    <p className="font-mono text-xs text-white/40">
                      {formatDate(latest!.created_at)}
                      {formatDuration(latest!.duration_seconds) &&
                        ` · ${formatDuration(latest!.duration_seconds)}`}
                      {` · ${timeAgo(latest!.created_at)}`}
                    </p>
                    <p className="text-sm text-white/55">
                      Open tape → coaching notes & clips
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-emerald-400/30 bg-emerald-500/15 text-emerald-300 transition-all group-hover:scale-105 group-hover:border-emerald-400/50 group-hover:bg-emerald-500/25 group-hover:shadow-[0_0_30px_rgba(52,211,153,0.25)]">
                    <svg className="ml-0.5 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>

            <div className="grid gap-3 sm:grid-cols-3 lg:col-span-2 lg:grid-cols-1">
              <AppStatCard
                label="Tapes"
                value={videos!.length}
                hint="In your library"
                accent="white"
              />
              <AppStatCard
                label="Ready"
                value={readyCount}
                hint="Open for analysis"
                accent="emerald"
              />
              <AppStatCard
                label="Last upload"
                value={timeAgo(latest!.created_at)}
                hint={formatDate(latest!.created_at)}
                accent="cyan"
              />
            </div>
          </div>

          {/* Shortcuts strip */}
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              {
                href: "/upload",
                label: "Add film",
                desc: "Match or practice upload",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                ),
              },
              {
                href: "/clips",
                label: "Browse clips",
                desc: "Tagged spikes, digs, aces",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z"
                  />
                ),
              },
              {
                href: "/highlights/new",
                label: "Build a reel",
                desc: "Scout-ready highlight tape",
                icon: (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                ),
              },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-4 transition-all hover:-translate-y-0.5 hover:border-emerald-500/25 hover:bg-emerald-500/[0.04]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-white/55 transition-colors group-hover:border-emerald-500/30 group-hover:text-emerald-300">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {item.icon}
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-white/90">{item.label}</p>
                  <p className="text-xs text-white/40">{item.desc}</p>
                </div>
                <svg
                  className="ml-auto h-4 w-4 shrink-0 text-white/20 transition-colors group-hover:text-emerald-400/70"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </Link>
            ))}
          </div>

          {/* Full library */}
          <AppPanel
            title="All film"
            badge={`${videos!.length}`}
            action={
              <Link
                href="/upload"
                className="font-mono text-[10px] uppercase tracking-wider text-emerald-400/70 transition-colors hover:text-emerald-300"
              >
                + Add
              </Link>
            }
          >
            <div className="space-y-2">
              {videos!.map((video, i) => {
                const sc = statusConfig(video.status);
                const duration = formatDuration(video.duration_seconds);
                return (
                  <Link
                    key={video.id}
                    href={`/video/${video.id}`}
                    className="group block"
                  >
                    <div className="flex items-center gap-4 rounded-xl border border-transparent bg-white/[0.015] p-3 transition-all hover:border-white/10 hover:bg-white/[0.04] sm:gap-5 sm:p-3.5">
                      <div className="relative flex aspect-video w-[88px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-emerald-500/10 via-white/[0.04] to-transparent sm:w-[112px]">
                        <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(52,211,153,0.08)_100%)]" />
                        <span className="absolute left-1.5 top-1.5 font-mono text-[8px] text-white/30">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <div className="relative flex h-8 w-8 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/70 backdrop-blur-sm transition-all group-hover:border-emerald-400/40 group-hover:bg-emerald-500/20 group-hover:text-emerald-300">
                          <svg
                            className="ml-0.5 h-3.5 w-3.5"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                        {duration && (
                          <span className="absolute bottom-1.5 right-1.5 rounded bg-black/60 px-1 py-0.5 font-mono text-[8px] text-white/70">
                            {duration}
                          </span>
                        )}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-white/90 transition-colors group-hover:text-white">
                          {video.title}
                        </p>
                        <p className="mt-1 font-mono text-[11px] text-white/35">
                          {formatDate(video.created_at)}
                          <span className="mx-1.5 text-white/15">·</span>
                          {timeAgo(video.created_at)}
                        </p>
                      </div>

                      <div className="flex shrink-0 items-center gap-3">
                        <span
                          className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider sm:inline-flex ${sc.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${sc.color} ${sc.pulse ? "animate-pulse" : ""}`}
                          />
                          {sc.label}
                        </span>
                        <svg
                          className="h-4 w-4 text-white/20 transition-all group-hover:translate-x-0.5 group-hover:text-emerald-400/80"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </AppPanel>
        </div>
      )}
    </AppShell>
  );
}
