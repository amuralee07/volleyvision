import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

const ANALYSIS_PROMPT = `You are an expert volleyball coach analyzing game footage.

Analyze this volleyball video and provide coaching feedback.

Return a JSON object:
{
  "summary": "2-3 sentence overall assessment of the play",
  "strengths": [
    { "title": "Short title", "description": "What is done well, reference specific plays you see" }
  ],
  "improvements": [
    { "title": "Short title", "description": "What to improve", "drill": "A specific drill to practice" }
  ]
}

FOCUS: Serving, hitting approach, blocking, defense, setting, court awareness, transitions.
Keep descriptions concise. Be specific — reference what you actually see in the footage.`;

function buildClipLabelPrompt(clipDescriptions: string) {
  return `You are a volleyball analyst. I have extracted ${clipDescriptions.split("\n").length} video clips from a volleyball game using scene detection.

For each clip, tell me:
1. Is this clip a notable volleyball play (rally, spike, block, ace, dig, save, serve, kill) or is it just filler (replays, scoreboards, crowd shots, transitions, celebrations)?
2. If it IS a notable play, label it and describe it.

Return a JSON object:
{
  "clips": [
    {
      "index": 0,
      "is_highlight": true,
      "label": "Spike",
      "description": "Player #7 approaches from the left and hits a powerful cross-court spike",
      "player_feedback": "Good approach timing, consider aiming more to the line"
    },
    {
      "index": 1,
      "is_highlight": false,
      "label": "",
      "description": "",
      "player_feedback": ""
    }
  ]
}

Here are the clips (by index):
${clipDescriptions}

Only mark clips as highlights if they show actual gameplay. Be selective — pick the best 5-10 plays.`;
}

function robustJsonParse(text: string) {
  // Attempt 1: direct parse
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("[Gemini] Direct parse failed:", (e as Error).message);
  }

  // Attempt 2: fix common issues
  try {
    const fixed = text
      .replace(/,\s*}/g, "}")
      .replace(/,\s*]/g, "]")
      .replace(/[\x00-\x1f]/g, (ch) => {
        if (ch === "\n") return "\\n";
        if (ch === "\r") return "\\r";
        if (ch === "\t") return "\\t";
        return "";
      });
    return JSON.parse(fixed);
  } catch {
    console.error("[Gemini] Fixed parse failed");
  }

  // Attempt 3: extract each field individually with regex
  console.log("[Gemini] Attempting field-by-field extraction");
  const result: Record<string, unknown> = {
    summary: "",
    strengths: [],
    improvements: [],
    highlights: [],
  };

  // Extract summary
  const summaryMatch = text.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (summaryMatch) result.summary = summaryMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n");

  // Extract arrays by finding balanced brackets
  for (const field of ["strengths", "improvements", "highlights"] as const) {
    const fieldIdx = text.indexOf(`"${field}"`);
    if (fieldIdx === -1) continue;
    const bracketStart = text.indexOf("[", fieldIdx);
    if (bracketStart === -1) continue;

    let depth = 0;
    let bracketEnd = -1;
    for (let i = bracketStart; i < text.length; i++) {
      if (text[i] === "[") depth++;
      else if (text[i] === "]") {
        depth--;
        if (depth === 0) { bracketEnd = i; break; }
      }
    }

    if (bracketEnd !== -1) {
      const arrayStr = text.slice(bracketStart, bracketEnd + 1)
        .replace(/,\s*}/g, "}")
        .replace(/,\s*]/g, "]")
        .replace(/[\x00-\x1f]/g, (ch) => {
          if (ch === "\n") return "\\n";
          if (ch === "\r") return "\\r";
          if (ch === "\t") return "\\t";
          return "";
        });
      try {
        result[field] = JSON.parse(arrayStr);
      } catch {
        console.error(`[Gemini] Could not parse ${field} array`);
      }
    }
  }

  console.log("[Gemini] Field extraction done");
  return result;
}

export async function analyzeVideo(fileUri: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          { fileData: { fileUri, mimeType } },
          { text: ANALYSIS_PROMPT },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
    },
  });

  const text = response.text ?? "";
  console.log("[Gemini] Analysis response length:", text.length, "finish:", response.candidates?.[0]?.finishReason);

  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = robustJsonParse(cleaned);
  console.log("[Gemini] Analysis — strengths:", parsed.strengths?.length, "improvements:", parsed.improvements?.length);
  return parsed;
}

export interface ClipLabel {
  index: number;
  is_highlight: boolean;
  label: string;
  description: string;
  player_feedback: string;
}

export async function labelClips(
  clipFiles: { index: number; filePath: string }[]
): Promise<ClipLabel[]> {
  // Upload all clips to Gemini
  const uploadedParts: { fileData: { fileUri: string; mimeType: string } }[] = [];
  const descriptions: string[] = [];

  for (const clip of clipFiles) {
    const file = await uploadVideoToGemini(clip.filePath, "video/mp4");
    if (!file.uri) continue;

    if (file.name && file.state === "PROCESSING") {
      await waitForFileReady(file.name);
    }

    uploadedParts.push({ fileData: { fileUri: file.uri, mimeType: "video/mp4" } });
    descriptions.push(`Clip ${clip.index}: (see attached video ${uploadedParts.length})`);
  }

  const prompt = buildClipLabelPrompt(descriptions.join("\n"));

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: [
      {
        role: "user",
        parts: [
          ...uploadedParts,
          { text: prompt },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
    },
  });

  const text = response.text ?? "";
  console.log("[Gemini] Clip labeling response length:", text.length, "finish:", response.candidates?.[0]?.finishReason);

  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = robustJsonParse(cleaned);

  return (parsed.clips || []) as ClipLabel[];
}

export async function uploadVideoToGemini(filePath: string, mimeType: string) {
  const fs = await import("fs/promises");
  const buffer = await fs.readFile(filePath);
  const blob = new Blob([buffer], { type: mimeType });
  const file = await ai.files.upload({
    file: blob,
    config: { mimeType },
  });
  return file;
}

export async function waitForFileReady(fileName: string, maxWaitMs = 120_000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    const file = await ai.files.get({ name: fileName });
    if (file.state === "ACTIVE") return file;
    if (file.state === "FAILED") throw new Error("Gemini file processing failed");
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Timed out waiting for Gemini to process the video");
}
