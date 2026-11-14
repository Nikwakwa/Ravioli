import { describe, expect, it } from 'vitest';
import { createDefaultCatState } from './decayEngine';
import { DEFAULT_NOTIFICATION_PREFS } from './notifications';
import { buildPushRecord, urlBase64ToUint8Array } from './pushSync';

describe('urlBase64ToUint8Array', () => {
  it('decodes URL-safe base64 strings into raw bytes', () => {
    // "Hello" in base64url is "SGVsbG8"
    const bytes = urlBase64ToUint8Array('SGVsbG8');
    expect(Array.from(bytes)).toEqual([72, 101, 108, 108, 111]);
  });

  it('handles - and _ URL-safe characters', () => {
    const bytes = urlBase64ToUint8Array('_-8');
    expect(Array.from(bytes)).toEqual([255, 239]);
  });
});

describe('buildPushRecord', () => {
  it('builds a Supabase push_subscriptions record with snapshot and alert state', () => {
    const state = createDefaultCatState();
    const record = buildPushRecord(
      'https://push.example/sub/123',
      'p256dh-key',
      'auth-key',
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
    expect(record.p256dh).toBe('p256dh-key');
    expect(record.auth).toBe('auth-key');
    expect(record.prefs.enabled).toBe(true);
    expect(record.cat_snapshot.name).toBe('Oli');
    expect(record.alerted.hydration).toBe('low');
    expect(record.woke_up_alerted).toBe(false);
    expect(record.updated_at).toBe('2026-11-14T09:00:00.000Z');
  });
});
