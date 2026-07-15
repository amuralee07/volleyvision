import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeVideo, uploadVideoToGemini, waitForFileReady, labelClips } from "@/lib/gemini";
import { splitIntoSegments, extractSegments } from "@/lib/ffmpeg";
import { writeFile, unlink, mkdtemp, readFile } from "fs/promises";
import { execFile } from "child_process";
import path from "path";
import os from "os";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 300;

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
  let tmpDir: string | null = null;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { videoId } = await request.json();
    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
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

    // Delete previous analysis and clips for re-run
    await supabase.from("clips").delete().eq("video_id", videoId);
    await supabase.from("analyses").delete().eq("video_id", videoId);

    await supabase.from("videos").update({ status: "processing" }).eq("id", videoId);

    tmpDir = await mkdtemp(path.join(os.tmpdir(), "vv-"));
    const tmpPath = path.join(tmpDir, "video.mp4");

    try {
      // Step 1: Download video
      console.log("[Analyze] Step 1: Downloading video...");
      if (isYouTubeUrl(video.storage_path)) {
        await downloadYouTube(video.storage_path, tmpPath);
      } else {
        const { data: fileData, error: downloadError } = await supabase.storage
          .from("videos")
          .download(video.storage_path);
        if (downloadError || !fileData) {
          await supabase.from("videos").update({ status: "failed" }).eq("id", videoId);
          return NextResponse.json({ error: "Failed to download video" }, { status: 500 });
        }
        const buffer = Buffer.from(await fileData.arrayBuffer());
        await writeFile(tmpPath, buffer);
      }

      // Step 2: Upload full video to Gemini for coaching analysis
      console.log("[Analyze] Step 2: Uploading to Gemini for analysis...");
      const geminiFile = await uploadVideoToGemini(tmpPath, "video/mp4");
      if (!geminiFile.uri) throw new Error("Failed to get file URI from Gemini");
      if (geminiFile.name && geminiFile.state === "PROCESSING") {
        await waitForFileReady(geminiFile.name);
      }

      const analysis = await analyzeVideo(geminiFile.uri, geminiFile.mimeType ?? "video/mp4");

      // Save analysis (without highlights — clips are separate now)
      // Prefer teams/players columns; fall back if migration 002 isn't applied yet.
      let savedAnalysis: { id: string } | null = null;
      const analysisPayload = {
        video_id: videoId,
        summary: analysis.summary || "",
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
        teams: analysis.teams || [],
        players: analysis.players || [],
        highlights: [],
        raw_response: analysis,
      };

      const firstTry = await supabase
        .from("analyses")
        .insert(analysisPayload)
        .select("id")
        .single();

      if (firstTry.error) {
        console.warn("[Analyze] teams/players insert failed, retrying without columns:", firstTry.error.message);
        const retry = await supabase
          .from("analyses")
          .insert({
            video_id: videoId,
            summary: analysis.summary || "",
            strengths: analysis.strengths || [],
            improvements: analysis.improvements || [],
            highlights: [],
            raw_response: analysis,
          })
          .select("id")
          .single();
        if (retry.error) throw retry.error;
        savedAnalysis = retry.data;
      } else {
        savedAnalysis = firstTry.data;
      }

      if (!savedAnalysis) throw new Error("Failed to save analysis");


      // Step 3: Split video into segments
      console.log("[Analyze] Step 3: Splitting video into segments...");
      const segments = await splitIntoSegments(tmpPath, 10, 20);
      console.log(`[Analyze] Got ${segments.length} segments`);

      if (segments.length > 0) {
        // Step 4: Extract clip segments
        console.log("[Analyze] Step 4: Extracting clip segments...");
        const clipsDir = path.join(tmpDir, "clips");
        const extracted = await extractSegments(tmpPath, segments, clipsDir, 20);
        console.log(`[Analyze] Extracted ${extracted.length} clips`);

        // Step 5: Have Gemini label each clip
        console.log("[Analyze] Step 5: Labeling clips with Gemini...");
        const labels = await labelClips(
          extracted.map((e) => ({ index: e.segment.index, filePath: e.filePath }))
        );

        // Step 6: Save highlighted clips to Supabase
        console.log("[Analyze] Step 6: Saving clips...");
        for (const ext of extracted) {
          const label = labels.find((l) => l.index === ext.segment.index);
          if (!label || !label.is_highlight) continue;

          const clipId = uuidv4();
          const storagePath = `${user.id}/${clipId}.mp4`;

          // Upload clip to Supabase Storage
          const clipData = await readFile(ext.filePath);
          const { error: uploadError } = await supabase.storage
            .from("clips")
            .upload(storagePath, clipData, {
              contentType: "video/mp4",
              cacheControl: "3600",
            });

          if (uploadError) {
            console.error(`[Analyze] Failed to upload clip ${clipId}:`, uploadError.message);
            continue;
          }

          await supabase.from("clips").insert({
            id: clipId,
            video_id: videoId,
            analysis_id: savedAnalysis.id,
            label: label.label || "Highlight",
            start_time: ext.segment.start,
            end_time: ext.segment.end,
            storage_path: storagePath,
            description: label.description || "",
            player_feedback: label.player_feedback || "",
          });
        }
      }

      await supabase.from("videos").update({ status: "ready" }).eq("id", videoId);
      console.log("[Analyze] Complete!");

      return NextResponse.json({ success: true, analysisId: savedAnalysis.id });
    } catch (err) {
      await supabase.from("videos").update({ status: "ready" }).eq("id", videoId);
      throw err;
    }
  } catch (err) {
    console.error("Analysis error:", err);

    const message = err instanceof Error ? err.message : "";
    if (message.includes("429") || message.includes("quota") || message.includes("RESOURCE_EXHAUSTED")) {
      return NextResponse.json(
        { error: "Gemini rate limit reached. Please wait a minute and try again." },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  } finally {
    // Clean up all temp files
    if (tmpDir) {
      const { rm } = await import("fs/promises");
      await rm(tmpDir, { recursive: true, force: true }).catch(() => {});
    }
  }
}
