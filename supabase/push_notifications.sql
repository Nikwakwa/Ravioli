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
begin
  if char_length(p_endpoint) < 10 or char_length(p_endpoint) > 2048 then
    raise exception 'Invalid push endpoint';
  end if;

  insert into public.push_subscriptions (
    endpoint, p256dh, auth, prefs, cat_snapshot, alerted,
    woke_up_alerted, app_url, icon_url, badge_url, updated_at
  )
  values (
    p_endpoint, p_p256dh, p_auth, coalesce(p_prefs, '{}'::jsonb),
    coalesce(p_cat_snapshot, '{}'::jsonb), coalesce(p_alerted, '{}'::jsonb),
    coalesce(p_woke_up_alerted, false), coalesce(p_app_url, './'),
    coalesce(p_icon_url, './pwa-192x192.png'), coalesce(p_badge_url, './badge-96x96.png'),
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
  delete from public.push_subscriptions where endpoint = p_endpoint;
end;
$$;

revoke all on function public.upsert_push_subscription(text, text, text, jsonb, jsonb, jsonb, boolean, text, text, text) from public;
grant execute on function public.upsert_push_subscription(text, text, text, jsonb, jsonb, jsonb, boolean, text, text, text) to anon, authenticated;

revoke all on function public.delete_push_subscription(text) from public;
grant execute on function public.delete_push_subscription(text) to anon, authenticated;

-- =============================================================================
-- Optional: Schedule the Edge Function every 5 minutes using pg_cron + pg_net.
-- Replace <YOUR_PROJECT_REF> and <YOUR_SERVICE_ROLE_KEY> before running.
-- =============================================================================
-- create extension if not exists pg_cron;
-- create extension if not exists pg_net;
--
-- select cron.schedule(
--   'ravioli-send-push',
--   '*/5 * * * *',
--   $$
--   select net.http_post(
--     url := 'https://<YOUR_PROJECT_REF>.supabase.co/functions/v1/send-push',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'Authorization', 'Bearer <YOUR_SERVICE_ROLE_KEY>'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
