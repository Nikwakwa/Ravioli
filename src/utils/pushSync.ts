import type { CatState } from '../types';
import { getNotificationAssetUrls, type AlertedMap, type NotificationPrefs } from './notifications';

const LS_PUSH_ENDPOINT = 'ravioli:v1:push_endpoint';

export interface PushSyncPayload {
  state: CatState;
  prefs: NotificationPrefs;
  alerted: AlertedMap;
  wokeUpAlerted: boolean;
}

export interface PushSubscriptionRecord {
  endpoint: string;
  p256dh: string;
  auth: string;
  prefs: NotificationPrefs;
  cat_snapshot: CatState;
  alerted: AlertedMap;
  woke_up_alerted: boolean;
  app_url: string;
  icon_url: string;
  badge_url: string;
  updated_at: string;
}

function getPushEnv(): { url: string; anonKey: string; vapidPublicKey: string } | null {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();
  const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY?.trim();
  if (!url || !anonKey || !vapidPublicKey) return null;
  return { url: url.replace(/\/+$/, ''), anonKey, vapidPublicKey };
}

export function isPushSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function isPushConfigured(): boolean {
  return getPushEnv() !== null;
}

export function isStandalonePwa(): boolean {
  if (typeof window === 'undefined') return false;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia?.('(display-mode: standalone)').matches === true || nav.standalone === true;
}

export function isIosDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
}

/** Converts a URL-safe base64 VAPID public key into a Uint8Array for PushManager.subscribe. */
export function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const outputArray = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i += 1) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export function buildPushRecord(
  endpoint: string,
  p256dh: string,
  auth: string,
  payload: PushSyncPayload,
  nowIso: string = new Date().toISOString(),
): PushSubscriptionRecord {
  const { icon, badge } = getNotificationAssetUrls();
  const appUrl =
    typeof window !== 'undefined' && window.location
      ? new URL(import.meta.env.BASE_URL || '/', window.location.origin).href
      : './';

  return {
    endpoint,
    p256dh,
    auth,
    prefs: payload.prefs,
    cat_snapshot: payload.state,
    alerted: payload.alerted,
    woke_up_alerted: payload.wokeUpAlerted,
    app_url: appUrl,
    icon_url: icon,
    badge_url: badge,
    updated_at: nowIso,
  };
}

function saveEndpoint(endpoint: string | null): void {
  try {
    if (endpoint) window.localStorage.setItem(LS_PUSH_ENDPOINT, endpoint);
    else window.localStorage.removeItem(LS_PUSH_ENDPOINT);
  } catch {
    // ignore storage errors
  }
}

export function getSavedPushEndpoint(): string | null {
  try {
    return window.localStorage.getItem(LS_PUSH_ENDPOINT);
  } catch {
    return null;
  }
}

async function upsertPushRecord(
  env: { url: string; anonKey: string },
  record: PushSubscriptionRecord,
): Promise<boolean> {
  const res = await fetch(`${env.url}/rest/v1/rpc/upsert_push_subscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.anonKey,
      Authorization: `Bearer ${env.anonKey}`,
    },
    body: JSON.stringify({
      p_endpoint: record.endpoint,
      p_p256dh: record.p256dh,
      p_auth: record.auth,
      p_prefs: record.prefs,
      p_cat_snapshot: record.cat_snapshot,
      p_alerted: record.alerted,
      p_woke_up_alerted: record.woke_up_alerted,
      p_app_url: record.app_url,
      p_icon_url: record.icon_url,
      p_badge_url: record.badge_url,
    }),
  });
  return res.ok;
}

export async function subscribeAndSyncPush(
  payload: PushSyncPayload,
): Promise<{ ok: boolean; reason?: string }> {
  if (!isPushSupported()) return { ok: false, reason: 'unsupported' };
  const env = getPushEnv();
  if (!env) return { ok: false, reason: 'unconfigured' };

  try {
    const reg = await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) {
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(env.vapidPublicKey),
      });
    }

    const json = sub.toJSON();
    const endpoint = sub.endpoint;
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!endpoint || !p256dh || !auth) {
      return { ok: false, reason: 'invalid_subscription' };
    }

    const record = buildPushRecord(endpoint, p256dh, auth, payload);
    const saved = await upsertPushRecord(env, record);
    if (!saved) return { ok: false, reason: 'server_error' };

    saveEndpoint(endpoint);
    return { ok: true };
  } catch {
    return { ok: false, reason: 'subscribe_failed' };
  }
}

export async function syncPushSnapshot(payload: PushSyncPayload): Promise<void> {
  if (!payload.prefs.enabled || !isPushSupported()) return;
  const env = getPushEnv();
  if (!env) return;

  try {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (!sub) return;

    const json = sub.toJSON();
    const p256dh = json.keys?.p256dh;
    const auth = json.keys?.auth;
    if (!sub.endpoint || !p256dh || !auth) return;

    const record = buildPushRecord(sub.endpoint, p256dh, auth, payload);
    const ok = await upsertPushRecord(env, record);
    if (ok) saveEndpoint(sub.endpoint);
  } catch {
    // Non-fatal: background push sync will retry on next action or app open
  }
}

let syncTimer: number | null = null;

/** Debounces snapshot uploads so rapid interactions (like petting) batch into one sync. */
export function schedulePushSync(payload: PushSyncPayload, delayMs = 1500): void {
  if (typeof window === 'undefined') return;
  if (syncTimer !== null) window.clearTimeout(syncTimer);
  syncTimer = window.setTimeout(() => {
    syncTimer = null;
    void syncPushSnapshot(payload);
  }, delayMs);
}

export async function unsubscribePush(): Promise<void> {
  if (typeof window !== 'undefined' && syncTimer !== null) {
    window.clearTimeout(syncTimer);
    syncTimer = null;
  }

  const env = getPushEnv();
  let endpoint = getSavedPushEndpoint();

  try {
    if (isPushSupported()) {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        endpoint = sub.endpoint;
        await sub.unsubscribe();
      }
    }
  } catch {
    // ignore unsubscribe errors
  }

  saveEndpoint(null);

  if (env && endpoint) {
    try {
      await fetch(`${env.url}/rest/v1/rpc/delete_push_subscription`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: env.anonKey,
          Authorization: `Bearer ${env.anonKey}`,
        },
        body: JSON.stringify({ p_endpoint: endpoint }),
      });
    } catch {
      // ignore network errors on cleanup
    }
  }
}
