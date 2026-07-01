-- Profiles table
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null unique,
  name text not null default '',
  role text not null default 'player' check (role in ('player', 'coach')),
  team_name text,
  position text,
  graduation_year integer,
  created_at timestamptz default now() not null
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = user_id);
create policy "Users can insert own profile"
  on profiles for insert with check (auth.uid() = user_id);
create policy "Users can update own profile"
  on profiles for update using (auth.uid() = user_id);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (user_id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', ''));
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Videos table
create table if not exists videos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  storage_path text not null,
  duration_seconds real,
  status text not null default 'uploading' check (status in ('uploading', 'processing', 'ready', 'failed')),
  created_at timestamptz default now() not null
);

alter table videos enable row level security;

create policy "Users can view own videos"
  on videos for select using (auth.uid() = user_id);
create policy "Users can insert own videos"
  on videos for insert with check (auth.uid() = user_id);
create policy "Users can update own videos"
  on videos for update using (auth.uid() = user_id);
create policy "Users can delete own videos"
  on videos for delete using (auth.uid() = user_id);

-- Analyses table
create table if not exists analyses (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references videos(id) on delete cascade not null,
  summary text not null default '',
  strengths jsonb not null default '[]'::jsonb,
  improvements jsonb not null default '[]'::jsonb,
  highlights jsonb not null default '[]'::jsonb,
  raw_response jsonb not null default '{}'::jsonb,
  created_at timestamptz default now() not null
);

alter table analyses enable row level security;

create policy "Users can view own analyses"
  on analyses for select using (
    exists (select 1 from videos where videos.id = analyses.video_id and videos.user_id = auth.uid())
  );
create policy "Service can insert analyses"
  on analyses for insert with check (
    exists (select 1 from videos where videos.id = analyses.video_id and videos.user_id = auth.uid())
  );
create policy "Users can delete own analyses"
  on analyses for delete using (
    exists (select 1 from videos where videos.id = analyses.video_id and videos.user_id = auth.uid())
  );

-- Clips table
create table if not exists clips (
  id uuid primary key default gen_random_uuid(),
  video_id uuid references videos(id) on delete cascade not null,
  analysis_id uuid references analyses(id) on delete set null,
  label text not null default '',
  start_time real not null,
  end_time real not null,
  storage_path text,
  description text not null default '',
  player_feedback text not null default '',
  created_at timestamptz default now() not null
);

alter table clips enable row level security;

create policy "Users can view own clips"
  on clips for select using (
    exists (select 1 from videos where videos.id = clips.video_id and videos.user_id = auth.uid())
  );
create policy "Users can insert own clips"
  on clips for insert with check (
    exists (select 1 from videos where videos.id = clips.video_id and videos.user_id = auth.uid())
  );
create policy "Users can delete own clips"
  on clips for delete using (
    exists (select 1 from videos where videos.id = clips.video_id and videos.user_id = auth.uid())
  );

-- Highlight reels table
create table if not exists highlight_reels (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  clip_ids jsonb not null default '[]'::jsonb,
  share_token text not null unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz default now() not null
);

alter table highlight_reels enable row level security;

create policy "Users can view own reels"
  on highlight_reels for select using (auth.uid() = user_id);
create policy "Users can insert own reels"
  on highlight_reels for insert with check (auth.uid() = user_id);
create policy "Users can update own reels"
  on highlight_reels for update using (auth.uid() = user_id);
create policy "Users can delete own reels"
  on highlight_reels for delete using (auth.uid() = user_id);
create policy "Anyone can view shared reels"
  on highlight_reels for select using (true);

-- Storage bucket for videos
insert into storage.buckets (id, name, public)
values ('videos', 'videos', false)
on conflict (id) do nothing;

-- Storage bucket for clips
insert into storage.buckets (id, name, public)
values ('clips', 'clips', true)
on conflict (id) do nothing;

-- Storage policies
create policy "Users can upload videos"
  on storage.objects for insert
  with check (bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can view own videos"
  on storage.objects for select
  using (bucket_id = 'videos' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can upload clips"
  on storage.objects for insert
  with check (bucket_id = 'clips' and auth.uid()::text = (storage.foldername(name))[1]);

create policy "Anyone can view clips"
  on storage.objects for select
  using (bucket_id = 'clips');
