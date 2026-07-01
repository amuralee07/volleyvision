"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "How does VolleyVision analyze volleyball footage?",
    a: "VolleyVision uses AI to watch every rally in your video — tracking technique, positioning, and key moments. Upload a match or practice clip and get coaching feedback, drill recommendations, and timestamped highlights automatically.",
  },
  {
    q: "What video formats are supported?",
    a: "You can upload MP4, MOV, and other common formats up to 2GB, or import directly from YouTube. Videos up to one hour in length are supported.",
  },
  {
    q: "How quickly are results available?",
    a: "Most practice and match clips are analyzed in a few minutes. Longer footage may take a bit longer — you'll see results appear on your dashboard as soon as processing completes.",
  },
  {
    q: "Can I share highlights with college coaches?",
    a: "Yes. Extract individual clips from your analysis, build highlight reels, and generate a public share link that anyone can view without signing in.",
  },
];

export function LandingFaq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-white/10 border border-white/10 rounded-2xl overflow-hidden">
      {FAQS.map((faq, i) => (
        <div key={i} className="bg-white/[0.02]">
          <button
            className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-white/[0.03]"
            onClick={() => setOpen(open === i ? null : i)}
          >
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm text-white/30">{String(i + 1).padStart(2, "0")}</span>
              <span className="font-medium text-white/90">{faq.q}</span>
            </div>
            <span className="shrink-0 text-xl text-white/40">{open === i ? "−" : "+"}</span>
          </button>
          {open === i && (
            <div className="border-t border-white/5 px-6 py-4 pl-14">
              <p className="text-sm leading-relaxed text-white/50">{faq.a}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
