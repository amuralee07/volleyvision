"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
const MAX_SIZE = 2 * 1024 * 1024 * 1024;

export function VideoUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) validateAndSetFile(droppedFile);
  }, []);

  function validateAndSetFile(f: File) {
    if (!ACCEPTED_TYPES.includes(f.type)) {
      toast.error("Unsupported format. Please upload MP4, MOV, AVI, or WebM.");
      return;
    }
    if (f.size > MAX_SIZE) {
      toast.error("File is too large. Maximum size is 2GB.");
      return;
    }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^/.]+$/, ""));
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setProgress(0);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileId = uuidv4();
      const ext = file.name.split(".").pop();
      const storagePath = `${user.id}/${fileId}.${ext}`;

      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 90));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(storagePath, file, { cacheControl: "3600", upsert: false });

      clearInterval(progressInterval);
      if (uploadError) throw uploadError;

      setProgress(95);

      const { error: dbError } = await supabase.from("videos").insert({
        id: fileId,
        user_id: user.id,
        title,
        storage_path: storagePath,
        status: "ready",
      });

      if (dbError) throw dbError;

      setProgress(100);
      toast.success("Video uploaded successfully!");
      setTimeout(() => {
        router.push(`/video/${fileId}`);
        router.refresh();
      }, 500);
    } catch (err) {
      console.error("Upload error:", err);
      toast.error("Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      <div
        className={`relative rounded-2xl border-2 border-dashed p-12 text-center transition-all ${
          dragActive
            ? "border-emerald-400/50 bg-emerald-500/10 scale-[1.01]"
            : file
            ? "border-emerald-400/40 bg-emerald-500/10"
            : "border-white/10 hover:border-white/20 hover:bg-white/[0.03]"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
          onChange={(e) => { const f = e.target.files?.[0]; if (f) validateAndSetFile(f); }}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={uploading}
        />
        {file ? (
          <div className="space-y-3">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-semibold text-lg">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-muted-foreground"
              onClick={(e) => { e.stopPropagation(); setFile(null); setTitle(""); }}
              disabled={uploading}
            >
              Choose a different file
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white/70">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-semibold">Drop your video here</p>
              <p className="text-sm text-muted-foreground mt-1">or click to browse files</p>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-white/50">MP4</span>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-white/50">MOV</span>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-white/50">AVI</span>
              <span className="rounded-full bg-white/5 px-2.5 py-1 text-white/50">WebM</span>
              <span>&middot;</span>
              <span>Up to 2GB</span>
            </div>
          </div>
        )}
      </div>

      {file && (
        <div className="space-y-5 border-t border-white/10 pt-6">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-sm font-semibold">Video Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Varsity Match vs Lincoln High"
              required
              disabled={uploading}
              className="h-11"
            />
          </div>

          {uploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Uploading your video...</span>
                <span className="font-semibold text-emerald-400">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <Button type="submit" className="h-11 w-full rounded-full bg-white font-semibold text-black hover:bg-white/90" disabled={uploading || !title}>
            {uploading ? (
              <>
                <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                Uploading...
              </>
            ) : (
              <>
                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                Upload Video
              </>
            )}
          </Button>
        </div>
      )}
    </form>
  );
}
