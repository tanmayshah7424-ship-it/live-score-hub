-- Create teams table
create table public.teams (
  id uuid not null default gen_random_uuid(),
  name text not null,
  short_name text,
  logo_url text,
  created_at timestamp with time zone not null default now(),
  constraint teams_pkey primary key (id)
);

-- Create players table
create table public.players (
  id uuid not null default gen_random_uuid(),
  name text not null,
  team_id uuid references public.teams(id) on delete cascade,
  position text,
  number integer,
  created_at timestamp with time zone not null default now(),
  constraint players_pkey primary key (id)
);

-- Create matches table
create table public.matches (
  id uuid not null default gen_random_uuid(),
  home_team_id uuid references public.teams(id),
  away_team_id uuid references public.teams(id),
  start_time timestamp with time zone not null,
  status text not null default 'scheduled', -- scheduled, live, finished
  score_home integer default 0,
  score_away integer default 0,
  current_time text, -- e.g., "45:00"
  created_at timestamp with time zone not null default now(),
  constraint matches_pkey primary key (id)
);

-- Enable RLS
alter table public.teams enable row level security;
alter table public.players enable row level security;
alter table public.matches enable row level security;

-- Policies for teams
create policy "Enable read for public" on public.teams
  for select using (true);

create policy "Enable insert for admins" on public.teams
  for insert with check (public.has_role('admin', auth.uid()));

create policy "Enable update for admins" on public.teams
  for update using (public.has_role('admin', auth.uid()));

create policy "Enable delete for admins" on public.teams
  for delete using (public.has_role('admin', auth.uid()));

-- Policies for players
create policy "Enable read for public" on public.players
  for select using (true);

create policy "Enable insert for admins" on public.players
  for insert with check (public.has_role('admin', auth.uid()));

create policy "Enable update for admins" on public.players
  for update using (public.has_role('admin', auth.uid()));

create policy "Enable delete for admins" on public.players
  for delete using (public.has_role('admin', auth.uid()));

-- Policies for matches
create policy "Enable read for public" on public.matches
  for select using (true);

create policy "Enable insert for admins" on public.matches
  for insert with check (public.has_role('admin', auth.uid()));

create policy "Enable update for admins" on public.matches
  for update using (public.has_role('admin', auth.uid()));

create policy "Enable delete for admins" on public.matches
  for delete using (public.has_role('admin', auth.uid()));
