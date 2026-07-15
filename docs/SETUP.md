# VolleyVision — Local Development Setup

## Prerequisites

- Node.js 18+
- FFmpeg installed locally (`brew install ffmpeg` on macOS)
- `yt-dlp` for YouTube imports (`brew install yt-dlp`)

## Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the migration files in `supabase/migrations/` (start with `001_schema.sql`, then `002_team_player_feedback.sql`)
3. In **Storage**, ensure the `videos` and `clips` buckets exist (the migration creates them, but verify)
4. Copy your project URL and anon key from **Settings → API**
5. Enable **Email** auth under **Authentication → Providers → Email**
6. For local dev, disable **Confirm email** so sign-up works immediately

## Google Gemini Setup

1. Go to [ai.google.dev](https://ai.google.dev) and get an API key
2. Ensure the Gemini 2.0 Flash model is available in your project

## Environment Variables

Create `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
GOOGLE_AI_API_KEY=your-gemini-api-key
```

The service role key powers **Try Demo** on the landing page (creates a demo user without email rate limits). Never commit this key.

## Install & Run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
