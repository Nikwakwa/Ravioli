import { describe, expect, it } from 'vitest';
import {
  createSurpriseMoment,
  getEligibleSurprises,
  getSurpriseTapReaction,
  nextIdleSurpriseDelayMs,
  shouldTriggerOnCheckIn,
  SURPRISE_COOLDOWN_MS,
  SURPRISE_IDLE_MAX_MS,
  SURPRISE_IDLE_MIN_MS,
  SURPRISE_JOY_BOOST,
} from './surpriseMoments';

describe('surpriseMoments — eligibility & pacing', () => {
  it('limits newborn kittens to gentle box peeks only', () => {
    expect(getEligibleSurprises('newborn', 90)).toEqual(['box_peek']);
  });

  it('skips spontaneous zoomies when Oli is low on energy', () => {
    expect(getEligibleSurprises('adult', 15)).toEqual(['box_peek', 'table_knock']);
    expect(getEligibleSurprises('adult', 60)).toEqual(['box_peek', 'zoomies', 'table_knock']);
  });

  it('respects cooldown before greeting the player on check-in', () => {
    const now = 1_000_000;
    expect(shouldTriggerOnCheckIn(now - 30_000, now, 0.1)).toBe(false);
    expect(shouldTriggerOnCheckIn(now - SURPRISE_COOLDOWN_MS - 1, now, 0.2)).toBe(true);
    expect(shouldTriggerOnCheckIn(now - SURPRISE_COOLDOWN_MS - 1, now, 0.95)).toBe(false);
    expect(shouldTriggerOnCheckIn(0, now, 0.2)).toBe(true);
  });

  it('never fires idle surprises faster than the calm window or remaining cooldown', () => {
    const now = 1_000_000;
    const freshDelay = nextIdleSurpriseDelayMs(0, now, 0);
    expect(freshDelay).toBe(SURPRISE_IDLE_MIN_MS);
    const maxDelay = nextIdleSurpriseDelayMs(0, now, 0.999999);
    expect(maxDelay).toBeLessThanOrEqual(SURPRISE_IDLE_MAX_MS);

    const recentDelay = nextIdleSurpriseDelayMs(now - 10_000, now, 0);
    expect(recentDelay).toBeGreaterThanOrEqual(SURPRISE_COOLDOWN_MS - 10_000);
  });
});

describe('surpriseMoments — creation & reactions', () => {
  it('avoids repeating the previous surprise kind when multiple kinds are eligible', () => {
    const now = 5_000_000;
    for (const prev of ['box_peek', 'zoomies', 'table_knock'] as const) {
      const m = createSurpriseMoment('adult', 80, now, 0.4, prev);
      expect(m.kind).not.toBe(prev);
      expect(m.expiresAt).toBeGreaterThan(now);
    }
  });

  it('assigns a coffee-table item only for table_knock surprises', () => {
    const now = 5_000_000;
    const knock = createSurpriseMoment('adult', 10, now, 0.8, 'box_peek');
    expect(knock.kind).toBe('table_knock');
    expect(['coaster', 'pen', 'cap']).toContain(knock.item);

    const peek = createSurpriseMoment('newborn', 80, now, 0.5);
    expect(peek.kind).toBe('box_peek');
    expect(peek.item).toBeUndefined();
  });

  it('builds tailored toast, sound, and animation reactions for each surprise kind', () => {
    const peek = getSurpriseTapReaction({ id: '1', kind: 'box_peek', startedAt: 0, expiresAt: 1000 }, 'Oli');
    expect(peek.toast).toContain(`+${SURPRISE_JOY_BOOST} Joy`);
    expect(peek.sound).toBe('chirp');

    const zoomies = getSurpriseTapReaction({ id: '2', kind: 'zoomies', startedAt: 0, expiresAt: 1000 }, 'Oli');
    expect(zoomies.sound).toBe('purr');
    expect(zoomies.animation).toBe('purring');

    const knock = getSurpriseTapReaction(
      { id: '3', kind: 'table_knock', item: 'pen', startedAt: 0, expiresAt: 1000 },
      'Oli',
    );
    expect(knock.toast).toContain('pen');
    expect(knock.sound).toBe('clatter');
  });
});
