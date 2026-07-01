/** Analysis keyframes synced to public/demo/volleyball.mp4 */

export const DEMO_VIDEO_DURATION = 18.92;
export const DEMO_PLAYBACK_RATE = 2;

export type PlayerId = 3 | 5 | 7 | 8 | 12 | 14 | 21;

export const ALL_PLAYER_IDS: PlayerId[] = [12, 7, 3, 5, 8, 14, 21];

export const PLAYER_META: Record<PlayerId, { color: string; role: string; label: string }> = {
  12: { color: "#34d399", role: "Outside Hitter", label: "Outside Hitter" },
  7: { color: "#60a5fa", role: "Setter", label: "Setter" },
  3: { color: "#f97316", role: "Middle Blocker", label: "Middle Blocker" },
  5: { color: "#c084fc", role: "Libero", label: "Libero" },
  8: { color: "#94a3b8", role: "Opposite Hitter", label: "Opposite Hitter" },
  14: { color: "#fbbf24", role: "Defender", label: "Defender" },
  21: { color: "#f472b6", role: "Back Row", label: "Back Row" },
};

export interface BoxState {
  left: number;
  top: number;
  width: number;
  height: number;
}

type PlayerBoxes = Record<PlayerId, BoxState>;

interface TrackingKeyframe {
  time: number;
  boxes: PlayerBoxes;
}

interface AnalysisKeyframe {
  time: number;
  playerId: PlayerId;
  action: string;
  x: number;
  y: number;
  vel: string;
  metric: string;
  metricLabel: string;
}

const TRACKING_KEYFRAMES: TrackingKeyframe[] = [
  {
    time: 0,
    boxes: {
      12: { left: 35, top: 41, width: 10, height: 44 },
      7: { left: 37, top: 39, width: 9, height: 42 },
      21: { left: 43, top: 53, width: 8, height: 36 },
      14: { left: 57, top: 47, width: 9, height: 40 },
      3: { left: 71, top: 43, width: 10, height: 42 },
      5: { left: 27, top: 31, width: 9, height: 38 },
      8: { left: 47, top: 27, width: 9, height: 40 },
    },
  },
  {
    time: 4.5,
    boxes: {
      12: { left: 36, top: 40, width: 10, height: 44 },
      7: { left: 38, top: 38, width: 9, height: 42 },
      21: { left: 43, top: 52, width: 8, height: 36 },
      14: { left: 58, top: 46, width: 9, height: 40 },
      3: { left: 70, top: 41, width: 10, height: 44 },
      5: { left: 29, top: 34, width: 12, height: 30 },
      8: { left: 45, top: 29, width: 9, height: 40 },
    },
  },
  {
    time: 8.8,
    boxes: {
      12: { left: 24, top: 39, width: 10, height: 46 },
      7: { left: 43, top: 30, width: 10, height: 50 },
      21: { left: 41, top: 55, width: 8, height: 34 },
      14: { left: 57, top: 47, width: 9, height: 40 },
      3: { left: 65, top: 39, width: 10, height: 44 },
      5: { left: 25, top: 33, width: 9, height: 36 },
      8: { left: 54, top: 28, width: 9, height: 40 },
    },
  },
  {
    time: 12.8,
    boxes: {
      12: { left: 22, top: 34, width: 11, height: 50 },
      7: { left: 42, top: 36, width: 9, height: 44 },
      21: { left: 40, top: 54, width: 8, height: 34 },
      14: { left: 56, top: 45, width: 9, height: 40 },
      3: { left: 64, top: 36, width: 10, height: 46 },
      5: { left: 24, top: 32, width: 9, height: 36 },
      8: { left: 52, top: 30, width: 9, height: 40 },
    },
  },
  {
    time: 15.2,
    boxes: {
      12: { left: 20, top: 24, width: 12, height: 56 },
      7: { left: 42, top: 30, width: 10, height: 48 },
      21: { left: 39, top: 51, width: 8, height: 36 },
      14: { left: 53, top: 43, width: 9, height: 40 },
      3: { left: 49, top: 26, width: 11, height: 54 },
      5: { left: 23, top: 31, width: 9, height: 38 },
      8: { left: 60, top: 36, width: 9, height: 42 },
    },
  },
  {
    time: 18.5,
    boxes: {
      12: { left: 34, top: 40, width: 10, height: 44 },
      7: { left: 36, top: 38, width: 9, height: 42 },
      21: { left: 42, top: 52, width: 8, height: 36 },
      14: { left: 56, top: 46, width: 9, height: 40 },
      3: { left: 70, top: 42, width: 10, height: 42 },
      5: { left: 26, top: 30, width: 9, height: 38 },
      8: { left: 46, top: 26, width: 9, height: 40 },
    },
  },
];

/** Timestamps matched to rally in demo clip (dig ~4s, set ~9s, block/spike ~14s). */
const ANALYSIS_KEYFRAMES: AnalysisKeyframe[] = [
  { time: 0, playerId: 7, action: "READY STANCE", x: 210, y: 172, vel: "0.2 m/s", metric: "—", metricLabel: "Contact Timing" },
  { time: 2.2, playerId: 5, action: "BALL INCOMING", x: 228, y: 168, vel: "4.8 m/s", metric: "1.2s", metricLabel: "Time to Net" },
  { time: 4.2, playerId: 5, action: "DIG", x: 312, y: 155, vel: "3.2 m/s", metric: "0.38s", metricLabel: "Reaction Time" },
  { time: 6.2, playerId: 7, action: "READING PLAY", x: 252, y: 155, vel: "1.4 m/s", metric: "Zone 4", metricLabel: "Set Option" },
  { time: 8.5, playerId: 7, action: "SET", x: 248, y: 142, vel: "2.4 m/s", metric: "0.6m", metricLabel: "Set Height" },
  { time: 12.5, playerId: 8, action: "APPROACHING", x: 264, y: 145, vel: "2.8 m/s", metric: "4-step", metricLabel: "Approach" },
  { time: 14.2, playerId: 8, action: "SPIKE", x: 282, y: 130, vel: "18.4 m/s", metric: "Line", metricLabel: "Shot Angle" },
  { time: 16.0, playerId: 8, action: "FOLLOW THROUGH", x: 274, y: 146, vel: "2.2 m/s", metric: "Cross", metricLabel: "Shot Angle" },
  { time: 17.8, playerId: 7, action: "RESET", x: 218, y: 170, vel: "0.3 m/s", metric: "—", metricLabel: "Contact Timing" },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function lerpBox(a: BoxState, b: BoxState, t: number): BoxState {
  return {
    left: lerp(a.left, b.left, t),
    top: lerp(a.top, b.top, t),
    width: lerp(a.width, b.width, t),
    height: lerp(a.height, b.height, t),
  };
}

function getSegment<T extends { time: number }>(frames: T[], t: number) {
  let i = 0;
  for (let j = 0; j < frames.length; j++) {
    if (t >= frames[j].time) i = j;
  }
  const curr = frames[i];
  const next = frames[(i + 1) % frames.length];
  const prev = frames[(i - 1 + frames.length) % frames.length];

  let span = next.time - curr.time;
  if (span <= 0) span += DEMO_VIDEO_DURATION;

  let alpha = (t - curr.time) / span;
  if (alpha < 0) alpha += DEMO_VIDEO_DURATION / span;
  alpha = Math.min(1, Math.max(0, alpha));

  return { curr, next, prev, alpha };
}

export function getAnalysisAtTime(time: number) {
  const t = ((time % DEMO_VIDEO_DURATION) + DEMO_VIDEO_DURATION) % DEMO_VIDEO_DURATION;

  const track = getSegment(TRACKING_KEYFRAMES, t);
  const boxes = {} as PlayerBoxes;
  for (const id of ALL_PLAYER_IDS) {
    boxes[id] = lerpBox(track.curr.boxes[id], track.next.boxes[id], track.alpha);
  }

  const analysis = getSegment(ANALYSIS_KEYFRAMES, t);
  const playerId = analysis.curr.playerId;
  const meta = PLAYER_META[playerId];

  return {
    playerId,
    role: meta.role,
    color: meta.color,
    playerCount: ALL_PLAYER_IDS.length,
    action: analysis.curr.action,
    x: Math.round(lerp(analysis.curr.x, analysis.next.x, analysis.alpha)),
    y: Math.round(lerp(analysis.curr.y, analysis.next.y, analysis.alpha)),
    vel: analysis.curr.vel,
    metric: analysis.curr.metric,
    metricLabel: analysis.curr.metricLabel,
    prev: { x: analysis.prev.x, y: analysis.prev.y },
    next: { x: analysis.next.x, y: analysis.next.y },
    boxes,
  };
}
