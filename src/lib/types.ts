export type UserRole = "player" | "coach";

export interface Profile {
  id: string;
  user_id: string;
  name: string;
  role: UserRole;
  team_name: string | null;
  position: string | null;
  graduation_year: number | null;
  created_at: string;
}

export type VideoStatus = "uploading" | "processing" | "ready" | "failed";

export interface Video {
  id: string;
  user_id: string;
  title: string;
  storage_path: string;
  duration_seconds: number | null;
  status: VideoStatus;
  created_at: string;
}

export interface HighlightMoment {
  label: string;
  start_time: number;
  end_time: number;
  description: string;
  player_feedback: string;
}

export interface StrengthItem {
  title: string;
  description: string;
}

export interface ImprovementItem {
  title: string;
  description: string;
  drill: string;
}

/** Shared coaching notes for a team or a single player */
export interface FeedbackBundle {
  summary: string;
  strengths: StrengthItem[];
  improvements: ImprovementItem[];
}

export interface TeamFeedback extends FeedbackBundle {
  id: string;
  name: string;
  /** home | away | unidentified */
  side?: string;
}

export interface PlayerFeedback extends FeedbackBundle {
  id: string;
  name: string;
  jersey?: string;
  position?: string;
  /** Links to TeamFeedback.id when known */
  team_id?: string;
}

export interface Analysis {
  id: string;
  video_id: string;
  summary: string;
  strengths: StrengthItem[];
  improvements: ImprovementItem[];
  highlights: HighlightMoment[];
  /** Per-team coaching notes (both sides when visible in film) */
  teams?: TeamFeedback[];
  /** Per-player coaching notes */
  players?: PlayerFeedback[];
  raw_response: Record<string, unknown>;
  created_at: string;
}

export interface Clip {
  id: string;
  video_id: string;
  analysis_id: string | null;
  label: string;
  start_time: number;
  end_time: number;
  storage_path: string | null;
  description: string;
  player_feedback: string;
  created_at: string;
}

export interface HighlightReel {
  id: string;
  user_id: string;
  title: string;
  clip_ids: string[];
  share_token: string;
  created_at: string;
}

export interface AnalysisResponse {
  summary: string;
  strengths: StrengthItem[];
  improvements: ImprovementItem[];
  teams?: TeamFeedback[];
  players?: PlayerFeedback[];
  highlights?: HighlightMoment[];
}

export type FeedbackScope =
  | { kind: "team"; team: TeamFeedback }
  | { kind: "player"; player: PlayerFeedback };

/** Normalize DB rows + legacy analyses into team/player scopes */
export function resolvePlayers(analysis: Analysis | null | undefined): PlayerFeedback[] {
  if (!analysis) return [];
  if (Array.isArray(analysis.players) && analysis.players.length > 0) {
    return analysis.players;
  }
  const raw = analysis.raw_response?.players;
  return Array.isArray(raw) ? (raw as PlayerFeedback[]) : [];
}

export function resolveTeams(analysis: Analysis | null | undefined): TeamFeedback[] {
  if (!analysis) return [];
  if (Array.isArray(analysis.teams) && analysis.teams.length > 0) {
    return analysis.teams;
  }
  const raw = analysis.raw_response?.teams;
  if (Array.isArray(raw) && raw.length > 0) {
    return raw as TeamFeedback[];
  }
  // Legacy: treat top-level notes as a single "Team" scope
  if (analysis.summary || analysis.strengths?.length || analysis.improvements?.length) {
    return [
      {
        id: "team",
        name: "Team",
        side: "overall",
        summary: analysis.summary || "",
        strengths: analysis.strengths || [],
        improvements: analysis.improvements || [],
      },
    ];
  }
  return [];
}

export function getFeedbackBundle(scope: FeedbackScope): FeedbackBundle {
  return scope.kind === "team" ? scope.team : scope.player;
}
