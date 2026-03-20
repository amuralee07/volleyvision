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

export interface Analysis {
  id: string;
  video_id: string;
  summary: string;
  strengths: StrengthItem[];
  improvements: ImprovementItem[];
  highlights: HighlightMoment[];
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
  storage_path: string;
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
  highlights: HighlightMoment[];
}
