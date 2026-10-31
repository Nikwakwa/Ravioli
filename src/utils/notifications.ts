import { STAT_META } from '../data/actions';
import { STAT_KEYS, type CatStats, type StatKey } from '../types';
import { NEED_THRESHOLD } from './decayEngine';

export const CRITICAL_THRESHOLD = 5;

const LS_ENABLED = 'ravioli:v1:notifications_enabled';
const LS_ALERTED = 'ravioli:v1:alerted_levels';

export type AlertLevel = 'none' | 'low' | 'critical';
export type AlertedMap = Record<StatKey, AlertLevel>;

export interface ImportantAlert {
  id: string;
  title: string;
  body: string;
  tag: string;
  tone: 'info' | 'partner' | 'warn';
}

const DEFAULT_ALERTED: AlertedMap = {
  hunger: 'none',
  hydration: 'none',
  happiness: 'none',
  energy: 'none',
  hygiene: 'none',
};

const LOW_MESSAGES: Record<StatKey, { title: string; body: (val: number) => string }> = {
  hunger: {
    title: '😿 Oli is getting hungry!',
    body: (v) => `Hunger dropped below ${NEED_THRESHOLD} (now ${v}). Time for wet food or a treat!`,
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

export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export function loadNotificationsEnabled(): boolean {
  try {
    return window.localStorage.getItem(LS_ENABLED) === 'true' && getNotificationPermission() === 'granted';
  } catch {
    return false;
  }
}

export function saveNotificationsEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(LS_ENABLED, enabled ? 'true' : 'false');
  } catch {
    // ignore storage errors
  }
}

export function loadAlertedMap(): AlertedMap {
  try {
    const raw = window.localStorage.getItem(LS_ALERTED);
    if (!raw) return { ...DEFAULT_ALERTED };
    const parsed = JSON.parse(raw) as Partial<AlertedMap>;
    const out: AlertedMap = { ...DEFAULT_ALERTED };
    for (const k of STAT_KEYS) {
      if (parsed[k] === 'low' || parsed[k] === 'critical' || parsed[k] === 'none') {
        out[k] = parsed[k];
      }
    }
    return out;
  } catch {
    return { ...DEFAULT_ALERTED };
  }
}

export function saveAlertedMap(map: AlertedMap): void {
  try {
    window.localStorage.setItem(LS_ALERTED, JSON.stringify(map));
  } catch {
    // ignore
  }
}

/**
 * Pure threshold-crossing detector.
 * Compares current `stats` against the previously alerted levels (`prevAlerted`):
 * - If a stat is >= NEED_THRESHOLD (25), its alert level resets to `'none'`.
 * - If a stat drops < NEED_THRESHOLD (25) and wasn't already `'low'` or `'critical'`, emits a low-need alert.
 * - If a stat drops <= CRITICAL_THRESHOLD (5) and wasn't already `'critical'`, emits a critical alert.
 */
export function evaluateStatThresholds(
  stats: CatStats,
  prevAlerted: AlertedMap,
): { nextAlerted: AlertedMap; alerts: ImportantAlert[] } {
  const nextAlerted: AlertedMap = { ...prevAlerted };
  const alerts: ImportantAlert[] = [];

  for (const key of STAT_KEYS) {
    const val = Math.round(stats[key]);
    const prev = prevAlerted[key] ?? 'none';

    if (val >= NEED_THRESHOLD) {
      nextAlerted[key] = 'none';
      continue;
    }

    if (val <= CRITICAL_THRESHOLD) {
      if (prev !== 'critical') {
        nextAlerted[key] = 'critical';
        const label = STAT_META[key].label;
        alerts.push({
          id: `crit-${key}`,
          title: `🚨 Oli’s ${label} is critical (${val})!`,
          body: `${LOW_MESSAGES[key].body(val)}`,
          tag: `oli-need-${key}`,
          tone: 'warn',
        });
      }
      continue;
    }

    // Between CRITICAL_THRESHOLD and NEED_THRESHOLD
    if (prev === 'none') {
      nextAlerted[key] = 'low';
      alerts.push({
        id: `low-${key}`,
        title: LOW_MESSAGES[key].title,
        body: LOW_MESSAGES[key].body(val),
        tag: `oli-need-${key}`,
        tone: 'warn',
      });
    }
  }

  return { nextAlerted, alerts };
}

/** Requests browser notification permission and enables notifications if granted. */
export async function enableNotifications(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  let perm = Notification.permission;
  if (perm === 'default') {
    perm = await Notification.requestPermission();
  }
  if (perm === 'granted') {
    saveNotificationsEnabled(true);
    return 'granted';
  }
  saveNotificationsEnabled(false);
  return 'denied';
}

/** Sends an OS/browser notification via the Service Worker (PWA) or Notification constructor. */
export async function sendSystemNotification(title: string, body: string, tag = 'oli-alert'): Promise<void> {
  if (!loadNotificationsEnabled()) return;
  const icon = `${import.meta.env.BASE_URL}pwa-192x192.png`;
  const badge = `${import.meta.env.BASE_URL}pwa-64x64.png`;

  try {
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.getRegistration();
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, {
          body,
          tag,
          icon,
          badge,
          renotify: true,
        } as NotificationOptions);
        return;
      }
    }
  } catch {
    // Fall back to standard Notification API below
  }

  try {
    new Notification(title, { body, tag, icon });
  } catch {
    // Ignore on restricted environments
  }
}
