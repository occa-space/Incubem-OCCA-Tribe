-- Supabase schema for OCCA Tribe Tycoon

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text,
  color text default '#94a3b8',
  avatar text,
  squad_id text default 'sq_osc',
  role text default 'Executor',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.squads (
  id text primary key,
  name text not null,
  color text not null,
  description text,
  xp integer,
  level integer,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.buildings (
  id text primary key,
  owner_id uuid references public.profiles (id) on delete set null,
  squad_id text references public.squads (id) on delete set null,
  type text not null,
  level integer not null default 1,
  position jsonb not null,
  is_placed boolean not null default true,
  last_collected bigint,
  description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create unique index if not exists buildings_unique_residential_per_owner
on public.buildings (owner_id)
where type = 'RESIDENTIAL';

create unique index if not exists buildings_unique_tribal_center
on public.buildings (type)
where type = 'TRIBAL_CENTER';

alter table public.buildings
  drop constraint if exists buildings_tribal_center_position_check;
alter table public.buildings
  add constraint buildings_tribal_center_position_check
  check (
    type <> 'TRIBAL_CENTER'
    or ((position->>'x')::int = 10 and (position->>'z')::int = 10)
  );

create table if not exists public.tasks (
  id text primary key,
  building_id text references public.buildings (id) on delete cascade,
  squad_id text references public.squads (id) on delete set null,
  creator_id uuid references public.profiles (id) on delete set null,
  assignee_id uuid references public.profiles (id) on delete set null,
  content text not null,
  status text not null,
  created_at bigint not null,
  size integer not null,
  complexity integer not null,
  rule_multiplier numeric not null,
  rule_label text not null,
  rule_value text not null,
  fixed_time_type text,
  fixed_quantity integer,
  fixed_quantity_limit integer,
  fixed_quantity_count integer,
  fixed_deadline bigint,
  history jsonb,
  description text,
  participants uuid[],
  custom_pa_distribution jsonb,
  evidence_link text,
  delivery_notes text,
  reflections text,
  aim integer,
  feedback text,
  final_pa integer,
  final_xp integer,
  final_coins integer,
  sprint_history text[],
  updated_at timestamptz default now()
);

create table if not exists public.resources (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  coins integer not null default 0,
  updated_at timestamptz default now()
);

create table if not exists public.players (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  level integer not null default 1,
  current_xp integer not null default 0,
  next_level_xp integer not null default 1000,
  total_pa integer not null default 0,
  reputation numeric not null default 3.0,
  streak integer not null default 0,
  updated_at timestamptz default now()
);

create table if not exists public.app_state (
  id text primary key,
  sprint_cycle integer not null default 1,
  sprint_start_date bigint not null,
  updated_at timestamptz default now()
);

create table if not exists public.daily_entries (
  id text primary key,
  user_id uuid references public.profiles (id) on delete cascade,
  squad_id text references public.squads (id) on delete set null,
  member_name text not null,
  role text not null,
  date text not null,
  yesterday text not null,
  today text not null,
  blockers text not null,
  analysis jsonb,
  timestamp bigint not null,
  updated_at timestamptz default now()
);

create table if not exists public.feedback_entries (
  id text primary key,
  squad_id text references public.squads (id) on delete set null,
  source_user_id uuid references public.profiles (id) on delete set null,
  target_user_id uuid references public.profiles (id) on delete set null,
  sprint integer not null,
  relationship text not null,
  q_comm text,
  q_empathy text,
  q_collab text,
  q_conflict text,
  q_strengths text,
  q_weaknesses text,
  q_impact text,
  q_development text,
  analysis jsonb,
  timestamp bigint not null,
  updated_at timestamptz default now()
);

create unique index if not exists feedback_entries_unique_pair_sprint
on public.feedback_entries (source_user_id, target_user_id, sprint);

create table if not exists public.learning_tracks (
  id text primary key,
  gap_id text not null,
  title text not null,
  description text not null,
  urgency text not null,
  videos jsonb,
  created_at bigint not null,
  published_at bigint,
  status text not null,
  total_views integer not null default 0,
  completions integer not null default 0,
  impact_score integer,
  updated_at timestamptz default now()
);

create table if not exists public.market_items (
  id text primary key,
  name text not null,
  description text not null,
  cost integer not null,
  stock integer not null,
  category text not null,
  image_url text,
  is_active boolean not null default true,
  updated_at timestamptz default now()
);

create table if not exists public.purchase_records (
  id text primary key,
  item_id text references public.market_items (id) on delete set null,
  user_id uuid references public.profiles (id) on delete set null,
  user_name text not null,
  item_name text not null,
  item_cost integer not null,
  timestamp bigint not null,
  status text not null,
  updated_at timestamptz default now()
);

-- Updated at trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists squads_set_updated_at on public.squads;
create trigger squads_set_updated_at before update on public.squads
for each row execute function public.set_updated_at();

drop trigger if exists buildings_set_updated_at on public.buildings;
create trigger buildings_set_updated_at before update on public.buildings
for each row execute function public.set_updated_at();

drop trigger if exists tasks_set_updated_at on public.tasks;
create trigger tasks_set_updated_at before update on public.tasks
for each row execute function public.set_updated_at();

drop trigger if exists resources_set_updated_at on public.resources;
create trigger resources_set_updated_at before update on public.resources
for each row execute function public.set_updated_at();

drop trigger if exists players_set_updated_at on public.players;
create trigger players_set_updated_at before update on public.players
for each row execute function public.set_updated_at();

drop trigger if exists app_state_set_updated_at on public.app_state;
create trigger app_state_set_updated_at before update on public.app_state
for each row execute function public.set_updated_at();

drop trigger if exists daily_entries_set_updated_at on public.daily_entries;
create trigger daily_entries_set_updated_at before update on public.daily_entries
for each row execute function public.set_updated_at();

drop trigger if exists feedback_entries_set_updated_at on public.feedback_entries;
create trigger feedback_entries_set_updated_at before update on public.feedback_entries
for each row execute function public.set_updated_at();

drop trigger if exists learning_tracks_set_updated_at on public.learning_tracks;
create trigger learning_tracks_set_updated_at before update on public.learning_tracks
for each row execute function public.set_updated_at();

drop trigger if exists market_items_set_updated_at on public.market_items;
create trigger market_items_set_updated_at before update on public.market_items
for each row execute function public.set_updated_at();

drop trigger if exists purchase_records_set_updated_at on public.purchase_records;
create trigger purchase_records_set_updated_at before update on public.purchase_records
for each row execute function public.set_updated_at();

-- Auto-profile creation
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name, role, squad_id)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', 'Usuario'), 'Executor', 'sq_osc')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS helpers
create or replace function public.is_master()
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'Master'
  );
$$;

create or replace function public.can_access_squad(sid text)
returns boolean language sql stable as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid()
      and (p.role = 'Master' or p.squad_id = sid)
  );
$$;

create or replace function public.apply_participant_rewards(
  target_user uuid,
  pa_delta integer,
  xp_delta integer,
  coins_delta integer,
  aim_value integer
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  actor_id uuid := auth.uid();
  actor_role text;
  actor_squad text;
  target_squad text;
  p_level integer;
  p_current_xp integer;
  p_next_level_xp integer;
  p_total_pa integer;
  p_reputation numeric;
  p_streak integer;
  safe_pa integer := greatest(coalesce(pa_delta, 0), 0);
  safe_xp integer := greatest(coalesce(xp_delta, 0), 0);
  safe_coins integer := greatest(coalesce(coins_delta, 0), 0);
  safe_aim integer := greatest(least(coalesce(aim_value, 1), 3), 0);
begin
  if actor_id is null then
    raise exception 'Not authenticated';
  end if;

  select p.role, p.squad_id
    into actor_role, actor_squad
  from public.profiles p
  where p.id = actor_id;

  if actor_role is null then
    raise exception 'Profile not found for actor';
  end if;

  select p.squad_id
    into target_squad
  from public.profiles p
  where p.id = target_user;

  if target_squad is null and actor_role <> 'Master' then
    raise exception 'Target user not found';
  end if;

  if not (
    actor_role = 'Master'
    or actor_id = target_user
    or (actor_role = 'Mentor Júnior' and actor_squad = target_squad)
  ) then
    raise exception 'Not allowed to apply rewards for target user';
  end if;

  insert into public.players (user_id, level, current_xp, next_level_xp, total_pa, reputation, streak)
  values (target_user, 1, 0, 1000, 0, 3.0, 0)
  on conflict (user_id) do nothing;

  insert into public.resources (user_id, coins)
  values (target_user, 0)
  on conflict (user_id) do nothing;

  select level, current_xp, next_level_xp, total_pa, reputation, streak
    into p_level, p_current_xp, p_next_level_xp, p_total_pa, p_reputation, p_streak
  from public.players
  where user_id = target_user
  for update;

  p_total_pa := p_total_pa + safe_pa;
  p_current_xp := p_current_xp + safe_xp;

  while p_current_xp >= p_next_level_xp loop
    p_current_xp := p_current_xp - p_next_level_xp;
    p_level := p_level + 1;
    p_next_level_xp := floor(1000 * power(1.5, p_level - 1));
  end loop;

  p_reputation := (p_reputation * 0.95) + (safe_aim * 0.05);

  update public.players
  set
    level = p_level,
    current_xp = p_current_xp,
    next_level_xp = p_next_level_xp,
    total_pa = p_total_pa,
    reputation = p_reputation,
    streak = p_streak
  where user_id = target_user;

  update public.resources
  set coins = coins + safe_coins
  where user_id = target_user;
end;
$$;

-- Data backfill for legacy rows without squad_id
update public.buildings b
set squad_id = p.squad_id
from public.profiles p
where b.squad_id is null
  and b.owner_id = p.id;

update public.tasks t
set squad_id = b.squad_id
from public.buildings b
where t.squad_id is null
  and t.building_id = b.id;

alter table public.profiles enable row level security;
alter table public.squads enable row level security;
alter table public.buildings enable row level security;
alter table public.tasks enable row level security;
alter table public.resources enable row level security;
alter table public.players enable row level security;
alter table public.app_state enable row level security;
alter table public.daily_entries enable row level security;
alter table public.feedback_entries enable row level security;
alter table public.learning_tracks enable row level security;
alter table public.market_items enable row level security;
alter table public.purchase_records enable row level security;

-- Profiles policies
drop policy if exists "profiles_select" on public.profiles;
create policy "profiles_select" on public.profiles
for select using (auth.role() = 'authenticated');

drop policy if exists "profiles_insert" on public.profiles;
create policy "profiles_insert" on public.profiles
for insert with check (auth.uid() = id);

drop policy if exists "profiles_update" on public.profiles;
create policy "profiles_update" on public.profiles
for update using (auth.uid() = id or public.is_master());

-- Squads policies
drop policy if exists "squads_select" on public.squads;
create policy "squads_select" on public.squads
for select using (auth.role() = 'authenticated');

drop policy if exists "squads_write" on public.squads;
create policy "squads_write" on public.squads
for insert with check (auth.role() = 'authenticated');

drop policy if exists "squads_update" on public.squads;
create policy "squads_update" on public.squads
for update using (public.is_master()) with check (public.is_master());

-- Buildings policies
drop policy if exists "buildings_select" on public.buildings;
create policy "buildings_select" on public.buildings
for select using (
  owner_id = auth.uid()
  or (type <> 'RESIDENTIAL' and public.can_access_squad(squad_id))
  or public.is_master()
);

drop policy if exists "buildings_write" on public.buildings;
drop policy if exists "buildings_insert" on public.buildings;
create policy "buildings_insert" on public.buildings
for insert with check (
  public.is_master()
  or (
    type = 'RESIDENTIAL'
    and owner_id = auth.uid()
  )
);

drop policy if exists "buildings_update" on public.buildings;
create policy "buildings_update" on public.buildings
for update using (
  public.is_master()
  or (
    type = 'RESIDENTIAL'
    and owner_id = auth.uid()
  )
) with check (
  public.is_master()
  or (
    type = 'RESIDENTIAL'
    and owner_id = auth.uid()
  )
);

drop policy if exists "buildings_delete" on public.buildings;
create policy "buildings_delete" on public.buildings
for delete using (
  public.is_master()
  or (
    type = 'RESIDENTIAL'
    and owner_id = auth.uid()
  )
);

-- Tasks policies
drop policy if exists "tasks_select" on public.tasks;
create policy "tasks_select" on public.tasks
for select using (
  public.can_access_squad(squad_id)
  or exists (
    select 1 from public.buildings b
    where b.id = tasks.building_id
      and b.owner_id = auth.uid()
  )
);

drop policy if exists "tasks_write" on public.tasks;
create policy "tasks_write" on public.tasks
for all using (
  public.can_access_squad(squad_id)
  or exists (
    select 1 from public.buildings b
    where b.id = tasks.building_id
      and b.owner_id = auth.uid()
  )
) with check (
  public.can_access_squad(squad_id)
  or exists (
    select 1 from public.buildings b
    where b.id = tasks.building_id
      and b.owner_id = auth.uid()
  )
);

-- Resources policies
drop policy if exists "resources_select" on public.resources;
create policy "resources_select" on public.resources
for select using (auth.uid() = user_id or public.is_master());

drop policy if exists "resources_write" on public.resources;
create policy "resources_write" on public.resources
for all using (auth.uid() = user_id or public.is_master())
with check (auth.uid() = user_id or public.is_master());

-- Players policies
drop policy if exists "players_select" on public.players;
create policy "players_select" on public.players
for select using (auth.uid() = user_id or public.is_master());

drop policy if exists "players_write" on public.players;
create policy "players_write" on public.players
for all using (auth.uid() = user_id or public.is_master())
with check (auth.uid() = user_id or public.is_master());

-- App state policies
drop policy if exists "app_state_select" on public.app_state;
create policy "app_state_select" on public.app_state
for select using (auth.role() = 'authenticated');

drop policy if exists "app_state_write" on public.app_state;
create policy "app_state_write" on public.app_state
for all using (public.is_master()) with check (public.is_master());

drop policy if exists "daily_entries_select" on public.daily_entries;
create policy "daily_entries_select" on public.daily_entries
for select using (public.can_access_squad(squad_id) or user_id = auth.uid());

drop policy if exists "daily_entries_write" on public.daily_entries;
create policy "daily_entries_write" on public.daily_entries
for all using (user_id = auth.uid() or public.is_master())
with check (user_id = auth.uid() or public.is_master());

drop policy if exists "feedback_entries_select" on public.feedback_entries;
create policy "feedback_entries_select" on public.feedback_entries
for select using (public.can_access_squad(squad_id));

drop policy if exists "feedback_entries_write" on public.feedback_entries;
create policy "feedback_entries_write" on public.feedback_entries
for all using (public.can_access_squad(squad_id))
with check (public.can_access_squad(squad_id));

drop policy if exists "learning_tracks_select" on public.learning_tracks;
create policy "learning_tracks_select" on public.learning_tracks
for select using (auth.role() = 'authenticated');

drop policy if exists "learning_tracks_write" on public.learning_tracks;
create policy "learning_tracks_write" on public.learning_tracks
for all using (public.is_master()) with check (public.is_master());

drop policy if exists "market_items_select" on public.market_items;
create policy "market_items_select" on public.market_items
for select using (auth.role() = 'authenticated');

drop policy if exists "market_items_write" on public.market_items;
create policy "market_items_write" on public.market_items
for all using (public.is_master()) with check (public.is_master());

drop policy if exists "purchase_records_select" on public.purchase_records;
create policy "purchase_records_select" on public.purchase_records
for select using (auth.uid() = user_id or public.is_master());

drop policy if exists "purchase_records_write" on public.purchase_records;
create policy "purchase_records_write" on public.purchase_records
for all using (auth.uid() = user_id or public.is_master())
with check (auth.uid() = user_id or public.is_master());
