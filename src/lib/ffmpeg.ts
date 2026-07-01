import ffmpeg from "fluent-ffmpeg";
import { execFile } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

export async function extractClip(
  inputPath: string,
  startTime: number,
  endTime: number,
  outputFilename: string
): Promise<string> {
  const outputDir = path.join(os.tmpdir(), "volleyball-clips");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, outputFilename);
  const duration = endTime - startTime;

  return new Promise((resolve, reject) => {
    ffmpeg(inputPath)
      .setStartTime(startTime)
      .setDuration(duration)
      .output(outputPath)
      .outputOptions(["-c:v", "libx264", "-c:a", "aac", "-movflags", "+faststart"])
      .on("end", () => resolve(outputPath))
      .on("error", (err: Error) => reject(err))
      .run();
  });
}

export async function getVideoDuration(inputPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(inputPath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration ?? 0);
    });
  });
}

export interface SceneSegment {
  index: number;
  start: number;
  end: number;
  duration: number;
}

/**
 * Split a video into fixed-length segments for analysis.
 * Returns evenly spaced segments across the full video duration.
 */
export async function splitIntoSegments(
  inputPath: string,
  segmentLength = 10,
  maxSegments = 20
): Promise<SceneSegment[]> {
  const totalDuration = await getVideoDuration(inputPath);
  console.log(`[FFmpeg] Video duration: ${totalDuration}s, splitting into ${segmentLength}s segments`);

  const segments: SceneSegment[] = [];
  let start = 0;
  let index = 0;

  while (start + segmentLength <= totalDuration) {
    segments.push({
      index,
      start,
      end: start + segmentLength,
      duration: segmentLength,
    });
    start += segmentLength;
    index++;
  }

  // Add final partial segment if > 3 seconds
  if (totalDuration - start > 3) {
    segments.push({
      index,
      start,
      end: totalDuration,
      duration: totalDuration - start,
    });
  }

  // If too many segments, sample evenly
  if (segments.length > maxSegments) {
    const step = segments.length / maxSegments;
    const sampled: SceneSegment[] = [];
    for (let i = 0; i < maxSegments; i++) {
      sampled.push(segments[Math.floor(i * step)]);
    }
    console.log(`[FFmpeg] Sampled ${sampled.length} of ${segments.length} segments`);
    return sampled;
  }

  console.log(`[FFmpeg] Created ${segments.length} segments`);
  return segments;
}

/**
 * Extract multiple clips from a video at once.
 * Returns array of { segment, filePath }.
 */
export async function extractSegments(
  inputPath: string,
  segments: SceneSegment[],
  outputDir: string,
  maxClips = 15
): Promise<{ segment: SceneSegment; filePath: string }[]> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Take evenly spaced segments if there are too many
  let selected = segments;
  if (segments.length > maxClips) {
    const step = segments.length / maxClips;
    selected = [];
    for (let i = 0; i < maxClips; i++) {
      selected.push(segments[Math.floor(i * step)]);
    }
  }

  const results: { segment: SceneSegment; filePath: string }[] = [];

  for (const seg of selected) {
    const filename = `clip_${seg.index}_${Math.round(seg.start)}s.mp4`;
    const outputPath = path.join(outputDir, filename);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(inputPath)
        .setStartTime(seg.start)
        .setDuration(seg.duration)
        .output(outputPath)
        .outputOptions(["-c:v", "libx264", "-c:a", "aac", "-movflags", "+faststart", "-preset", "ultrafast"])
        .on("end", () => resolve())
        .on("error", (err: Error) => reject(err))
        .run();
    });

    results.push({ segment: seg, filePath: outputPath });
  }

  return results;
}
