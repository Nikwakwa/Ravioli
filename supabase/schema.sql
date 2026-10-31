-- =============================================================================
-- Ravioli — Supabase schema
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run (idempotent).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. cat_state — exactly ONE row (id = 1) holding Oli's *base* snapshot.
--    Live stats are derived client-side from last_updated_at (timestamp delta
--    math), so no cron / background worker is ever needed.
-- -----------------------------------------------------------------------------
create table if not exists public.cat_state (
  id              smallint primary key default 1 check (id = 1),
  name            text        not null default 'Oli' check (name = 'Oli'),
  hunger          real        not null default 70 check (hunger    between 0 and 100),
  hydration       real        not null default 70 check (hydration between 0 and 100),
  happiness       real        not null default 75 check (happiness between 0 and 100),
  energy          real        not null default 85 check (energy    between 0 and 100),
  hygiene         real        not null default 90 check (hygiene   between 0 and 100),
  is_sleeping     boolean     not null default false,
  calm_until      timestamptz,
  last_updated_at timestamptz not null default now(),
  -- Optimistic-concurrency counter: clients update "where version = expected"
  -- so two phones acting at the same instant never overwrite each other.
  version         bigint      not null default 0
);

insert into public.cat_state (id) values (1) on conflict (id) do nothing;

-- -----------------------------------------------------------------------------
-- 2. activity_log — co-op feed ("Her — Fed Oli a chicken heart · 18:45").
-- -----------------------------------------------------------------------------
create table if not exists public.activity_log (
  id         bigint generated always as identity primary key,
  player     text        not null check (char_length(player) between 1 and 24 and player !~ '[<>]'),
  action_id  text        not null check (
    action_id in (
      'churu',
      'wet_food',
      'chicken_heart',
      'quail_egg',
      'fountain',
      'chin_scratch',
      'feather_wand',
      'pheromone_mist',
      'brush',
      'toggle_sleep'
    )
  ),
  message    text        not null check (char_length(message) between 1 and 160 and message !~ '[<>]'),
  -- Random per-device id so each phone can tell its own echoes from partner actions.
  device_id  text        check (char_length(device_id) <= 64),
  created_at timestamptz not null default now()
);

alter table public.activity_log add column if not exists device_id text;

create index if not exists activity_log_created_at_idx
  on public.activity_log (created_at desc);

-- Keep the log small on the free tier: retain only the latest 200 entries.
create or replace function public.trim_activity_log()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  delete from public.activity_log
  where id in (
    select id from public.activity_log
    order by created_at desc, id desc
    offset 200
  );
  return null;
end;
$$;

drop trigger if exists trim_activity_log_trg on public.activity_log;
create trigger trim_activity_log_trg
  after insert on public.activity_log
  for each statement execute function public.trim_activity_log();

-- -----------------------------------------------------------------------------
-- 3. Row Level Security — anon (publishable key) access for a private
--    couples game. Anyone holding the anon key can care for Oli, but can't
--    create extra cats, delete Oli, or edit/delete the history.
-- -----------------------------------------------------------------------------
alter table public.cat_state    enable row level security;
alter table public.activity_log enable row level security;

drop policy if exists "cat_state: anyone can read"   on public.cat_state;
drop policy if exists "cat_state: anyone can update" on public.cat_state;
create policy "cat_state: anyone can read"
  on public.cat_state for select
  to anon, authenticated
  using (true);
create policy "cat_state: anyone can update"
  on public.cat_state for update
  to anon, authenticated
  using (id = 1)
  with check (id = 1);

drop policy if exists "activity_log: anyone can read"   on public.activity_log;
drop policy if exists "activity_log: anyone can insert" on public.activity_log;
create policy "activity_log: anyone can read"
  on public.activity_log for select
  to anon, authenticated
  using (true);
create policy "activity_log: anyone can insert"
  on public.activity_log for insert
  to anon, authenticated
  with check (true);

grant select, update on public.cat_state    to anon, authenticated;
grant select, insert on public.activity_log to anon, authenticated;

-- -----------------------------------------------------------------------------
-- 4. Realtime — broadcast row changes over WebSockets.
-- -----------------------------------------------------------------------------
alter table public.cat_state    replica identity full;
alter table public.activity_log replica identity full;

do $$
begin
  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'cat_state'
  ) then
    alter publication supabase_realtime add table public.cat_state;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'activity_log'
  ) then
    alter publication supabase_realtime add table public.activity_log;
  end if;
end;
$$;
