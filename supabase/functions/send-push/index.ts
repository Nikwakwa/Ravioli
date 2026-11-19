// Supabase Edge Function: checks subscribed Oli snapshots every ~5 minutes
// and sends Web Push alerts when needs drop below 25/5 or when Oli wakes up.

import { createClient } from 'npm:@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const STAT_KEYS = ['hunger', 'hydration', 'happiness', 'energy', 'hygiene'] as const;
type StatKey = (typeof STAT_KEYS)[number];
type LifeStage = 'newborn' | 'kitten' | 'teen' | 'adult';
type AlertLevel = 'none' | 'low' | 'critical';
type AlertedMap = Record<StatKey, AlertLevel>;

const STAGE_THRESHOLDS: Record<LifeStage, number> = {
  newborn: 0,
  kitten: 72,
  teen: 216,
  adult: 432,
};

const STAGE_DECAY_RATES: Record<
  LifeStage,
  { awake: Record<StatKey, number>; sleeping: Record<StatKey, number> }
> = {
  newborn: {
    awake: { hunger: -7.5, hydration: -7, happiness: -4, energy: -6.5, hygiene: -1.5 },
    sleeping: { hunger: -3, hydration: -7, happiness: -4, energy: 20, hygiene: -1 },
  },
  kitten: {
    awake: { hunger: -6.5, hydration: -8, happiness: -5.5, energy: -5, hygiene: -2 },
    sleeping: { hunger: -3, hydration: -8, happiness: -5, energy: 18, hygiene: -1 },
  },
  teen: {
    awake: { hunger: -6.5, hydration: -8, happiness: -5.5, energy: -4.5, hygiene: -2 },
    sleeping: { hunger: -3, hydration: -8, happiness: -5, energy: 16, hygiene: -1 },
  },
  adult: {
    awake: { hunger: -6, hydration: -8, happiness: -5, energy: -4, hygiene: -2 },
    sleeping: { hunger: -3, hydration: -8, happiness: -5, energy: 15, hygiene: -1 },
  },
};

const MIN_NAP_HOURS = 0.25;
const MAX_ELAPSED_HOURS = 24 * 90;
const NEED_THRESHOLD = 25;
const CRITICAL_THRESHOLD = 5;
const NEGLECT_DEATH_HOURS = 48;
const MS_PER_HOUR = 3_600_000;

const JSON_HEADERS = { 'Content-Type': 'application/json' };

const STAT_LABELS: Record<StatKey, string> = {
  hunger: 'Food',
  hydration: 'Water',
  happiness: 'Joy',
  energy: 'Energy',
  hygiene: 'Clean',
};

function lowMessage(key: StatKey, val: number, stage: LifeStage): { title: string; body: string } {
  switch (key) {
    case 'hunger':
      return {
        title: '😿 Oli is getting hungry!',
        body:
          stage === 'newborn'
            ? `Food dropped below ${NEED_THRESHOLD} (now ${val}). Time for warm Kitten Milk!`
            : `Food dropped below ${NEED_THRESHOLD} (now ${val}). Time for wet food or a treat!`,
      };
    case 'hydration':
      return {
        title: '💧 Oli needs fresh water!',
        body: `Water dropped below ${NEED_THRESHOLD} (now ${val}). Refresh his fountain!`,
      };
    case 'happiness':
      return {
        title: '🥺 Oli wants attention!',
        body:
          stage === 'newborn'
            ? `Joy dropped below ${NEED_THRESHOLD} (now ${val}). Give baby Oli warm cuddles!`
            : `Joy dropped below ${NEED_THRESHOLD} (now ${val}). Give him chin scratches or play!`,
      };
    case 'energy':
      return {
        title: '🥱 Oli is getting sleepy!',
        body: `Energy dropped below ${NEED_THRESHOLD} (now ${val}). Tuck him into Nap Mode!`,
      };
    case 'hygiene':
      return {
        title: '🪮 Oli needs a brush!',
        body: `Cleanliness dropped below ${NEED_THRESHOLD} (now ${val}). Brush his ginger coat!`,
      };
  }
}

function clampStat(v: number): number {
  if (!Number.isFinite(v)) return 0;
  return Math.min(100, Math.max(0, v));
}

function resolveStage(growthHours: unknown): LifeStage {
  const n = typeof growthHours === 'string' ? Number(growthHours) : growthHours;
  const h = typeof n === 'number' && Number.isFinite(n) ? Math.min(STAGE_THRESHOLDS.adult, Math.max(0, n)) : STAGE_THRESHOLDS.adult;
  if (h >= STAGE_THRESHOLDS.adult) return 'adult';
  if (h >= STAGE_THRESHOLDS.teen) return 'teen';
  if (h >= STAGE_THRESHOLDS.kitten) return 'kitten';
  return 'newborn';
}

function hoursUntilNaturalWake(energy: number, stage: LifeStage): number {
  const toFull = (100 - clampStat(energy)) / STAGE_DECAY_RATES[stage].sleeping.energy;
  return Math.max(toFull, MIN_NAP_HOURS);
}

function hoursUntilBothZero(stats: Record<StatKey, number>, isSleeping: boolean, stage: LifeStage): number {
  const rates = STAGE_DECAY_RATES[stage];
  const hoursHydration = stats.hydration / Math.abs(rates.awake.hydration);
  const napHours = isSleeping ? hoursUntilNaturalWake(stats.energy, stage) : 0;
  const hungerLostNap = napHours * Math.abs(rates.sleeping.hunger);
  const hungerAfterNap = Math.max(0, stats.hunger - hungerLostNap);
  const hoursHunger = napHours + hungerAfterNap / Math.abs(rates.awake.hunger);
  return Math.max(hoursHydration, hoursHunger);
}

/** Rejects non-HTTPS endpoints, localhost, and raw IP literals to prevent SSRF. */
function isSafePushEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== 'string' || endpoint.length < 20 || endpoint.length > 2048) return false;
  try {
    const u = new URL(endpoint);
    if (u.protocol !== 'https:') return false;
    const host = u.hostname.toLowerCase();
    if (!host || host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) return false;
    // Reject IPv4 and IPv6 literals (Web Push services always use public hostnames).
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || host.includes(':')) return false;
    return true;
  } catch {
    return false;
  }
}

function safePayloadUrl(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string' || raw.length === 0 || raw.length > 512) return fallback;
  if (raw.startsWith('./')) return raw;
  try {
    const u = new URL(raw);
    if (u.protocol === 'https:') return u.href;
  } catch {
    // invalid URL
  }
  return fallback;
}

function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  if (ab.length !== bb.length) return false;
  let diff = 0;
  for (let i = 0; i < ab.length; i += 1) {
    diff |= ab[i] ^ bb[i];
  }
  return diff === 0;
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
  growth_hours?: number | null;
}

function computeLive(base: CatSnapshot, nowMs: number) {
  const fromMs = Date.parse(base.last_updated_at);
  const hours = Number.isFinite(fromMs) && nowMs > fromMs ? Math.min((nowMs - fromMs) / MS_PER_HOUR, MAX_ELAPSED_HOURS) : 0;
  const stage = resolveStage(base.growth_hours);
  const rates = STAGE_DECAY_RATES[stage];

  const stats: Record<StatKey, number> = {
    hunger: clampStat(base.hunger),
    hydration: clampStat(base.hydration),
    happiness: clampStat(base.happiness),
    energy: clampStat(base.energy),
    hygiene: clampStat(base.hygiene),
  };

  let isSleeping = Boolean(base.is_sleeping);
  let wokeNaturally = false;

  const timeToBothZero = hoursUntilBothZero(stats, isSleeping, stage);
  const isDeceased = hours >= timeToBothZero + NEGLECT_DEATH_HOURS;

  if (isDeceased) {
    for (const k of STAT_KEYS) stats[k] = 0;
    return { stats, isSleeping: false, wokeNaturally: false, isDeceased: true, stage };
  }

  if (isSleeping) {
    const wakeIn = hoursUntilNaturalWake(stats.energy, stage);
    if (hours < wakeIn) {
      for (const k of STAT_KEYS) stats[k] = clampStat(stats[k] + rates.sleeping[k] * hours);
    } else {
      for (const k of STAT_KEYS) stats[k] = clampStat(stats[k] + rates.sleeping[k] * wakeIn);
      isSleeping = false;
      wokeNaturally = true;
      const rem = hours - wakeIn;
      for (const k of STAT_KEYS) stats[k] = clampStat(stats[k] + rates.awake[k] * rem);
    }
  } else {
    for (const k of STAT_KEYS) stats[k] = clampStat(stats[k] + rates.awake[k] * hours);
  }

  return { stats, isSleeping, wokeNaturally, isDeceased: false, stage };
}

Deno.serve(async (req: Request) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: JSON_HEADERS,
    });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY');
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY');
  const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:oli@ravioli.app';
  const cronSecret = Deno.env.get('PUSH_CRON_SECRET')?.trim();

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    return new Response(JSON.stringify({ error: 'Missing required environment secrets' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  // Optional shared secret lock-down: if PUSH_CRON_SECRET is set, require either
  // x-cron-secret: <secret>, Authorization: Bearer <secret>, or Bearer <serviceRoleKey>.
  if (cronSecret) {
    const headerSecret = req.headers.get('x-cron-secret')?.trim() ?? '';
    const authHeader = req.headers.get('authorization')?.trim() ?? '';
    const bearer = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';
    const authorized =
      (headerSecret.length > 0 && timingSafeEqual(headerSecret, cronSecret)) ||
      (bearer.length > 0 && (timingSafeEqual(bearer, cronSecret) || timingSafeEqual(bearer, serviceRoleKey)));
    if (!authorized) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: JSON_HEADERS,
      });
    }
  }

  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: rows, error } = await supabase.from('push_subscriptions').select('*');
  if (error) {
    return new Response(JSON.stringify({ error: 'Database query failed' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  const nowMs = Date.now();
  let sentCount = 0;
  let removedCount = 0;

  for (const row of rows ?? []) {
    if (!isSafePushEndpoint(row.endpoint)) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', row.endpoint);
      removedCount += 1;
      continue;
    }

    const prefs = row.prefs ?? {};
    const snapshot = row.cat_snapshot as CatSnapshot | undefined;
    if (!prefs.enabled || !snapshot || snapshot.paused_at || snapshot.deceased_at) continue;

    const { stats, isSleeping, wokeNaturally, isDeceased, stage } = computeLive(snapshot, nowMs);
    const prevAlerted: AlertedMap = {
      hunger: row.alerted?.hunger ?? 'none',
      hydration: row.alerted?.hydration ?? 'none',
      happiness: row.alerted?.happiness ?? 'none',
      energy: row.alerted?.energy ?? 'none',
      hygiene: row.alerted?.hygiene ?? 'none',
    };
    const nextAlerted: AlertedMap = { ...prevAlerted };
    const notifications: Array<{
      title: string;
      body: string;
      tag: string;
      onSuccess: () => void;
    }> = [];

    let nextWokeUpAlerted = Boolean(row.woke_up_alerted);

    if (isDeceased) {
      // Send a single emergency alert if not already marked critical across both hunger & hydration.
      if (prevAlerted.hunger !== 'critical' || prevAlerted.hydration !== 'critical') {
        notifications.push({
          title: '🚨 Oli needs you!',
          body: 'Oli was left alone too long. Open the app to revive him.',
          tag: 'oli-emergency',
          onSuccess: () => {
            nextAlerted.hunger = 'critical';
            nextAlerted.hydration = 'critical';
          },
        });
      }
    } else {
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
            if (watched && allowCrit) {
              const msg = lowMessage(key, val, stage);
              notifications.push({
                title: `🚨 Oli’s ${STAT_LABELS[key]} is critical (${val})!`,
                body: msg.body,
                tag: `oli-need-${key}`,
                onSuccess: () => {
                  nextAlerted[key] = 'critical';
                },
              });
            } else {
              nextAlerted[key] = 'critical';
            }
          }
          continue;
        }

        if (prev === 'none') {
          if (watched && allowLow) {
            const msg = lowMessage(key, val, stage);
            notifications.push({
              title: msg.title,
              body: msg.body,
              tag: `oli-need-${key}`,
              onSuccess: () => {
                nextAlerted[key] = 'low';
              },
            });
          } else {
            nextAlerted[key] = 'low';
          }
        }
      }

      if (snapshot.is_sleeping && !isSleeping && wokeNaturally && !nextWokeUpAlerted) {
        if (prefs.wakeUp !== false) {
          notifications.push({
            title: '☀️ Oli woke up!',
            body: 'Oli woke up from his nap!',
            tag: 'oli-wake',
            onSuccess: () => {
              nextWokeUpAlerted = true;
            },
          });
        } else {
          nextWokeUpAlerted = true;
        }
      }
    }

    const safeIcon = safePayloadUrl(row.icon_url, './pwa-192x192.png');
    const safeBadge = safePayloadUrl(row.badge_url, './badge-96x96.png');
    const safeUrl = safePayloadUrl(row.app_url, './');

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
            icon: safeIcon,
            badge: safeBadge,
            url: safeUrl,
          }),
        );
        n.onSuccess();
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
    { headers: JSON_HEADERS },
  );
});
