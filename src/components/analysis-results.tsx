"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
  resolvePlayers,
  resolveTeams,
  type Analysis,
  type FeedbackBundle,
  type PlayerFeedback,
  type TeamFeedback,
} from "@/lib/types";

type ScopeKey = `team:${string}` | `player:${string}`;

function FeedbackBody({
  label,
  meta,
  bundle,
}: {
  label: string;
  meta?: string;
  bundle: FeedbackBundle;
}) {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="mb-4 flex flex-wrap items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/70">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
              />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold">{label}</h3>
            {meta && (
              <p className="font-mono text-[10px] uppercase tracking-wider text-white/40">{meta}</p>
            )}
          </div>
        </div>
        <p className="leading-relaxed text-white/60">
          {bundle.summary || "No summary for this scope yet."}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold">Strengths</h3>
          </div>
          {bundle.strengths.length === 0 ? (
            <p className="text-sm text-white/50">No strengths identified yet.</p>
          ) : (
            <ul className="space-y-4">
              {bundle.strengths.map((s, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4"
                >
                  <p className="text-sm font-semibold">{s.title}</p>
                  <p className="mt-1 text-sm text-white/50">{s.description}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-400">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-bold">Areas to improve</h3>
          </div>
          {bundle.improvements.length === 0 ? (
            <p className="text-sm text-white/50">No improvements identified yet.</p>
          ) : (
            <ul className="space-y-4">
              {bundle.improvements.map((imp, i) => (
                <li
                  key={i}
                  className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4"
                >
                  <p className="text-sm font-semibold">{imp.title}</p>
                  <p className="mt-1 text-sm text-white/50">{imp.description}</p>
                  {imp.drill && (
                    <div className="mt-2 flex items-start gap-1.5">
                      <Badge
                        variant="secondary"
                        className="shrink-0 border-0 bg-amber-500/15 text-xs text-amber-400"
                      >
                        Drill
                      </Badge>
                      <p className="text-sm text-white/50">{imp.drill}</p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function ScopeChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-sm transition-all ${
        active
          ? "border-emerald-500/40 bg-emerald-500/15 font-semibold text-emerald-300"
          : "border-white/10 bg-white/[0.03] text-white/50 hover:border-white/20 hover:text-white"
      }`}
    >
      {children}
    </button>
  );
}

export function AnalysisResults({ analysis }: { analysis: Analysis }) {
  const teams = useMemo(() => resolveTeams(analysis), [analysis]);
  const players = useMemo(() => resolvePlayers(analysis), [analysis]);

  const defaultKey: ScopeKey =
    teams.length > 0
      ? `team:${teams[0].id}`
      : players.length > 0
        ? `player:${players[0].id}`
        : "team:team";

  const [scopeKey, setScopeKey] = useState<ScopeKey>(defaultKey);

  useEffect(() => {
    setScopeKey(defaultKey);
  }, [defaultKey]);

  const activeTeam: TeamFeedback | undefined = scopeKey.startsWith("team:")
    ? (teams.find((t) => `team:${t.id}` === scopeKey) ?? teams[0])
    : undefined;

  const activePlayer: PlayerFeedback | undefined = scopeKey.startsWith("player:")
    ? players.find((p) => `player:${p.id}` === scopeKey)
    : undefined;

  const bundle: FeedbackBundle =
    activePlayer ??
    activeTeam ?? {
      summary: analysis.summary,
      strengths: analysis.strengths,
      improvements: analysis.improvements,
    };

  const label = activePlayer?.name ?? activeTeam?.name ?? "Team";
  const meta = activePlayer
    ? [activePlayer.jersey ? `#${activePlayer.jersey}` : null, activePlayer.position]
        .filter(Boolean)
        .join(" · ") || "Player"
    : activeTeam?.side
      ? activeTeam.side
      : "Team";

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-white/40">
          View feedback for
        </p>
        <div className="flex flex-wrap gap-2">
          {teams.map((team) => (
            <ScopeChip
              key={team.id}
              active={scopeKey === `team:${team.id}`}
              onClick={() => setScopeKey(`team:${team.id}`)}
            >
              {team.name}
            </ScopeChip>
          ))}
          {players.map((player) => (
            <ScopeChip
              key={player.id}
              active={scopeKey === `player:${player.id}`}
              onClick={() => setScopeKey(`player:${player.id}`)}
            >
              {player.name}
            </ScopeChip>
          ))}
        </div>
        {players.length === 0 && teams.length <= 1 && (
          <p className="mt-3 text-xs text-white/35">
            Re-analyze this tape to pull per-player notes and both sides of the match.
          </p>
        )}
      </div>

      <FeedbackBody label={label} meta={meta} bundle={bundle} />
    </div>
  );
}
