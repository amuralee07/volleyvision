import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY! });

const ANALYSIS_PROMPT = `You are an expert volleyball coach analyzing game or practice film.

Analyze this volleyball video and return coaching feedback for BOTH teams when two sides are visible, plus notable individual players.

Return a JSON object with this exact shape:
{
  "summary": "2-3 sentence overview of the film (match or practice)",
  "strengths": [
    { "title": "Short title", "description": "Team-level strength visible in the tape" }
  ],
  "improvements": [
    { "title": "Short title", "description": "Team-level area to fix", "drill": "A specific drill" }
  ],
  "teams": [
    {
      "id": "team_a",
      "name": "Dark jerseys",
      "side": "left",
      "summary": "2 sentences on this team's play",
      "strengths": [
        { "title": "Short title", "description": "What this team does well" }
      ],
      "improvements": [
        { "title": "Short title", "description": "What this team should fix", "drill": "A specific drill" }
      ]
    },
    {
      "id": "team_b",
      "name": "White jerseys",
      "side": "right",
      "summary": "2 sentences on this team's play",
      "strengths": [
        { "title": "Short title", "description": "What this team does well" }
      ],
      "improvements": [
        { "title": "Short title", "description": "What this team should fix", "drill": "A specific drill" }
      ]
    }
  ],
  "players": [
    {
      "id": "p1",
      "name": "#7 Outside",
      "jersey": "7",
      "position": "OH",
      "team_id": "team_a",
      "summary": "1-2 sentences on this player",
      "strengths": [
        { "title": "Short title", "description": "Player-specific strength" }
      ],
      "improvements": [
        { "title": "Short title", "description": "Player-specific fix", "drill": "A specific drill" }
      ]
    }
  ]
}

Rules:
- Top-level summary/strengths/improvements = overall film notes (can mirror the primary team or both sides).
- Always include 1-2 teams when sides are distinguishable (use jersey color, court side, or "Home"/"Away" if names are unknown).
- If only one team/practice squad is clear, return a single team object.
- Include 2-5 notable players you can actually see — use jersey numbers when visible.
- Link each player to a team_id when possible.
- Be specific to the footage. Keep titles short. FOCUS: serving, approach, blocking, defense, setting, transitions.
`;

function buildClipLabelPrompt(clipDescriptions: string) {
  return `You are a volleyball analyst. I have extracted ${clipDescriptions.split("\n").length} video clips from a volleyball game using scene detection.

For each clip, tell me:
1. Is this clip a notable volleyball play (rally, spike, block, ace, dig, save, serve, kill) or is it just filler (replays, scoreboards, crowd shots, transitions, celebrations)?
2. If it IS a notable play, label it and describe it. Note jersey/player if visible.

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
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("[Gemini] Direct parse failed:", (e as Error).message);
  }

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

  console.log("[Gemini] Attempting field-by-field extraction");
  const result: Record<string, unknown> = {
    summary: "",
    strengths: [],
    improvements: [],
    teams: [],
    players: [],
    highlights: [],
  };

  const summaryMatch = text.match(/"summary"\s*:\s*"((?:[^"\\]|\\.)*)"/);
  if (summaryMatch) result.summary = summaryMatch[1].replace(/\\"/g, '"').replace(/\\n/g, "\n");

  for (const field of ["strengths", "improvements", "teams", "players", "highlights"] as const) {
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
        if (depth === 0) {
          bracketEnd = i;
          break;
        }
      }
    }

    if (bracketEnd !== -1) {
      const arrayStr = text
        .slice(bracketStart, bracketEnd + 1)
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

function normalizeFeedbackItem(item: Record<string, unknown>) {
  return {
    title: String(item.title ?? ""),
    description: String(item.description ?? ""),
    ...(item.drill !== undefined ? { drill: String(item.drill ?? "") } : {}),
  };
}

function normalizeAnalysisResult(parsed: Record<string, unknown>) {
  const strengths = Array.isArray(parsed.strengths)
    ? parsed.strengths.map((s) => normalizeFeedbackItem(s as Record<string, unknown>))
    : [];
  const improvements = Array.isArray(parsed.improvements)
    ? parsed.improvements.map((s) => ({
        ...normalizeFeedbackItem(s as Record<string, unknown>),
        drill: String((s as Record<string, unknown>).drill ?? ""),
      }))
    : [];

  const teams = Array.isArray(parsed.teams)
    ? parsed.teams.map((t, i) => {
        const team = t as Record<string, unknown>;
        return {
          id: String(team.id ?? `team_${i + 1}`),
          name: String(team.name ?? `Team ${i + 1}`),
          side: team.side ? String(team.side) : undefined,
          summary: String(team.summary ?? ""),
          strengths: Array.isArray(team.strengths)
            ? team.strengths.map((s) => normalizeFeedbackItem(s as Record<string, unknown>))
            : [],
          improvements: Array.isArray(team.improvements)
            ? team.improvements.map((s) => ({
                ...normalizeFeedbackItem(s as Record<string, unknown>),
                drill: String((s as Record<string, unknown>).drill ?? ""),
              }))
            : [],
        };
      })
    : [];

  const players = Array.isArray(parsed.players)
    ? parsed.players.map((p, i) => {
        const player = p as Record<string, unknown>;
        return {
          id: String(player.id ?? `player_${i + 1}`),
          name: String(player.name ?? `Player ${i + 1}`),
          jersey: player.jersey ? String(player.jersey) : undefined,
          position: player.position ? String(player.position) : undefined,
          team_id: player.team_id ? String(player.team_id) : undefined,
          summary: String(player.summary ?? ""),
          strengths: Array.isArray(player.strengths)
            ? player.strengths.map((s) => normalizeFeedbackItem(s as Record<string, unknown>))
            : [],
          improvements: Array.isArray(player.improvements)
            ? player.improvements.map((s) => ({
                ...normalizeFeedbackItem(s as Record<string, unknown>),
                drill: String((s as Record<string, unknown>).drill ?? ""),
              }))
            : [],
        };
      })
    : [];

  if (teams.length === 0 && (parsed.summary || strengths.length || improvements.length)) {
    teams.push({
      id: "team",
      name: "Team",
      side: "overall",
      summary: String(parsed.summary ?? ""),
      strengths,
      improvements,
    });
  }

  return {
    summary: String(parsed.summary ?? ""),
    strengths,
    improvements,
    teams,
    players,
    highlights: Array.isArray(parsed.highlights) ? parsed.highlights : [],
  };
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
      maxOutputTokens: 8192,
    },
  });

  const text = response.text ?? "";
  console.log(
    "[Gemini] Analysis response length:",
    text.length,
    "finish:",
    response.candidates?.[0]?.finishReason
  );

  const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const parsed = robustJsonParse(cleaned) as Record<string, unknown>;
  const normalized = normalizeAnalysisResult(parsed);
  console.log(
    "[Gemini] Analysis — teams:",
    normalized.teams.length,
    "players:",
    normalized.players.length,
    "strengths:",
    normalized.strengths.length
  );
  return normalized;
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
        parts: [...uploadedParts, { text: prompt }],
      },
    ],
    config: {
      responseMimeType: "application/json",
      maxOutputTokens: 4096,
    },
  });

  const text = response.text ?? "";
  console.log(
    "[Gemini] Clip labeling response length:",
    text.length,
    "finish:",
    response.candidates?.[0]?.finishReason
  );

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
