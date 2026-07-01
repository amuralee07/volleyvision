"use client";

import { useEffect, useState } from "react";

const PLAYS = [
  { tag: "Cross-Court Spike", time: "02:14", color: "border-red-400/40 bg-red-400/10 text-red-300" },
  { tag: "Triple Block", time: "04:32", color: "border-blue-400/40 bg-blue-400/10 text-blue-300" },
  { tag: "Float Serve Ace", time: "06:08", color: "border-emerald-400/40 bg-emerald-400/10 text-emerald-300" },
  { tag: "Back-Row Attack", time: "07:41", color: "border-amber-400/40 bg-amber-400/10 text-amber-300" },
];

export function LandingFilmTags() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setActive((a) => (a + 1) % PLAYS.length), 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0a0a0f] p-5">
      <div className="mb-4 flex items-center justify-between">
        <span className="font-mono text-[10px] uppercase tracking-widest text-white/40">Film Analysis</span>
        <span className="font-mono text-[10px] text-emerald-400/70">4 plays tagged</span>
      </div>
      <div className="space-y-2">
        {PLAYS.map((play, i) => (
          <div
            key={play.tag}
            className={`flex items-center justify-between rounded-lg border px-4 py-3 transition-all duration-500 ${
              i === active
                ? `${play.color} scale-[1.02] shadow-lg`
                : "border-white/5 bg-white/[0.02] text-white/40"
            }`}
          >
            <span className={`text-sm font-medium ${i === active ? "" : "text-white/50"}`}>{play.tag}</span>
            <span className="font-mono text-xs">{play.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
