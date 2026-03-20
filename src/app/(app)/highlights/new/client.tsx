"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { ClipCard } from "@/components/clip-card";
import { toast } from "sonner";
import type { Clip } from "@/lib/types";

interface Props {
  clipsWithUrls: Array<{ clip: Clip; url: string }>;
}

export function ReelBuilderClient({ clipsWithUrls }: Props) {
  const [title, setTitle] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  function toggleClip(clipId: string) {
    setSelectedIds((prev) =>
      prev.includes(clipId)
        ? prev.filter((id) => id !== clipId)
        : [...prev, clipId]
    );
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (selectedIds.length === 0) {
      toast.error("Select at least one clip.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/highlights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, clipIds: selectedIds }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      toast.success("Highlight reel created!");
      router.push(`/highlights/${data.reel.id}`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create reel");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Build Highlight Reel</h1>
        <p className="mt-1 text-muted-foreground">
          Select clips and create a shareable highlight tape for scouts
        </p>
      </div>

      {clipsWithUrls.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🎬</div>
            <h3 className="text-lg font-semibold">No clips available</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
              First, upload a video, analyze it, and extract some clips.
            </p>
          </CardContent>
        </Card>
      ) : (
        <form onSubmit={handleCreate} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="reel-title">Reel Title</Label>
            <Input
              id="reel-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., 2026 Spring Season Highlights"
              required
            />
          </div>

          <div>
            <p className="text-sm font-medium mb-3">
              Select clips ({selectedIds.length} selected)
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              {clipsWithUrls.map(({ clip, url }) => (
                <ClipCard
                  key={clip.id}
                  clip={clip}
                  videoUrl={url}
                  selectable
                  selected={selectedIds.includes(clip.id)}
                  onToggle={toggleClip}
                />
              ))}
            </div>
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={saving || selectedIds.length === 0}
          >
            {saving ? "Creating..." : `Create Highlight Reel (${selectedIds.length} clips)`}
          </Button>
        </form>
      )}
    </div>
  );
}
