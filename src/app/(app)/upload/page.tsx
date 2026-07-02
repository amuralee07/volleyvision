"use client";

import { useState } from "react";
import { VideoUpload } from "@/components/video-upload";
import { YouTubeImport } from "@/components/youtube-import";
import { AppPageHeader, AppPanel } from "@/components/app-ui";

const STEPS = ["Select source", "Upload film", "Run AI analysis"];

export default function UploadPage() {
  const [tab, setTab] = useState<"file" | "youtube">("file");

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <AppPageHeader
        eyebrow="Upload"
        title="Add new film"
        description="Upload a video file or import from YouTube. AI will tag key moments and extract clips automatically."
      />

      <div className="mb-8 flex items-center gap-2">
        {STEPS.map((step, i) => (
          <div key={step} className="flex items-center gap-2">
            <span
              className={`flex h-6 w-6 items-center justify-center rounded-full border font-mono text-[10px] ${
                i === 0
                  ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
                  : "border-white/15 text-white/40"
              }`}
            >
              {i + 1}
            </span>
            <span className={`text-xs ${i === 0 ? "text-white/70" : "text-white/40"}`}>{step}</span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-white/10" />}
          </div>
        ))}
      </div>

      <div className="mb-6 flex gap-1 rounded-xl border border-white/10 bg-white/[0.03] p-1">
        <button
          onClick={() => setTab("file")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            tab === "file" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"
          }`}
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
          Upload File
        </button>
        <button
          onClick={() => setTab("youtube")}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
            tab === "youtube" ? "bg-white/10 text-white shadow-sm" : "text-white/50 hover:text-white"
          }`}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
          YouTube Link
        </button>
      </div>

      <AppPanel title={tab === "file" ? "File Upload" : "YouTube Import"} badge="Step 1">
        {tab === "file" ? <VideoUpload /> : <YouTubeImport />}
      </AppPanel>
    </div>
  );
}
