import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeVideo, uploadVideoToGemini, waitForFileReady } from "@/lib/gemini";
import { getVideoDuration } from "@/lib/ffmpeg";
import { execFile } from "child_process";
import { unlink, mkdtemp } from "fs/promises";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 300;

const YOUTUBE_URL_REGEX = /^(https?:\/\/)?(www\.)?(youtube\.com\/(watch\?v=|shorts\/)|youtu\.be\/)[a-zA-Z0-9_-]+/;

function runYtDlp(url: string, outputPath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    execFile(
      "yt-dlp",
      [
        "-f", "bestvideo[height<=480][ext=mp4]+bestaudio[ext=m4a]/best[height<=480][ext=mp4]/best[ext=mp4]",
        "--no-playlist",
        "--max-filesize", "500M",
        "-o", outputPath,
        url,
      ],
      { timeout: 180_000 },
      (error, stdout, stderr) => {
        if (error) reject(new Error(stderr || error.message));
        else resolve(stdout);
      }
    );
  });
}

function getVideoInfo(url: string): Promise<{ title: string; duration: number }> {
  return new Promise((resolve, reject) => {
    execFile(
      "yt-dlp",
      ["--get-title", "--get-duration", "--no-playlist", url],
      { timeout: 15_000 },
      (error, stdout) => {
        if (error) reject(error);
        const lines = stdout.trim().split("\n");
        const title = lines[0] || "YouTube Import";
        const durationStr = lines[1] || "0:00";
        const parts = durationStr.split(":").map(Number);
        let duration = 0;
        if (parts.length === 3) duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
        else if (parts.length === 2) duration = parts[0] * 60 + parts[1];
        else duration = parts[0] || 0;
        resolve({ title, duration });
      }
    );
  });
}

export async function POST(request: NextRequest) {
  let tmpPath: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { url, analyzeAfter } = await request.json();

    if (!url || !YOUTUBE_URL_REGEX.test(url)) {
      return NextResponse.json({ error: "Please provide a valid YouTube URL" }, { status: 400 });
    }

    // Get video info
    let title = "YouTube Import";
    let duration = 0;
    try {
      const info = await getVideoInfo(url);
      title = info.title;
      duration = info.duration;
    } catch {
      // Continue with default title
    }

    // Download video to temp file
    const tmpDir = await mkdtemp(path.join(os.tmpdir(), "vv-yt-"));
    tmpPath = path.join(tmpDir, "video.mp4");

    try {
      await runYtDlp(url, tmpPath);
    } catch {
      return NextResponse.json(
        { error: "Failed to download YouTube video. Make sure the URL is valid and the video is public." },
        { status: 400 }
      );
    }

    const videoId = uuidv4();

    // Save video record — store YouTube URL instead of a storage path
    const { error: dbError } = await supabase.from("videos").insert({
      id: videoId,
      user_id: user.id,
      title,
      storage_path: url,
      duration_seconds: duration || null,
      status: analyzeAfter ? "processing" : "ready",
    });

    if (dbError) throw dbError;

    // Run AI analysis directly from the downloaded file
    if (analyzeAfter) {
      try {
        let realDuration = duration;
        try {
          realDuration = await getVideoDuration(tmpPath);
          console.log("[YouTube] Video duration from ffprobe:", realDuration, "seconds");
        } catch {
          console.warn("[YouTube] Could not get duration, using yt-dlp value:", duration);
        }

        const geminiFile = await uploadVideoToGemini(tmpPath, "video/mp4");

        if (!geminiFile.uri) throw new Error("No file URI from Gemini");

        if (geminiFile.name && geminiFile.state === "PROCESSING") {
          await waitForFileReady(geminiFile.name);
        }

        const analysis = await analyzeVideo(geminiFile.uri, geminiFile.mimeType ?? "video/mp4", realDuration);

        const { data: savedAnalysis } = await supabase.from("analyses").insert({
          video_id: videoId,
          summary: analysis.summary || "",
          strengths: analysis.strengths || [],
          improvements: analysis.improvements || [],
          highlights: analysis.highlights || [],
          raw_response: analysis,
        }).select("id").single();

        // Auto-create clips from highlight moments
        const highlights = analysis.highlights || [];
        if (highlights.length > 0 && savedAnalysis) {
          const clipRows = highlights.map((h: { label?: string; start_time?: number; end_time?: number; description?: string; player_feedback?: string }) => ({
            video_id: videoId,
            analysis_id: savedAnalysis.id,
            label: h.label || "Highlight",
            start_time: Math.max(0, (h.start_time ?? 0) - 2),
            end_time: (h.end_time ?? 0) + 2,
            description: h.description || "",
            player_feedback: h.player_feedback || "",
          }));
          await supabase.from("clips").insert(clipRows);
        }

        await supabase.from("videos").update({ status: "ready" }).eq("id", videoId);
      } catch (err) {
        console.error("Analysis error:", err);
        await supabase.from("videos").update({ status: "ready" }).eq("id", videoId);
      }
    }

    return NextResponse.json({ success: true, videoId, title });
  } catch (err) {
    console.error("YouTube import error:", err);
    return NextResponse.json(
      { error: "Failed to import YouTube video. Please try again." },
      { status: 500 }
    );
  } finally {
    if (tmpPath) await unlink(tmpPath).catch(() => {});
  }
}
