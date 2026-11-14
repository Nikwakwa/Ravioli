// Supabase Edge Function: checks subscribed Oli snapshots every ~5 minutes
// and sends Web Push alerts when needs drop below 25/5 or when Oli wakes up.

import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const STAT_KEYS = ['hunger', 'hydration', 'happiness', 'energy', 'hygiene'] as const;
type StatKey = (typeof STAT_KEYS)[number];
type AlertLevel = 'none' | 'low' | 'critical';
type AlertedMap = Record<StatKey, AlertLevel>;

const DECAY_RATES = {
  awake: { hunger: -6, hydration: -8, happiness: -5, energy: -4, hygiene: -2 },
  sleeping: { hunger: -3, hydration: -8, happiness: -5, energy: 15, hygiene: -1 },
} as const;

const MIN_NAP_HOURS = 0.25;
const MAX_ELAPSED_HOURS = 24 * 90;
const NEED_THRESHOLD = 25;
const CRITICAL_THRESHOLD = 5;
const MS_PER_HOUR = 3_600_000;

const STAT_LABELS: Record<StatKey, string> = {
  hunger: 'Food',
  hydration: 'Water',
  happiness: 'Joy',
  energy: 'Energy',
  hygiene: 'Clean',
};

const LOW_MESSAGES: Record<StatKey, { title: string; body: (v: number) => string }> = {
  hunger: {
    title: '😿 Oli is getting hungry!',
    body: (v) => `Food dropped below ${NEED_THRESHOLD} (now ${v}). Time for wet food or a treat!`,
  },
  hydration: {
    title: '💧 Oli needs fresh water!',
    body: (v) => `Water dropped below ${NEED_THRESHOLD} (now ${v}). Refresh his fountain!`,
  },
  happiness: {
    title: '🥺 Oli wants attention!',
    body: (v) => `Joy dropped below ${NEED_THRESHOLD} (now ${v}). Give him chin scratches or play!`,
  },
  energy: {
    title: '🥱 Oli is getting sleepy!',
    body: (v) => `Energy dropped below ${NEED_THRESHOLD} (now ${v}). Tuck him into Nap Mode!`,
  },
  hygiene: {
    title: '🪮 Oli needs a brush!',
    body: (v) => `Cleanliness dropped below ${NEED_THRESHOLD} (now ${v}). Brush his ginger coat!`,
  },
};

function clampStat(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(100, Math.max(0, v));
}

function hoursUntilNaturalWake(energy: number): number {
  const toFull = (100 - clampStat(energy)) / DECAY_RATES.sleeping.energy;
  return Math.max(toFull, MIN_NAP_HOURS);
}

interface CatSnapshot {
  name?: string;
  hunger: number;
  hydration: number;
  happiness: number;
  energy: number;
  hygiene: number;
  is_sleeping: boolean;
  last_updated_at: string;
  paused_at?: string | null;
  deceased_at?: string | null;
}

function computeLive(base: CatSnapshot, nowMs: number) {
  const fromMs = Date.parse(base.last_updated_at);
  const hours = Number.isFinite(fromMs) && nowMs > fromMs ? Math.min((nowMs - fromMs) / MS_PER_HOUR, MAX_ELAPSED_HOURS) : 0;

  let stats: Record<StatKey, number> = {
    hunger: clampStat(base.hunger),
    hydration: clampStat(base.hydration),
    happiness: clampStat(base.happiness),
    energy: clampStat(base.energy),
    hygiene: clampStat(base.hygiene),
  };

  let isSleeping = Boolean(base.is_sleeping);
  let wokeNaturally = false;

  if (isSleeping) {
    const wakeIn = hoursUntilNaturalWake(stats.energy);
    if (hours < wakeIn) {
      for (const k of STAT_KEYS) stats[k] = clampStat(stats[k] + DECAY_RATES.sleeping[k] * hours);
    } else {
      for (const k of STAT_KEYS) stats[k] = clampStat(stats[k] + DECAY_RATES.sleeping[k] * wakeIn);
      isSleeping = false;
      wokeNaturally = true;
      const rem = hours - wakeIn;
      for (const k of STAT_KEYS) stats[k] = clampStat(stats[k] + DECAY_RATES.awake[k] * rem);
    }
  } else {
    for (const k of STAT_KEYS) stats[k] = clampStat(stats[k] + DECAY_RATES.awake[k] * hours);
    if (stats.energy <= 0) isSleeping = true;
  }

  return { stats, isSleeping, wokeNaturally };
}

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:oli@ravioli.app';

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    return new Response(JSON.stringify({ error: 'Missing required environment secrets' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: rows, error } = await supabase.from('push_subscriptions').select('*');
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const nowMs = Date.now();
  let sentCount = 0;
  let removedCount = 0;

  for (const row of rows ?? []) {
    const prefs = row.prefs ?? {};
    const snapshot = row.cat_snapshot as CatSnapshot | undefined;
    if (!prefs.enabled || !snapshot || snapshot.paused_at || snapshot.deceased_at) continue;

    const { stats, isSleeping, wokeNaturally } = computeLive(snapshot, nowMs);
    const prevAlerted: AlertedMap = {
      hunger: row.alerted?.hunger ?? 'none',
      hydration: row.alerted?.hydration ?? 'none',
      happiness: row.alerted?.happiness ?? 'none',
      energy: row.alerted?.energy ?? 'none',
      hygiene: row.alerted?.hygiene ?? 'none',
    };
    const nextAlerted: AlertedMap = { ...prevAlerted };
    const notifications: Array<{ title: string; body: string; tag: string }> = [];

    const allowLow = prefs.lowNeed !== false;
    const allowCrit = prefs.critical !== false;
    const watchedStats = prefs.stats ?? {};

    for (const key of STAT_KEYS) {
      const val = Math.round(stats[key]);
      const prev = prevAlerted[key];
      const watched = watchedStats[key] !== false;

      if (val >= NEED_THRESHOLD) {
        nextAlerted[key] = 'none';
        continue;
      }

      if (val <= CRITICAL_THRESHOLD) {
        if (prev !== 'critical') {
          nextAlerted[key] = 'critical';
          if (watched && allowCrit) {
            notifications.push({
              title: `🚨 Oli’s ${STAT_LABELS[key]} is critical (${val})!`,
              body: LOW_MESSAGES[key].body(val),
              tag: `oli-need-${key}`,
            });
          }
        }
        continue;
      }

      if (prev === 'none') {
        nextAlerted[key] = 'low';
        if (watched && allowLow) {
          notifications.push({
            title: LOW_MESSAGES[key].title,
            body: LOW_MESSAGES[key].body(val),
            tag: `oli-need-${key}`,
          });
        }
      }
    }

    let nextWokeUpAlerted = Boolean(row.woke_up_alerted);
    if (snapshot.is_sleeping && !isSleeping && wokeNaturally && !nextWokeUpAlerted) {
      nextWokeUpAlerted = true;
      if (prefs.wakeUp !== false) {
        const name = snapshot.name || 'Oli';
        notifications.push({
          title: `☀️ ${name} woke up!`,
          body: `${name} woke up from his nap!`,
          tag: 'oli-wake',
        });
      }
    }

    let expired = false;
    for (const n of notifications) {
      try {
        await webpush.sendNotification(
          {
            endpoint: row.endpoint,
            keys: { p256dh: row.p256dh, auth: row.auth },
          },
          JSON.stringify({
            title: n.title,
            body: n.body,
            tag: n.tag,
            icon: row.icon_url || './pwa-192x192.png',
            badge: row.badge_url || './badge-96x96.png',
            url: row.app_url || './',
          }),
        );
        sentCount += 1;
      } catch (err: unknown) {
        const statusCode = (err as { statusCode?: number })?.statusCode;
        if (statusCode === 404 || statusCode === 410) {
          expired = true;
          break;
        }
      }
    }

    if (expired) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', row.endpoint);
      removedCount += 1;
      continue;
    }

    const alertedChanged = STAT_KEYS.some((k) => nextAlerted[k] !== prevAlerted[k]);
    if (alertedChanged || nextWokeUpAlerted !== Boolean(row.woke_up_alerted)) {
      await supabase
        .from('push_subscriptions')
        .update({ alerted: nextAlerted, woke_up_alerted: nextWokeUpAlerted })
        .eq('endpoint', row.endpoint);
    }
  }

  return new Response(
    JSON.stringify({ checked: rows?.length ?? 0, sent: sentCount, removed: removedCount }),
    { headers: { 'Content-Type': 'application/json' } },
  );
});
