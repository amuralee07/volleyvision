import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Video } from "@/lib/types";

function statusVariant(status: string) {
  switch (status) {
    case "ready": return "default" as const;
    case "processing": return "secondary" as const;
    case "failed": return "destructive" as const;
    default: return "outline" as const;
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: videos } = await supabase
    .from("videos")
    .select("*")
    .order("created_at", { ascending: false })
    .returns<Video[]>();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Your uploaded footage and analysis results
          </p>
        </div>
        <Button render={<Link href="/upload" />}>Upload Video</Button>
      </div>

      {!videos || videos.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🏐</div>
            <h3 className="text-lg font-semibold">No videos yet</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              Upload your first volleyball video to get AI-powered coaching analysis and highlight clips.
            </p>
            <Button className="mt-6" render={<Link href="/upload" />}>
              Upload Your First Video
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {videos.map((video) => (
            <Link key={video.id} href={`/video/${video.id}`}>
              <Card className="transition-colors hover:bg-muted/50">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{video.title}</CardTitle>
                      <CardDescription>
                        Uploaded {formatDate(video.created_at)}
                        {video.duration_seconds && (
                          <> &middot; {Math.round(video.duration_seconds / 60)} min</>
                        )}
                      </CardDescription>
                    </div>
                    <Badge variant={statusVariant(video.status)}>
                      {video.status}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
