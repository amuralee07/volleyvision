"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipCard } from "@/components/clip-card";
import { AppPageHeader, AppEmptyState, AppPanel } from "@/components/app-ui";
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
    <div className="mx-auto max-w-4xl px-6 py-10">
      <AppPageHeader
        eyebrow="Highlight Reel"
        title="Build your tape"
        description="Select clips and create a shareable highlight reel for scouts and recruiters."
      />

      {clipsWithUrls.length === 0 ? (
        <AppEmptyState
          icon={<span className="text-3xl">🎬</span>}
          title="No clips available"
          description="Upload a video, run AI analysis, and clips will appear here ready to stitch into a reel."
        />
      ) : (
        <form onSubmit={handleCreate} className="space-y-6">
          <AppPanel title="Reel Details" badge={`${selectedIds.length} selected`}>
            <div className="space-y-2">
              <Label htmlFor="reel-title">Reel Title</Label>
              <Input
                id="reel-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 2026 Spring Season Highlights"
                required
                className="h-11"
              />
            </div>
          </AppPanel>

          <AppPanel title="Select Clips" badge={`${clipsWithUrls.length} available`}>
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
          </AppPanel>

          <Button
            type="submit"
            className="w-full rounded-full bg-white py-6 text-black hover:bg-white/90"
            disabled={saving || selectedIds.length === 0}
          >
            {saving ? "Creating..." : `Create Highlight Reel (${selectedIds.length} clips)`}
          </Button>
        </form>
      )}
    </div>
  );
}
