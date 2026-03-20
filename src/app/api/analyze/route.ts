import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { analyzeVideo, uploadVideoToGemini, waitForFileReady } from "@/lib/gemini";
import { writeFile, unlink, mkdtemp } from "fs/promises";
import path from "path";
import os from "os";

export const maxDuration = 300; // 5 minutes for video analysis

export async function POST(request: NextRequest) {
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

    // Check for existing analysis
    const { data: existing } = await supabase
      .from("analyses")
      .select("id")
      .eq("video_id", videoId)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Analysis already exists", analysisId: existing.id }, { status: 409 });
    }

    // Update video status
    await supabase.from("videos").update({ status: "processing" }).eq("id", videoId);

    // Download video from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("videos")
      .download(video.storage_path);

    if (downloadError || !fileData) {
      await supabase.from("videos").update({ status: "failed" }).eq("id", videoId);
      return NextResponse.json({ error: "Failed to download video" }, { status: 500 });
    }

    // Write to temp file for Gemini upload
    const tmpDir = await mkdtemp(path.join(os.tmpdir(), "vv-"));
    const ext = video.storage_path.split(".").pop() || "mp4";
    const tmpPath = path.join(tmpDir, `video.${ext}`);
    const buffer = Buffer.from(await fileData.arrayBuffer());
    await writeFile(tmpPath, buffer);

    try {
      // Upload to Gemini
      const mimeType = ext === "mov" ? "video/quicktime" : `video/${ext}`;
      const geminiFile = await uploadVideoToGemini(tmpPath, mimeType);

      if (!geminiFile.uri) {
        throw new Error("Failed to get file URI from Gemini");
      }

      // Wait for Gemini to process the file
      if (geminiFile.name && geminiFile.state === "PROCESSING") {
        await waitForFileReady(geminiFile.name);
      }

      // Analyze with Gemini
      const analysis = await analyzeVideo(geminiFile.uri, geminiFile.mimeType ?? mimeType);

      // Save analysis to database
      const { data: savedAnalysis, error: saveError } = await supabase
        .from("analyses")
        .insert({
          video_id: videoId,
          summary: analysis.summary || "",
          strengths: analysis.strengths || [],
          improvements: analysis.improvements || [],
          highlights: analysis.highlights || [],
          raw_response: analysis,
        })
        .select("id")
        .single();

      if (saveError) throw saveError;

      // Update video status
      await supabase.from("videos").update({ status: "ready" }).eq("id", videoId);

      return NextResponse.json({
        success: true,
        analysisId: savedAnalysis.id,
      });
    } finally {
      // Clean up temp file
      await unlink(tmpPath).catch(() => {});
    }
  } catch (err) {
    console.error("Analysis error:", err);
    return NextResponse.json(
      { error: "Analysis failed. Please try again." },
      { status: 500 }
    );
  }
}
