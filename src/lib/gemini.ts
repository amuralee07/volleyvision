import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

const VOLLEYBALL_ANALYSIS_PROMPT = `You are an expert volleyball coach and analyst. Analyze this volleyball game footage carefully.

Return ONLY a valid JSON response (no markdown, no code fences) with this exact structure:
{
  "summary": "A 2-3 sentence overall assessment of the play shown",
  "strengths": [
    {
      "title": "Short title for the strength",
      "description": "Detailed description of what's being done well"
    }
  ],
  "improvements": [
    {
      "title": "Short title for improvement area",
      "description": "What needs to be improved and why",
      "drill": "A specific drill or exercise to help improve this area"
    }
  ],
  "highlights": [
    {
      "label": "Type of play (spike, block, ace, dig, serve, rally, set, save, etc.)",
      "start_time": 0,
      "end_time": 5,
      "description": "What happened and why it's notable",
      "player_feedback": "Specific coaching tip for the player in this moment"
    }
  ]
}

Focus your analysis on:
- Serving technique (toss placement, contact point, follow-through)
- Hitting approach (footwork, timing, arm swing, shot selection)
- Blocking timing and positioning (hands, footwork, reading the setter)
- Defensive positioning and platform angles
- Setting accuracy and decision-making
- Court awareness and communication
- Transition movements

For highlights, identify the most notable moments with accurate timestamps in seconds.
Provide at least 3-5 highlights if the footage is long enough.
Be specific and actionable in your feedback.`;

export async function analyzeVideo(fileUri: string, mimeType: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        role: "user",
        parts: [
          { fileData: { fileUri, mimeType } },
          { text: VOLLEYBALL_ANALYSIS_PROMPT },
        ],
      },
    ],
  });

  const text = response.text ?? "";
  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  return JSON.parse(cleaned);
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
