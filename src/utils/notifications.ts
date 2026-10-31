import { STAT_META } from '../data/actions';
import { STAT_KEYS, type CatStats, type StatKey } from '../types';
import { NEED_THRESHOLD } from './decayEngine';

export const CRITICAL_THRESHOLD = 5;

const LS_ENABLED = 'ravioli:v1:notifications_enabled';
const LS_PREFS = 'ravioli:v1:notification_prefs';
const LS_ALERTED = 'ravioli:v1:alerted_levels';

export type AlertLevel = 'none' | 'low' | 'critical';
export type AlertedMap = Record<StatKey, AlertLevel>;

export interface NotificationPrefs {
  /** Master switch (also requires browser permission === 'granted'). */
  enabled: boolean;
  /** Alert when a watched stat drops below NEED_THRESHOLD (25). */
  lowNeed: boolean;
  /** Urgent alert when a watched stat drops to CRITICAL_THRESHOLD (5) or below. */
  critical: boolean;
  /** Alert when Oli finishes his nap (Energy reaches 100) and wakes up naturally. */
  wakeUp: boolean;
  /** Alert when your co-op partner performs an action while the app is in the background. */
  partner: boolean;
  /** Which of the 5 stats should trigger lowNeed / critical alerts. */
  stats: Record<StatKey, boolean>;
}

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  enabled: false,
  lowNeed: true,
  critical: true,
  wakeUp: true,
  partner: true,
  stats: {
    hunger: true,
    hydration: true,
    happiness: true,
    energy: true,
    hygiene: true,
  },
};

export interface ImportantAlert {
  id: string;
  stat: StatKey;
  level: 'low' | 'critical';
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

export function loadNotificationPrefs(): NotificationPrefs {
  try {
    const granted = getNotificationPermission() === 'granted';
    const raw = window.localStorage.getItem(LS_PREFS);
    if (!raw) {
      const legacyEnabled = window.localStorage.getItem(LS_ENABLED) === 'true';
      return {
        ...DEFAULT_NOTIFICATION_PREFS,
        enabled: legacyEnabled && granted,
        stats: { ...DEFAULT_NOTIFICATION_PREFS.stats },
      };
    }
    const parsed = JSON.parse(raw) as Partial<NotificationPrefs>;
    const stats: Record<StatKey, boolean> = { ...DEFAULT_NOTIFICATION_PREFS.stats };
    if (parsed.stats && typeof parsed.stats === 'object') {
      for (const k of STAT_KEYS) {
        if (typeof parsed.stats[k] === 'boolean') stats[k] = parsed.stats[k]!;
      }
    }
    return {
      enabled: Boolean(parsed.enabled) && granted,
      lowNeed: typeof parsed.lowNeed === 'boolean' ? parsed.lowNeed : true,
      critical: typeof parsed.critical === 'boolean' ? parsed.critical : true,
      wakeUp: typeof parsed.wakeUp === 'boolean' ? parsed.wakeUp : true,
      partner: typeof parsed.partner === 'boolean' ? parsed.partner : true,
      stats,
    };
  } catch {
    return { ...DEFAULT_NOTIFICATION_PREFS, stats: { ...DEFAULT_NOTIFICATION_PREFS.stats } };
  }
}

export function saveNotificationPrefs(prefs: NotificationPrefs): void {
  try {
    window.localStorage.setItem(LS_PREFS, JSON.stringify(prefs));
    window.localStorage.setItem(LS_ENABLED, prefs.enabled ? 'true' : 'false');
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
 * Compares current `stats` against the previously alerted levels (`prevAlerted`),
 * filtering emitted alerts by `prefs` (if provided) so the user only receives
 * the alert levels and stats they opted into.
 */
export function evaluateStatThresholds(
  stats: CatStats,
  prevAlerted: AlertedMap,
  prefs?: Pick<NotificationPrefs, 'lowNeed' | 'critical' | 'stats'>,
): { nextAlerted: AlertedMap; alerts: ImportantAlert[] } {
  const nextAlerted: AlertedMap = { ...prevAlerted };
  const alerts: ImportantAlert[] = [];

  const allowLow = prefs ? prefs.lowNeed : true;
  const allowCrit = prefs ? prefs.critical : true;
  const allowedStats = prefs?.stats;

  for (const key of STAT_KEYS) {
    const val = Math.round(stats[key]);
    const prev = prevAlerted[key] ?? 'none';
    const statWatched = allowedStats ? allowedStats[key] !== false : true;

    if (val >= NEED_THRESHOLD) {
      nextAlerted[key] = 'none';
      continue;
    }

    if (val <= CRITICAL_THRESHOLD) {
      if (prev !== 'critical') {
        nextAlerted[key] = 'critical';
        if (statWatched && allowCrit) {
          const label = STAT_META[key].label;
          alerts.push({
            id: `crit-${key}`,
            stat: key,
            level: 'critical',
            title: `🚨 Oli’s ${label} is critical (${val})!`,
            body: `${LOW_MESSAGES[key].body(val)}`,
            tag: `oli-need-${key}`,
            tone: 'warn',
          });
        }
      }
      continue;
    }

    // Between CRITICAL_THRESHOLD and NEED_THRESHOLD
    if (prev === 'none') {
      nextAlerted[key] = 'low';
      if (statWatched && allowLow) {
        alerts.push({
          id: `low-${key}`,
          stat: key,
          level: 'low',
          title: LOW_MESSAGES[key].title,
          body: LOW_MESSAGES[key].body(val),
          tag: `oli-need-${key}`,
          tone: 'warn',
        });
      }
    }
  }

  return { nextAlerted, alerts };
}

/** Requests browser notification permission and returns the resulting status. */
export async function requestNotificationAccess(): Promise<'granted' | 'denied' | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  let perm = Notification.permission;
  if (perm === 'default') {
    perm = await Notification.requestPermission();
  }
  return perm === 'granted' ? 'granted' : 'denied';
}

/** Sends an OS/browser notification via the Service Worker (PWA) or Notification constructor. */
export async function sendSystemNotification(title: string, body: string, tag = 'oli-alert'): Promise<void> {
  const prefs = loadNotificationPrefs();
  if (!prefs.enabled) return;
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
