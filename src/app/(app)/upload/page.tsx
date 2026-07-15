"use client";

import { useState } from "react";
import { VideoUpload } from "@/components/video-upload";
import { YouTubeImport } from "@/components/youtube-import";
import { AppShell, AppPageHeader, AppPanel, AppMetaChip } from "@/components/app-ui";

const STEPS = [
  { label: "Source", active: true },
  { label: "Upload", active: false },
  { label: "Analyze", active: false },
];

export default function UploadPage() {
  const [tab, setTab] = useState<"file" | "youtube">("file");

  return (
    <AppShell>
      <AppPageHeader
        eyebrow="Upload"
        title="Add new film"
        description="Drop match or practice footage — then tag plays, pull clips, and coach from the tape."
        meta={
          <>
            <AppMetaChip tone="emerald">MP4 · MOV · WebM</AppMetaChip>
            <AppMetaChip>Up to 2GB</AppMetaChip>
            <AppMetaChip>YouTube import</AppMetaChip>
          </>
        }
      />

      <div className="mb-8 flex flex-wrap items-center gap-2 sm:gap-3">
        {STEPS.map((step, i) => (
          <div key={step.label} className="flex items-center gap-2 sm:gap-3">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full border font-mono text-[11px] ${
                  i === 0
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                    : "border-white/12 text-white/35"
                }`}
              >
                {i + 1}
              </span>
              <span
                className={`text-sm ${i === 0 ? "font-medium text-white/80" : "text-white/35"}`}
              >
                {step.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className="hidden h-px w-8 bg-gradient-to-r from-white/20 to-transparent sm:block" />
            )}
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-2 gap-1 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
        <button
          onClick={() => setTab("file")}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
            tab === "file"
              ? "bg-emerald-500/15 text-emerald-200 shadow-[0_0_24px_rgba(52,211,153,0.12)]"
              : "text-white/45 hover:bg-white/5 hover:text-white"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
            />
          </svg>
          File upload
        </button>
        <button
          onClick={() => setTab("youtube")}
          className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
            tab === "youtube"
              ? "bg-emerald-500/15 text-emerald-200 shadow-[0_0_24px_rgba(52,211,153,0.12)]"
              : "text-white/45 hover:bg-white/5 hover:text-white"
          }`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          YouTube
        </button>
      </div>

      <AppPanel
        title={tab === "file" ? "Local file" : "YouTube link"}
        badge="Step 1"
      >
        {tab === "file" ? <VideoUpload /> : <YouTubeImport />}
      </AppPanel>
    </AppShell>
  );
}
