"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

const ACCEPTED_TYPES = ["video/mp4", "video/quicktime", "video/x-msvideo", "video/webm"];
const MAX_SIZE = 2 * 1024 * 1024 * 1024; // 2GB

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
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
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
    if (!title) {
      setTitle(f.name.replace(/\.[^/.]+$/, ""));
    }
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

      // Simulate progress for UX since Supabase doesn't expose upload progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => Math.min(prev + 2, 90));
      }, 200);

      const { error: uploadError } = await supabase.storage
        .from("videos")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

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
        className={`relative rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
          dragActive
            ? "border-primary bg-primary/5"
            : file
            ? "border-green-500 bg-green-50"
            : "border-muted-foreground/25 hover:border-muted-foreground/50"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="video/mp4,video/quicktime,video/x-msvideo,video/webm"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) validateAndSetFile(f);
          }}
          className="absolute inset-0 cursor-pointer opacity-0"
          disabled={uploading}
        />
        {file ? (
          <div className="space-y-2">
            <div className="text-4xl">🎬</div>
            <p className="font-medium">{file.name}</p>
            <p className="text-sm text-muted-foreground">
              {(file.size / (1024 * 1024)).toFixed(1)} MB
            </p>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setFile(null);
                setTitle("");
              }}
              disabled={uploading}
            >
              Remove
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl">📁</div>
            <p className="font-medium">Drop your video here or click to browse</p>
            <p className="text-sm text-muted-foreground">
              MP4, MOV, AVI, or WebM up to 2GB
            </p>
          </div>
        )}
      </div>

      {file && (
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Video Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Varsity Match vs Lincoln High"
                required
                disabled={uploading}
              />
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Uploading...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            <Button type="submit" className="w-full" disabled={uploading || !title}>
              {uploading ? "Uploading..." : "Upload Video"}
            </Button>
          </CardContent>
        </Card>
      )}
    </form>
  );
}
