import ffmpeg from "fluent-ffmpeg";
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
