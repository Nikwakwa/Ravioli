// Supabase Edge Function: checks subscribed Oli snapshots every ~5 minutes
// and sends Web Push alerts when needs drop below 25/5 or when Oli wakes up.

import { createClient } from 'npm:@supabase/supabase-js@2';

const encoder = new TextEncoder();

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

/** Rejects non-HTTPS endpoints, credentials, custom ports, internal hosts, and IP literals to prevent SSRF. */
function isSafePushEndpoint(endpoint: unknown): endpoint is string {
  if (typeof endpoint !== 'string' || endpoint.length < 20 || endpoint.length > 2048) return false;
  if (/\s/.test(endpoint)) return false;
  try {
    const u = new URL(endpoint);
    if (u.protocol !== 'https:') return false;
    if (u.username || u.password) return false;
    if (u.port !== '' && u.port !== '443') return false;
    const host = u.hostname.toLowerCase().replace(/\.+$/, '');
    if (
      !host ||
      !host.includes('.') ||
      host === 'localhost' ||
      host.endsWith('.localhost') ||
      host.endsWith('.local') ||
      host.endsWith('.internal') ||
      host.endsWith('.lan') ||
      host.endsWith('.home.arpa')
    ) {
      return false;
    }
    // Reject IPv4, numeric/hex/octal IP shorthands, and IPv6 literals.
    if (/^\d{1,3}(\.\d{1,3}){3}$/.test(host) || /^(0x[0-9a-f]+|\d+)$/i.test(host) || host.includes(':')) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function isValidPushKey(value: unknown, minLen: number, maxLen: number): value is string {
  return (
    typeof value === 'string' &&
    value.length >= minLen &&
    value.length <= maxLen &&
    /^[A-Za-z0-9+/=_-]+$/.test(value)
  );
}

function normalizeVapidSubject(raw?: string | null): string {
  const trimmed = raw?.trim() ?? '';
  if (!trimmed) return 'mailto:oli@ravioli.app';
  if (trimmed.startsWith('mailto:') || trimmed.startsWith('https://')) return trimmed;
  if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return `mailto:${trimmed}`;
  return 'mailto:oli@ravioli.app';
}

function base64ToBytes(raw: string): Uint8Array<ArrayBuffer> {
  const clean = raw.trim().replace(/\s+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  const padded = clean + '='.repeat((4 - (clean.length % 4)) % 4);
  const bin = atob(padded);
  const buf = new ArrayBuffer(bin.length);
  const out = new Uint8Array(buf);
  for (let i = 0; i < bin.length; i += 1) {
    out[i] = bin.charCodeAt(i);
  }
  return out;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.length; i += 1) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function normalizeP256PrivateScalar(raw: Uint8Array): Uint8Array<ArrayBuffer> {
  const buf = new ArrayBuffer(32);
  const out = new Uint8Array(buf);
  if (raw.length === 32) {
    out.set(raw);
    return out;
  }
  if (raw.length === 33 && raw[0] === 0) {
    out.set(raw.subarray(1, 33));
    return out;
  }
  if (raw.length > 0 && raw.length < 32) {
    out.set(raw, 32 - raw.length);
    return out;
  }
  throw new Error(`Invalid VAPID private key length (${raw.length})`);
}

function concatBytes(...chunks: Uint8Array[]): Uint8Array<ArrayBuffer> {
  const total = chunks.reduce((sum, c) => sum + c.length, 0);
  const buf = new ArrayBuffer(total);
  const out = new Uint8Array(buf);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

async function buildVapidAuthorization(
  endpoint: string,
  subject: string,
  vapidPublicKey: string,
  vapidPrivateKey: string,
  nowMs: number,
): Promise<string> {
  const pubBytes = base64ToBytes(vapidPublicKey);
  if (pubBytes.length !== 65 || pubBytes[0] !== 0x04) {
    throw new Error(`Invalid VAPID public key length (${pubBytes.length})`);
  }
  const privBytes = normalizeP256PrivateScalar(base64ToBytes(vapidPrivateKey));

  const jwk: JsonWebKey = {
    kty: 'EC',
    crv: 'P-256',
    x: bytesToBase64Url(pubBytes.subarray(1, 33)),
    y: bytesToBase64Url(pubBytes.subarray(33, 65)),
    d: bytesToBase64Url(privBytes),
    ext: true,
  };

  const signingKey = await crypto.subtle.importKey(
    'jwk',
    jwk,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false,
    ['sign'],
  );

  const headerPart = bytesToBase64Url(encoder.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claimsPart = bytesToBase64Url(
    encoder.encode(
      JSON.stringify({
        aud: new URL(endpoint).origin,
        exp: Math.floor(nowMs / 1000) + 12 * 3600,
        sub: normalizeVapidSubject(subject),
      }),
    ),
  );

  const signingInput = encoder.encode(`${headerPart}.${claimsPart}`);
  const signature = new Uint8Array(
    await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, signingKey, signingInput),
  );
  const jwt = `${headerPart}.${claimsPart}.${bytesToBase64Url(signature)}`;
  return `vapid t=${jwt}, k=${bytesToBase64Url(pubBytes)}`;
}

async function encryptPushPayload(
  plaintext: string,
  p256dh: string,
  auth: string,
): Promise<Uint8Array<ArrayBuffer>> {
  const uaPublic = base64ToBytes(p256dh);
  if (uaPublic.length !== 65 || uaPublic[0] !== 0x04) {
    throw new Error(`Invalid subscriber p256dh key length (${uaPublic.length})`);
  }
  const authSecret = base64ToBytes(auth);
  if (authSecret.length !== 16) {
    throw new Error(`Invalid subscriber auth secret length (${authSecret.length})`);
  }

  const plaintextBytes = encoder.encode(plaintext);
  const asKeyPair = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, [
    'deriveBits',
  ]);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', asKeyPair.publicKey));
  const uaPublicKey = await crypto.subtle.importKey(
    'raw',
    uaPublic,
    { name: 'ECDH', namedCurve: 'P-256' },
    false,
    [],
  );

  const ecdhSecret = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'ECDH', public: uaPublicKey }, asKeyPair.privateKey, 256),
  );

  const keyInfo = concatBytes(encoder.encode('WebPush: info\0'), uaPublic, asPublic);
  const ecdhHkdfKey = await crypto.subtle.importKey('raw', ecdhSecret, 'HKDF', false, ['deriveBits']);
  const ikm = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'HKDF', hash: 'SHA-256', salt: authSecret, info: keyInfo },
      ecdhHkdfKey,
      256,
    ),
  );

  const saltBuf = new ArrayBuffer(16);
  const salt = crypto.getRandomValues(new Uint8Array(saltBuf));
  const ikmHkdfKey = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, [
    'deriveKey',
    'deriveBits',
  ]);

  const cekKey = await crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt,
      info: encoder.encode('Content-Encoding: aes128gcm\0'),
    },
    ikmHkdfKey,
    { name: 'AES-GCM', length: 128 },
    false,
    ['encrypt'],
  );

  const nonce = new Uint8Array(
    await crypto.subtle.deriveBits(
      {
        name: 'HKDF',
        hash: 'SHA-256',
        salt,
        info: encoder.encode('Content-Encoding: nonce\0'),
      },
      ikmHkdfKey,
      96,
    ),
  );

  const paddedPlaintext = concatBytes(plaintextBytes, new Uint8Array([0x02]));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: nonce, tagLength: 128 },
      cekKey,
      paddedPlaintext,
    ),
  );

  const rsAndLen = new Uint8Array([0x00, 0x00, 0x10, 0x00, asPublic.length]);
  return concatBytes(salt, rsAndLen, asPublic, ciphertext);
}

async function sendWebPush(
  subscription: { endpoint: string; p256dh: string; auth: string },
  payloadJson: string,
  vapid: { subject: string; publicKey: string; privateKey: string },
  nowMs: number,
): Promise<{ ok: boolean; status: number; detail?: string }> {
  const [authorization, encryptedBody] = await Promise.all([
    buildVapidAuthorization(
      subscription.endpoint,
      vapid.subject,
      vapid.publicKey,
      vapid.privateKey,
      nowMs,
    ),
    encryptPushPayload(payloadJson, subscription.p256dh, subscription.auth),
  ]);

  const res = await fetch(subscription.endpoint, {
    method: 'POST',
    headers: {
      Authorization: authorization,
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      'Content-Length': String(encryptedBody.byteLength),
      TTL: '86400',
      Urgency: 'high',
    },
    body: encryptedBody,
    redirect: 'manual',
    signal: AbortSignal.timeout(10_000),
  });

  if (res.status >= 200 && res.status < 300) {
    return { ok: true, status: res.status };
  }
  const text = await res.text().catch(() => '');
  return { ok: false, status: res.status, detail: text.slice(0, 160) };
}

function isValidSnapshot(snapshot: unknown): snapshot is CatSnapshot {
  if (!snapshot || typeof snapshot !== 'object') return false;
  const s = snapshot as Record<string, unknown>;
  if (typeof s.last_updated_at !== 'string' || !Number.isFinite(Date.parse(s.last_updated_at))) return false;
  return STAT_KEYS.every((k) => typeof s[k] === 'number' && Number.isFinite(s[k]));
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

/** Constant-time equality over SHA-256 digests so secret length is never leaked by timing. */
async function timingSafeEqual(a: string, b: string): Promise<boolean> {
  const [ah, bh] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ]);
  const ab = new Uint8Array(ah);
  const bb = new Uint8Array(bh);
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
  const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY')?.trim();
  const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY')?.trim();
  const vapidSubject = normalizeVapidSubject(Deno.env.get('VAPID_SUBJECT'));
  const cronSecret = Deno.env.get('PUSH_CRON_SECRET')?.trim() ?? '';

  if (!supabaseUrl || !serviceRoleKey || !vapidPublicKey || !vapidPrivateKey) {
    return new Response(JSON.stringify({ error: 'Missing required environment secrets' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  // Fail-closed authorization: always require either Bearer <serviceRoleKey>
  // or (when PUSH_CRON_SECRET is configured) x-cron-secret / Bearer <PUSH_CRON_SECRET>.
  const headerSecret = req.headers.get('x-cron-secret')?.trim() ?? '';
  const authHeader = req.headers.get('authorization')?.trim() ?? '';
  const bearer = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : '';

  const serviceMatch = bearer.length > 0 && (await timingSafeEqual(bearer, serviceRoleKey));
  const cronMatch =
    cronSecret.length > 0 &&
    ((headerSecret.length > 0 && (await timingSafeEqual(headerSecret, cronSecret))) ||
      (bearer.length > 0 && (await timingSafeEqual(bearer, cronSecret))));

  if (!serviceMatch && !cronMatch) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: JSON_HEADERS,
    });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const { data: rows, error } = await supabase
    .from('push_subscriptions')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(500);
  if (error) {
    return new Response(JSON.stringify({ error: 'Database query failed' }), {
      status: 500,
      headers: JSON_HEADERS,
    });
  }

  const nowMs = Date.now();
  let sentCount = 0;
  let failedCount = 0;
  let removedCount = 0;
  const errors: string[] = [];

  for (const row of rows ?? []) {
    if (
      !isSafePushEndpoint(row.endpoint) ||
      !isValidPushKey(row.p256dh, 20, 256) ||
      !isValidPushKey(row.auth, 10, 128)
    ) {
      await supabase.from('push_subscriptions').delete().eq('endpoint', row.endpoint);
      removedCount += 1;
      continue;
    }

    const prefs = row.prefs ?? {};
    const snapshot = row.cat_snapshot;
    if (!prefs.enabled || !isValidSnapshot(snapshot) || snapshot.paused_at || snapshot.deceased_at) continue;

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
    const endpointHost = (() => {
      try {
        return new URL(row.endpoint).hostname;
      } catch {
        return 'unknown';
      }
    })();

    let expired = false;
    for (const n of notifications) {
      try {
        const result = await sendWebPush(
          {
            endpoint: row.endpoint,
            p256dh: row.p256dh,
            auth: row.auth,
          },
          JSON.stringify({
            title: n.title,
            body: n.body,
            tag: n.tag,
            icon: safeIcon,
            badge: safeBadge,
            url: safeUrl,
          }),
          {
            subject: vapidSubject,
            publicKey: vapidPublicKey,
            privateKey: vapidPrivateKey,
          },
          nowMs,
        );

        if (result.ok) {
          n.onSuccess();
          sentCount += 1;
        } else if (result.status === 404 || result.status === 410) {
          expired = true;
          break;
        } else {
          failedCount += 1;
          const summary = `${endpointHost}: HTTP ${result.status}${result.detail ? ` (${result.detail})` : ''}`;
          console.error('Web Push delivery failed:', summary);
          if (errors.length < 5) errors.push(summary);
        }
      } catch (err: unknown) {
        failedCount += 1;
        const message = err instanceof Error ? err.message : String(err);
        const summary = `${endpointHost}: ${message.slice(0, 120)}`;
        console.error('Web Push exception:', summary);
        if (errors.length < 5) errors.push(summary);
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
    JSON.stringify({
      checked: rows?.length ?? 0,
      sent: sentCount,
      failed: failedCount,
      removed: removedCount,
      ...(errors.length > 0 ? { errors } : {}),
    }),
    { headers: JSON_HEADERS },
  );
});
