"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ClipCard } from "@/components/clip-card";
import { AppShell, AppPageHeader, AppEmptyState, AppPanel } from "@/components/app-ui";
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
    <AppShell>
      <AppPageHeader
        eyebrow="Reels"
        title="Build your tape"
        description="Pick clips and stitch a shareable highlight reel for coaches and scouts."
        meta={
          clipsWithUrls.length > 0 ? (
            <span className="font-mono text-[10px] uppercase tracking-wider text-white/40">
              {selectedIds.length} selected · {clipsWithUrls.length} available
            </span>
          ) : undefined
        }
      />

      {clipsWithUrls.length === 0 ? (
        <AppEmptyState
          icon={
            <svg className="h-9 w-9 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
            </svg>
          }
          title="No clips to stitch yet"
          description="Upload film, run analysis, then come back — clips land here ready for a reel."
        />
      ) : (
        <form onSubmit={handleCreate} className="space-y-6">
          <AppPanel title="Reel details" badge={`${selectedIds.length} selected`}>
            <div className="space-y-2">
              <Label htmlFor="reel-title">Title</Label>
              <Input
                id="reel-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 2026 Spring Season Highlights"
                required
                className="h-11 border-white/10 bg-white/[0.03]"
              />
            </div>
          </AppPanel>

          <AppPanel title="Select clips" badge={`${clipsWithUrls.length} available`}>
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
            className="btn-emerald h-12 w-full"
            disabled={saving || selectedIds.length === 0}
          >
            {saving
              ? "Creating..."
              : `Create reel · ${selectedIds.length} clip${selectedIds.length !== 1 ? "s" : ""}`}
          </Button>
        </form>
      )}
    </AppShell>
  );
}
