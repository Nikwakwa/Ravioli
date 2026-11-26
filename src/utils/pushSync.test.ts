import { describe, expect, it } from 'vitest';
import { createDefaultCatState } from './decayEngine';
import { DEFAULT_NOTIFICATION_PREFS, loadNotificationPrefs, saveNotificationPrefs } from './notifications';
import { buildPushRecord, bytesToBase64Url, normalizePushKey, urlBase64ToUint8Array } from './pushSync';

describe('urlBase64ToUint8Array & push key helpers', () => {
  it('decodes URL-safe base64 strings into raw bytes', () => {
    // "Hello" in base64url is "SGVsbG8"
    const bytes = urlBase64ToUint8Array('SGVsbG8');
    expect(Array.from(bytes)).toEqual([72, 101, 108, 108, 111]);
    expect(bytesToBase64Url(bytes)).toBe('SGVsbG8');
  });

  it('handles - and _ URL-safe characters and normalizes standard base64 keys', () => {
    const bytes = urlBase64ToUint8Array('_-8');
    expect(Array.from(bytes)).toEqual([255, 239]);
    expect(normalizePushKey(' ab+cd/ef== ')).toBe('ab-cd_ef');
  });
});

describe('buildPushRecord', () => {
  it('builds a Supabase push_subscriptions record with normalized keys and alert state', () => {
    const state = createDefaultCatState();
    const record = buildPushRecord(
      'https://push.example/sub/123',
      'p256dh+key/with=pad==',
      'auth+key/1==',
      {
        state,
        prefs: { ...DEFAULT_NOTIFICATION_PREFS, enabled: true },
        alerted: {
          hunger: 'none',
          hydration: 'low',
          happiness: 'none',
          energy: 'none',
          hygiene: 'none',
        },
        wokeUpAlerted: false,
      },
      '2026-11-14T09:00:00.000Z',
    );

    expect(record.endpoint).toBe('https://push.example/sub/123');
    expect(record.p256dh).toBe('p256dh-key_with=pad');
    expect(record.auth).toBe('auth-key_1');
    expect(record.prefs.enabled).toBe(true);
    expect(record.cat_snapshot.name).toBe('Oli');
    expect(record.alerted.hydration).toBe('low');
    expect(record.woke_up_alerted).toBe(false);
    expect(record.updated_at).toBe('2026-11-14T09:00:00.000Z');
  });
});

describe('loadNotificationPrefs auto-recovery', () => {
  it('auto-restores enabled: true when browser permission is granted and storage was cleared, while respecting explicit mute', () => {
    const store = new Map<string, string>();
    const mockStorage = {
      getItem: (k: string) => store.get(k) ?? null,
      setItem: (k: string, v: string) => store.set(k, String(v)),
      removeItem: (k: string) => store.delete(k),
    };

    const prevWin = (globalThis as { window?: unknown }).window;
    const prevNotif = (globalThis as { Notification?: unknown }).Notification;
    try {
      Object.defineProperty(globalThis, 'window', {
        value: { localStorage: mockStorage, Notification: { permission: 'granted' } },
        configurable: true,
        writable: true,
      });
      Object.defineProperty(globalThis, 'Notification', {
        value: { permission: 'granted' },
        configurable: true,
        writable: true,
      });

      // Cleared storage + granted browser permission -> automatically enabled & persisted
      const recovered = loadNotificationPrefs();
      expect(recovered.enabled).toBe(true);
      expect(store.get('ravioli:v1:notifications_enabled')).toBe('true');

      // Explicit mute in app -> stays muted even though browser permission is still granted
      saveNotificationPrefs({ ...recovered, enabled: false });
      expect(loadNotificationPrefs().enabled).toBe(false);
    } finally {
      Object.defineProperty(globalThis, 'window', { value: prevWin, configurable: true, writable: true });
      Object.defineProperty(globalThis, 'Notification', { value: prevNotif, configurable: true, writable: true });
    }
  });
});
