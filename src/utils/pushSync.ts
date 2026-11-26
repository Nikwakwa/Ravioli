import type { CatState } from '../types';
import { timeoutSignal } from './net';
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
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return null;
    return { url: parsed.origin, anonKey, vapidPublicKey };
  } catch {
    return null;
  }
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

/** Converts raw bytes into a URL-safe base64 string (no padding). */
export function bytesToBase64Url(input: ArrayBuffer | Uint8Array): string {
  const bytes = input instanceof Uint8Array ? input : new Uint8Array(input);
  let binary = '';
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/** Normalizes standard or URL-safe base64 push keys into clean URL-safe base64. */
export function normalizePushKey(raw: string): string {
  return raw.trim().replace(/\s+/g, '').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function extractSubscriptionKeys(sub: PushSubscription): { p256dh: string; auth: string } | null {
  const json = typeof sub.toJSON === 'function' ? sub.toJSON() : undefined;
  let p256dh = json?.keys?.p256dh ? normalizePushKey(json.keys.p256dh) : '';
  let auth = json?.keys?.auth ? normalizePushKey(json.keys.auth) : '';

  if ((!p256dh || !auth) && typeof sub.getKey === 'function') {
    const rawP256dh = sub.getKey('p256dh');
    const rawAuth = sub.getKey('auth');
    if (!p256dh && rawP256dh) p256dh = bytesToBase64Url(rawP256dh);
    if (!auth && rawAuth) auth = bytesToBase64Url(rawAuth);
  }

  if (!p256dh || !auth) return null;
  return { p256dh, auth };
}

function hasMatchingServerKey(sub: PushSubscription, expectedKey: Uint8Array): boolean {
  const actualBuf = sub.options?.applicationServerKey;
  if (!actualBuf) return true;
  const actual = new Uint8Array(actualBuf);
  if (actual.length !== expectedKey.length) return false;
  for (let i = 0; i < actual.length; i += 1) {
    if (actual[i] !== expectedKey[i]) return false;
  }
  return true;
}

async function getReadyServiceWorker(timeoutMs = 8000): Promise<ServiceWorkerRegistration | null> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      navigator.serviceWorker.ready,
      new Promise<null>((resolve) => {
        timer = setTimeout(() => resolve(null), timeoutMs);
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
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
    p256dh: normalizePushKey(p256dh),
    auth: normalizePushKey(auth),
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
    if (typeof window === 'undefined') return;
    if (endpoint) window.localStorage.setItem(LS_PUSH_ENDPOINT, endpoint);
    else window.localStorage.removeItem(LS_PUSH_ENDPOINT);
  } catch {
    // ignore storage errors
  }
}

export function getSavedPushEndpoint(): string | null {
  try {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(LS_PUSH_ENDPOINT);
  } catch {
    return null;
  }
}

async function upsertPushRecord(
  env: { url: string; anonKey: string },
  record: PushSubscriptionRecord,
): Promise<boolean> {
  const body = JSON.stringify({
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
  });

  const res = await fetch(`${env.url}/rest/v1/rpc/upsert_push_subscription`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: env.anonKey,
      Authorization: `Bearer ${env.anonKey}`,
    },
    body,
    keepalive: body.length < 32_768,
    signal: timeoutSignal(8000),
  });
  return res.ok;
}

export async function subscribeAndSyncPush(
  payload: PushSyncPayload,
): Promise<{ ok: boolean; reason?: string }> {
  if (!isPushSupported()) {
    if (isIosDevice() && !isStandalonePwa()) {
      return { ok: false, reason: 'ios_install_required' };
    }
    return { ok: false, reason: 'unsupported' };
  }
  const env = getPushEnv();
  if (!env) return { ok: false, reason: 'unconfigured' };

  try {
    const reg = await getReadyServiceWorker();
    if (!reg) return { ok: false, reason: 'sw_timeout' };

    const applicationServerKey = urlBase64ToUint8Array(env.vapidPublicKey);
    let sub = await reg.pushManager.getSubscription();

    // If an older subscription used a different VAPID key, replace it cleanly.
    if (sub && !hasMatchingServerKey(sub, applicationServerKey)) {
      const oldEndpoint = sub.endpoint;
      await sub.unsubscribe().catch(() => undefined);
      if (oldEndpoint) {
        void fetch(`${env.url}/rest/v1/rpc/delete_push_subscription`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: env.anonKey,
            Authorization: `Bearer ${env.anonKey}`,
          },
          body: JSON.stringify({ p_endpoint: oldEndpoint }),
          keepalive: true,
          signal: timeoutSignal(6000),
        }).catch(() => undefined);
      }
      sub = null;
    }

    if (!sub) {
      if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
        return { ok: false, reason: 'permission_denied' };
      }
      try {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      } catch {
        const stale = await reg.pushManager.getSubscription();
        if (stale) await stale.unsubscribe().catch(() => undefined);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }
    }

    const endpoint = sub.endpoint;
    const keys = extractSubscriptionKeys(sub);
    if (!endpoint || !keys) {
      return { ok: false, reason: 'invalid_subscription' };
    }

    const record = buildPushRecord(endpoint, keys.p256dh, keys.auth, payload);
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
  await subscribeAndSyncPush(payload);
}

let syncTimer: number | null = null;
let pendingPayload: PushSyncPayload | null = null;
let flushListenersAttached = false;

export function flushPendingPushSync(): void {
  if (typeof window !== 'undefined' && syncTimer !== null) {
    window.clearTimeout(syncTimer);
    syncTimer = null;
  }
  if (!pendingPayload) return;
  const payload = pendingPayload;
  pendingPayload = null;
  void syncPushSnapshot(payload);
}

function ensureFlushListeners(): void {
  if (flushListenersAttached || typeof window === 'undefined' || typeof document === 'undefined') return;
  flushListenersAttached = true;
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushPendingPushSync();
    }
  });
  window.addEventListener('pagehide', () => {
    flushPendingPushSync();
  });
}

/** Debounces snapshot uploads while batching rapid taps, and flushes immediately if the app is backgrounded. */
export function schedulePushSync(payload: PushSyncPayload, delayMs = 1200): void {
  if (typeof window === 'undefined') return;
  if (syncTimer !== null) {
    window.clearTimeout(syncTimer);
    syncTimer = null;
  }
  if (!payload.prefs.enabled) {
    pendingPayload = null;
    return;
  }
  ensureFlushListeners();
  pendingPayload = payload;
  syncTimer = window.setTimeout(() => {
    syncTimer = null;
    pendingPayload = null;
    void syncPushSnapshot(payload);
  }, delayMs);
}

export async function unsubscribePush(): Promise<void> {
  pendingPayload = null;
  if (typeof window !== 'undefined' && syncTimer !== null) {
    window.clearTimeout(syncTimer);
    syncTimer = null;
  }

  const env = getPushEnv();
  let endpoint = getSavedPushEndpoint();

  try {
    if (isPushSupported()) {
      const reg = await getReadyServiceWorker(4000);
      const sub = await reg?.pushManager.getSubscription();
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
        keepalive: true,
        signal: timeoutSignal(6000),
      });
    } catch {
      // ignore network errors on cleanup
    }
  }
}
