-- ============================================
-- PROFILES (extends Supabase Auth)
-- ============================================
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "own_profile_select" on public.profiles for select using (auth.uid() = id);
create policy "own_profile_update" on public.profiles for update using (auth.uid() = id);
create policy "own_profile_insert" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', new.email));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================
-- SESSIONS
-- ============================================
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  idea text not null,
  status text not null default 'active' check (status in ('active','completed')),
  current_round int not null default 0,
  confidence_index int not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_sessions_user on public.sessions(user_id);
alter table public.sessions enable row level security;
create policy "own_sessions" on public.sessions for all using (user_id = auth.uid());

-- ============================================
-- Helper: check session ownership
-- ============================================
create or replace function public.owns_session(sid uuid)
returns boolean as $$
  select exists(select 1 from public.sessions where id = sid and user_id = auth.uid());
$$ language sql security definer stable;

-- ============================================
-- PROBLEM DEFINITIONS (versioned)
-- ============================================
create table public.problem_definitions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  version int not null default 1,
  description text not null default '',
  expected_outcome text not null default '',
  constraints text[] default '{}',
  irreversible_costs text[] default '{}',
  created_at timestamptz default now(),
  unique(session_id, version)
);

alter table public.problem_definitions enable row level security;
create policy "own_problem_defs" on public.problem_definitions
  for all using (public.owns_session(session_id));

-- ============================================
-- ASSUMPTIONS
-- ============================================
create table public.assumptions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  content text not null,
  status text not null default 'unvalidated'
    check (status in ('validated','unvalidated','rejected')),
  source text not null,
  created_at timestamptz default now()
);

create index idx_assumptions_session on public.assumptions(session_id);
alter table public.assumptions enable row level security;
create policy "own_assumptions" on public.assumptions
  for all using (public.owns_session(session_id));

-- ============================================
-- RISKS
-- ============================================
create table public.risks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  content text not null,
  probability text not null check (probability in ('high','medium','low')),
  severity text not null check (severity in ('high','medium','low')),
  created_at timestamptz default now()
);

create index idx_risks_session on public.risks(session_id);
alter table public.risks enable row level security;
create policy "own_risks" on public.risks
  for all using (public.owns_session(session_id));

-- ============================================
-- SIMULATION PATHS
-- ============================================
create table public.simulation_paths (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  label text not null,
  steps text[] not null default '{}',
  outcome text not null default '',
  created_at timestamptz default now()
);

alter table public.simulation_paths enable row level security;
create policy "own_sim_paths" on public.simulation_paths
  for all using (public.owns_session(session_id));

-- ============================================
-- AGENT COMMENTS
-- ============================================
create table public.agent_comments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  round int not null,
  agent text not null,
  content text not null,
  created_at timestamptz default now()
);

create index idx_comments_session_round on public.agent_comments(session_id, round);
alter table public.agent_comments enable row level security;
create policy "own_comments" on public.agent_comments
  for all using (public.owns_session(session_id));

-- ============================================
-- SNAPSHOTS (full state tree as JSONB for diff)
-- ============================================
create table public.snapshots (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  version int not null,
  state_tree jsonb not null,
  human_judgment text default '',
  trigger text not null,
  created_at timestamptz default now(),
  unique(session_id, version)
);

alter table public.snapshots enable row level security;
create policy "own_snapshots" on public.snapshots
  for all using (public.owns_session(session_id));

-- ============================================
-- PROVIDER CONFIGS (per-user)
-- ============================================
create table public.provider_configs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider_name text not null,
  api_key text not null,
  base_url text,
  default_model text not null,
  unique(user_id, provider_name)
);

alter table public.provider_configs enable row level security;
create policy "own_providers" on public.provider_configs
  for all using (user_id = auth.uid());

-- ============================================
-- AGENT ROUTINGS (per-user)
-- ============================================
create table public.agent_routings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  agent_name text not null,
  provider_name text not null,
  model_override text,
  unique(user_id, agent_name)
);

alter table public.agent_routings enable row level security;
create policy "own_routings" on public.agent_routings
  for all using (user_id = auth.uid());
