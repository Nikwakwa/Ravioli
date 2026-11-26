-- =============================================================================
-- Ravioli — Background Web Push Notifications Schema
-- Run this once in Supabase Dashboard → SQL Editor → New query → Run.
-- Safe to re-run (idempotent).
-- =============================================================================

create table if not exists public.push_subscriptions (
  endpoint        text        primary key,
  p256dh          text        not null,
  auth            text        not null,
  prefs           jsonb       not null default '{}'::jsonb,
  cat_snapshot    jsonb       not null default '{}'::jsonb,
  alerted         jsonb       not null default '{}'::jsonb,
  woke_up_alerted boolean     not null default false,
  app_url         text        not null default './',
  icon_url        text        not null default './pwa-192x192.png',
  badge_url       text        not null default './badge-96x96.png',
  updated_at      timestamptz not null default now()
);

create index if not exists push_subscriptions_updated_at_idx
  on public.push_subscriptions (updated_at desc);

-- Keep subscriptions private: anon clients cannot SELECT other users' endpoints.
alter table public.push_subscriptions enable row level security;

-- Clean up any old direct policies if re-running.
drop policy if exists "push_subscriptions_no_anon_select" on public.push_subscriptions;

-- Secure RPC for registering or updating a device's push subscription + Oli snapshot.
create or replace function public.upsert_push_subscription(
  p_endpoint        text,
  p_p256dh          text,
  p_auth            text,
  p_prefs           jsonb,
  p_cat_snapshot    jsonb,
  p_alerted         jsonb,
  p_woke_up_alerted boolean,
  p_app_url         text default './',
  p_icon_url        text default './pwa-192x192.png',
  p_badge_url       text default './badge-96x96.png'
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_prefs        jsonb := coalesce(p_prefs, '{}'::jsonb);
  v_cat_snapshot jsonb := coalesce(p_cat_snapshot, '{}'::jsonb);
  v_alerted      jsonb := coalesce(p_alerted, '{}'::jsonb);
  v_app_url      text  := coalesce(p_app_url, './');
  v_icon_url     text  := coalesce(p_icon_url, './pwa-192x192.png');
  v_badge_url    text  := coalesce(p_badge_url, './badge-96x96.png');
begin
  if p_endpoint is null
     or char_length(p_endpoint) < 20
     or char_length(p_endpoint) > 2048
     or p_endpoint !~ '^https://[A-Za-z0-9.-]+\.[A-Za-z]{2,}(/[^[:space:]]*)?$'
     or p_endpoint ~* '^https://(localhost|127\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)'
     or p_endpoint ~ '[[:space:]]' then
    raise exception 'Invalid push endpoint';
  end if;

  if p_p256dh is null
     or char_length(p_p256dh) < 20
     or char_length(p_p256dh) > 256
     or p_p256dh !~ '^[A-Za-z0-9+/=_-]+$' then
    raise exception 'Invalid push p256dh key';
  end if;

  if p_auth is null
     or char_length(p_auth) < 10
     or char_length(p_auth) > 128
     or p_auth !~ '^[A-Za-z0-9+/=_-]+$' then
    raise exception 'Invalid push auth key';
  end if;

  if octet_length(v_prefs::text) > 4096
     or octet_length(v_cat_snapshot::text) > 4096
     or octet_length(v_alerted::text) > 1024 then
    raise exception 'Push payload exceeds size limit';
  end if;

  if char_length(v_app_url) > 512 or v_app_url !~ '^(\./|https://)' then
    v_app_url := './';
  end if;
  if char_length(v_icon_url) > 512 or v_icon_url !~ '^(\./|https://)' then
    v_icon_url := './pwa-192x192.png';
  end if;
  if char_length(v_badge_url) > 512 or v_badge_url !~ '^(\./|https://)' then
    v_badge_url := './badge-96x96.png';
  end if;

  -- Prune stale subscriptions (90+ days inactive) and guard against unbounded table flooding.
  delete from public.push_subscriptions
  where updated_at < now() - interval '90 days';

  if not exists (select 1 from public.push_subscriptions where endpoint = p_endpoint)
     and (select count(*) from public.push_subscriptions) >= 500 then
    raise exception 'Push subscription capacity reached';
  end if;

  insert into public.push_subscriptions (
    endpoint, p256dh, auth, prefs, cat_snapshot, alerted,
    woke_up_alerted, app_url, icon_url, badge_url, updated_at
  )
  values (
    p_endpoint, p_p256dh, p_auth, v_prefs,
    v_cat_snapshot, v_alerted,
    coalesce(p_woke_up_alerted, false), v_app_url,
    v_icon_url, v_badge_url,
    now()
  )
  on conflict (endpoint) do update set
    p256dh          = excluded.p256dh,
    auth            = excluded.auth,
    prefs           = excluded.prefs,
    cat_snapshot    = excluded.cat_snapshot,
    alerted         = excluded.alerted,
    woke_up_alerted = excluded.woke_up_alerted,
    app_url         = excluded.app_url,
    icon_url        = excluded.icon_url,
    badge_url       = excluded.badge_url,
    updated_at      = now();
end;
$$;

-- Secure RPC for removing a device's push subscription when muted.
create or replace function public.delete_push_subscription(p_endpoint text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_endpoint is null or char_length(p_endpoint) < 20 or char_length(p_endpoint) > 2048 then
    return;
  end if;
  delete from public.push_subscriptions where endpoint = p_endpoint;
end;
$$;

revoke all on function public.upsert_push_subscription(text, text, text, jsonb, jsonb, jsonb, boolean, text, text, text) from public;
grant execute on function public.upsert_push_subscription(text, text, text, jsonb, jsonb, jsonb, boolean, text, text, text) to anon, authenticated;

revoke all on function public.delete_push_subscription(text) from public;
grant execute on function public.delete_push_subscription(text) to anon, authenticated;

-- =============================================================================
-- Reliable 5-Minute Background Push Scheduler (Supabase pg_cron + pg_net)
-- GitHub Actions throttles */5 cron schedules to once every 6-10 hours.
-- Running pg_cron inside Supabase checks Oli every exact 5 minutes!
--
-- After running this file, run ONE line in SQL Editor (with your values):
--   select public.schedule_ravioli_push_cron('https://<YOUR_PROJECT_REF>.supabase.co', '<YOUR_PUSH_CRON_SECRET>');
-- =============================================================================
create or replace function public.schedule_ravioli_push_cron(
  p_supabase_url text,
  p_cron_secret  text
)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_url     text := rtrim(trim(p_supabase_url), '/') || '/functions/v1/send-push';
  v_headers jsonb;
  v_cmd     text;
begin
  if p_supabase_url is null or p_supabase_url !~ '^https://[A-Za-z0-9.-]+\.supabase\.co/?$' then
    raise exception 'Pass your https://<project-ref>.supabase.co URL';
  end if;
  if p_cron_secret is null or char_length(trim(p_cron_secret)) < 12 then
    raise exception 'Pass your PUSH_CRON_SECRET (at least 12 characters)';
  end if;

  create extension if not exists pg_cron;
  create extension if not exists pg_net;

  perform cron.unschedule(jobid)
  from cron.job
  where jobname = 'ravioli-send-push';

  v_headers := jsonb_build_object(
    'Content-Type', 'application/json',
    'x-cron-secret', trim(p_cron_secret)
  );

  v_cmd := format(
    'select net.http_post(url := %L, headers := %L::jsonb, body := %L::jsonb);',
    v_url,
    v_headers::text,
    '{}'
  );

  perform cron.schedule('ravioli-send-push', '*/5 * * * *', v_cmd);
  return 'Scheduled ravioli-send-push every 5 minutes -> ' || v_url;
end;
$$;

revoke all on function public.schedule_ravioli_push_cron(text, text) from public, anon, authenticated;
