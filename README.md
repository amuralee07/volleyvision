# VolleyVision — AI Volleyball Coach

Upload your volleyball footage and get AI-powered analysis, coaching tips, and highlight reels for scouting.

## Tech Stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS** + shadcn/ui
- **Supabase** (Auth, PostgreSQL, Storage)
- **Google Gemini 2.0 Flash** (Video Analysis)
- **FFmpeg** (Clip Extraction)

## Setup

### 1. Prerequisites

- Node.js 18+
- FFmpeg installed locally (`brew install ffmpeg` on macOS)
- `yt-dlp` for YouTube imports (`brew install yt-dlp`)

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration file at `supabase/migrations/001_schema.sql`
3. In **Storage**, ensure the `videos` and `clips` buckets exist (the migration creates them, but verify)
4. Copy your project URL and anon key from **Settings → API**
5. Enable **Email** auth under **Authentication → Providers → Email**
6. For local dev, disable **Confirm email** so sign-up works immediately

### 3. Google Gemini Setup

1. Go to [ai.google.dev](https://ai.google.dev) and get an API key
2. Ensure the Gemini 2.0 Flash model is available in your project

### 4. Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_AI_API_KEY=your-gemini-api-key
```

The service role key powers **Try Demo** on the landing page (creates a demo user without email rate limits). Never commit this key.

### 5. Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Features

- **Landing Demo** — Interactive HUD synced to demo volleyball footage
- **Try Demo** — One-click demo login (requires `SUPABASE_SERVICE_ROLE_KEY`)
- **Video Upload** — Drag-and-drop upload with progress tracking
- **YouTube Import** — Paste a link to analyze YouTube footage
- **AI Analysis** — Gemini analyzes your footage for technique, positioning, and decision-making
- **Coaching Tips** — Strengths, areas to improve, and specific drills
- **Highlight Detection** — AI identifies key moments (spikes, blocks, aces, etc.) with timestamps
- **Clip Extraction** — Extract individual clips from your footage using FFmpeg
- **Highlight Reels** — Build shareable highlight tapes for college scouts
- **Public Sharing** — Generate links that anyone can view without signing in

## Project Structure

```
src/
├── app/
│   ├── (auth)/          Login and signup pages
│   ├── (app)/           Authenticated app pages
│   │   ├── dashboard/   Video listing
│   │   ├── upload/      Video upload + YouTube import
│   │   ├── video/[id]/  Video detail + analysis
│   │   ├── clips/       All extracted clips
│   │   └── highlights/  Reel builder + viewer
│   ├── share/[token]/   Public shared reel page
│   └── api/             API routes (analyze, clips, highlights, demo)
├── components/          UI components
└── lib/                 Supabase clients, Gemini, FFmpeg, types
```
