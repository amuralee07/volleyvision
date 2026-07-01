import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { extractClip } from "@/lib/ffmpeg";
import { writeFile, readFile, unlink, mkdtemp } from "fs/promises";
import { execFile } from "child_process";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 120;

function isYouTubeUrl(str: string) {
  return str.startsWith("http") && (str.includes("youtube.com") || str.includes("youtu.be"));
}

function downloadYouTube(url: string, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    execFile(
      "yt-dlp",
      ["-f", "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[ext=mp4]", "--no-playlist", "--max-filesize", "500M", "-o", outputPath, url],
      { timeout: 180_000 },
      (error, _stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message));
        else resolve();
      }
    );
  });
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoId, analysisId, label, startTime, endTime } = await request.json();

    if (!videoId || startTime === undefined || endTime === undefined) {
      return NextResponse.json(
        { error: "videoId, startTime, and endTime are required" },
        { status: 400 }
      );
    }

    const { data: video, error: videoError } = await supabase
      .from("videos")
      .select("*")
      .eq("id", videoId)
      .eq("user_id", user.id)
      .single();

    if (videoError || !video) {
      return NextResponse.json({ error: "Video not found" }, { status: 404 });
    }

    const tmpDir = await mkdtemp(path.join(os.tmpdir(), "vv-clip-"));
    const inputPath = path.join(tmpDir, "input.mp4");

    if (isYouTubeUrl(video.storage_path)) {
      await downloadYouTube(video.storage_path, inputPath);
    } else {
      const { data: fileData, error: downloadError } = await supabase.storage
        .from("videos")
        .download(video.storage_path);

      if (downloadError || !fileData) {
        return NextResponse.json({ error: "Failed to download video" }, { status: 500 });
      }

      const buffer = Buffer.from(await fileData.arrayBuffer());
      await writeFile(inputPath, buffer);
    }

    const clipId = uuidv4();
    const clipFilename = `${clipId}.mp4`;

    try {
      // Extract clip with FFmpeg
      const clipPath = await extractClip(inputPath, startTime, endTime, clipFilename);

      // Upload clip to Supabase Storage
      const clipData = await readFile(clipPath);
      const storagePath = `${user.id}/${clipFilename}`;

      const { error: uploadError } = await supabase.storage
        .from("clips")
        .upload(storagePath, clipData, {
          contentType: "video/mp4",
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      // Save clip metadata
      const { data: savedClip, error: saveError } = await supabase
        .from("clips")
        .insert({
          id: clipId,
          video_id: videoId,
          analysis_id: analysisId || null,
          label: label || "Clip",
          start_time: startTime,
          end_time: endTime,
          storage_path: storagePath,
        })
        .select()
        .single();

      if (saveError) throw saveError;

      // Clean up
      await unlink(inputPath).catch(() => {});
      await unlink(clipPath).catch(() => {});

      return NextResponse.json({ success: true, clip: savedClip });
    } catch (err) {
      await unlink(inputPath).catch(() => {});
      throw err;
    }
  } catch (err) {
    console.error("Clip extraction error:", err);
    return NextResponse.json(
      { error: "Failed to extract clip. Please try again." },
      { status: 500 }
    );
  }
}
