"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const STEPS = [
  {
    id: "upload",
    label: "Upload",
    title: "Drop in match film",
    blurb: "A practice or game clip lands in the film room — title it and you’re set.",
  },
  {
    id: "analyze",
    label: "Analyze",
    title: "Tape gets broken down",
    blurb: "Approach, positioning, and key moments are tagged through every rally.",
  },
  {
    id: "feedback",
    label: "Feedback",
    title: "Notes you can run in practice",
    blurb: "Strengths, drills, and clips ready to send to coaches or scouts.",
  },
] as const;

function UploadStage({ playing }: { playing: boolean }) {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!playing) {
      setProgress(0);
      setDone(false);
      return;
    }
    setProgress(0);
    setDone(false);
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id);
          setDone(true);
          return 100;
        }
        return p + 4;
      });
    }, 45);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07070c] p-5 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(52,211,153,0.1),transparent_55%)]" />
      <div className="relative">
        <div
          className={`rounded-xl border-2 border-dashed p-8 text-center transition-all ${
            done
              ? "border-emerald-400/40 bg-emerald-500/10"
              : progress > 0
                ? "border-emerald-400/30 bg-emerald-500/[0.06]"
                : "border-white/10 bg-white/[0.02]"
          }`}
        >
          <div
            className={`mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl transition-all ${
              done
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-white/5 text-white/50"
            } ${playing && !done ? "animate-pulse" : ""}`}
          >
            {done ? (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            ) : (
              <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                />
              </svg>
            )}
          </div>
          <p className="font-semibold text-white/90">
            {done ? "varsity-vs-lincoln.mp4" : "Drop your video here"}
          </p>
          <p className="mt-1 text-xs text-white/40">
            {done ? "248 MB · Ready for analysis" : "MP4 · MOV · WebM · up to 2GB"}
          </p>
          {(progress > 0 || done) && (
            <div className="mx-auto mt-5 max-w-xs">
              <div className="mb-1.5 flex justify-between font-mono text-[10px] text-white/40">
                <span>{done ? "Uploaded" : "Uploading…"}</span>
                <span className="text-emerald-400">{progress}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-[width] duration-75"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DEMO_ANALYZE_SRC = "/demo/how-it-works.mp4";

function AnalyzeStage({ playing }: { playing: boolean }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scan, setScan] = useState(0);
  const tags = [
    { label: "Spike", time: "0:04", color: "border-red-400/30 bg-red-400/10 text-red-300" },
    { label: "Dig", time: "0:07", color: "border-amber-400/30 bg-amber-400/10 text-amber-300" },
    { label: "Set", time: "0:09", color: "border-cyan-400/30 bg-cyan-400/10 text-cyan-300" },
  ];

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (playing) {
      el.currentTime = 0;
      void el.play().catch(() => {});
    } else {
      el.pause();
      el.currentTime = 0;
    }
  }, [playing]);

  useEffect(() => {
    if (!playing) {
      setScan(0);
      return;
    }
    setScan(0);
    const id = setInterval(() => setScan((s) => (s + 1) % 100), 40);
    return () => clearInterval(id);
  }, [playing]);

  const visibleTags = playing ? Math.min(3, Math.floor(scan / 28) + 1) : 0;

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#07070c]">
      <div className="relative aspect-[16/9] overflow-hidden bg-black">
        <video
          ref={videoRef}
          src={DEMO_ANALYZE_SRC}
          muted
          playsInline
          loop
          preload="metadata"
          className="absolute inset-0 h-full w-full object-cover opacity-90"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-black/35" />
        <div className="pointer-events-none absolute left-[34%] top-[28%] h-[42%] w-[22%] rounded-md border border-emerald-400/55 shadow-[0_0_24px_rgba(52,211,153,0.3)]" />
        <div className="absolute left-4 top-4 rounded border border-emerald-500/25 bg-black/55 px-2 py-0.5 font-mono text-[10px] text-emerald-400 backdrop-blur-sm">
          ANALYZING
        </div>
        <div className="absolute right-4 top-4 font-mono text-[10px] text-white/50">
          {playing ? `${Math.min(100, scan)}%` : "0%"}
        </div>
        <div
          className="pointer-events-none absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/90 to-transparent shadow-[0_0_14px_rgba(52,211,153,0.85)]"
          style={{ top: `${8 + (scan % 100) * 0.8}%` }}
        />
        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2">
          {tags.slice(0, visibleTags).map((tag) => (
            <span
              key={tag.label}
              className={`animate-in fade-in zoom-in-95 rounded-full border px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider backdrop-blur-sm ${tag.color}`}
            >
              {tag.label} · {tag.time}
            </span>
          ))}
        </div>
      </div>
      <div className="border-t border-white/5 px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <p className="text-xs text-white/50">
            Tracking approach timing · arm swing · decision-making
          </p>
        </div>
      </div>
    </div>
  );
}

function FeedbackStage({ playing }: { playing: boolean }) {
  const [show, setShow] = useState(0);

  useEffect(() => {
    if (!playing) {
      setShow(0);
      return;
    }
    setShow(0);
    const t1 = setTimeout(() => setShow(1), 200);
    const t2 = setTimeout(() => setShow(2), 550);
    const t3 = setTimeout(() => setShow(3), 900);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [playing]);

  return (
    <div className="space-y-3 overflow-hidden rounded-2xl border border-white/10 bg-[#07070c] p-4 sm:p-5">
      <div
        className={`rounded-xl border border-white/10 bg-white/[0.03] p-4 transition-all duration-500 ${
          show >= 1 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        <p className="mb-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-400/70">
          Coach summary
        </p>
        <p className="text-sm leading-relaxed text-white/65">
          Strong outside approach with consistent 4-step rhythm. Block footwork lags on quick
          middle sets — first-step speed is the unlock.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div
          className={`rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 transition-all duration-500 ${
            show >= 2 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-emerald-400/70">
            Strength
          </p>
          <p className="text-sm font-semibold text-white/90">Approach timing</p>
          <p className="mt-1 text-xs text-white/45">
            Clean rhythm on outside sets — keep that plant foot consistent.
          </p>
        </div>
        <div
          className={`rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 transition-all duration-500 ${
            show >= 3 ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
          }`}
        >
          <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-amber-400/70">
            Drill
          </p>
          <p className="text-sm font-semibold text-white/90">Mirror footwork ladder</p>
          <p className="mt-1 text-xs text-white/45">
            3 × 10 — explode on the first lateral step to middle.
          </p>
        </div>
      </div>
    </div>
  );
}

export function FilmHowItWorks() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [autoPlay, setAutoPlay] = useState(true);

  useEffect(() => {
    if (!open) {
      setStep(0);
      setAutoPlay(true);
      return;
    }
    if (!autoPlay) return;
    const id = setInterval(() => {
      setStep((s) => (s < STEPS.length - 1 ? s + 1 : s));
    }, 3200);
    return () => clearInterval(id);
  }, [open, autoPlay]);

  const current = STEPS[step];

  function goTo(index: number) {
    setAutoPlay(false);
    setStep(index);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          <Button
            variant="outline"
            className="rounded-full border-white/15 bg-white/[0.03] px-5 text-white/70 hover:bg-white/5 hover:text-white"
          />
        }
      >
        <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z"
          />
        </svg>
        How it works
      </DialogTrigger>

      <DialogContent
        className="max-h-[90vh] overflow-y-auto border-white/10 bg-[#0a0a0f] p-0 text-white ring-white/10 sm:max-w-xl [&_[data-slot=dialog-close]]:text-white/50 [&_[data-slot=dialog-close]]:hover:bg-white/5 [&_[data-slot=dialog-close]]:hover:text-white"
        showCloseButton
      >
        <div className="border-b border-white/5 px-5 pt-5 pb-4 sm:px-6">
          <DialogHeader>
            <div className="mb-2 flex items-center gap-3">
              <span className="h-px w-5 bg-emerald-400/60" />
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-emerald-400/80">
                Product demo
              </p>
            </div>
            <DialogTitle className="text-xl font-bold tracking-tight sm:text-2xl">
              From upload to coaching notes
            </DialogTitle>
            <DialogDescription className="text-white/45">
              A quick walkthrough of how VolleyVision turns film into feedback.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-5 flex gap-1.5">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => goTo(i)}
                className={`flex-1 rounded-full px-2 py-2 text-center font-mono text-[10px] uppercase tracking-wider transition-all ${
                  i === step
                    ? "bg-emerald-500/15 text-emerald-300"
                    : i < step
                      ? "bg-white/5 text-white/50 hover:bg-white/8"
                      : "bg-white/[0.03] text-white/30 hover:bg-white/5"
                }`}
              >
                {i + 1}. {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4 px-5 py-5 sm:px-6">
          <div>
            <h3 className="text-lg font-bold tracking-tight">{current.title}</h3>
            <p className="mt-1 text-sm text-white/50">{current.blurb}</p>
          </div>

          {step === 0 && <UploadStage playing={open && step === 0} />}
          {step === 1 && <AnalyzeStage playing={open && step === 1} />}
          {step === 2 && <FeedbackStage playing={open && step === 2} />}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-white/5 px-5 py-4 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            className="rounded-full text-white/50 hover:bg-white/5 hover:text-white"
            disabled={step === 0}
            onClick={() => goTo(Math.max(0, step - 1))}
          >
            Back
          </Button>
          <div className="flex items-center gap-2">
            {step < STEPS.length - 1 ? (
              <Button
                size="sm"
                className="btn-emerald px-5"
                onClick={() => goTo(step + 1)}
              >
                Next
              </Button>
            ) : (
              <Button
                size="sm"
                className="btn-emerald px-5"
                render={<Link href="/upload" onClick={() => setOpen(false)} />}
              >
                Upload your film
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
