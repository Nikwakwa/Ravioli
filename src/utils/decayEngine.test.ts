import { describe, expect, it } from 'vitest';
import {
  actionById,
  CARE_ACTIONS,
  CATEGORIES,
  computeMinigameReward,
  isFeatherInSweetSpot,
  MAX_SLEEP_ENERGY,
  MIN_WAKE_ENERGY,
  PAUSE_ACTION_ID,
  PET_ACTION_ID,
  pickCandidateWhim,
  REVIVE_ACTION_ID,
} from '../data/actions';
import { pickFreeMessSlot } from '../hooks/useCatGame';
import { cleanText, sanitizeActivity, sanitizeCatState } from '../services/catStorage';
import { evaluateStatThresholds, getNotificationAssetUrls, toAbsoluteNotificationUrl, type AlertedMap } from './notifications';
import type { CatState } from '../types';
import {
  DECAY_RATES,
  hoursUntilBothZero,
  MAX_LIVES,
  MIN_NAP_HOURS,
  NEGLECT_DEATH_HOURS,
  applyEffect,
  clampStat,
  computeLiveStats,
  createDefaultCatState,
  deriveMood,
  elapsedHours,
  isThriving,
  materialize,
  nextNeed,
} from './decayEngine';

const T0 = Date.parse('2026-10-30T12:00:00.000Z');
const H = 3_600_000;

function base(overrides: Partial<CatState> = {}): CatState {
  return {
    ...createDefaultCatState(T0),
    hunger: 80,
    hydration: 80,
    happiness: 80,
    energy: 50,
    hygiene: 80,
    ...overrides,
  };
}

describe('clampStat / elapsedHours', () => {
  it('clamps to 0–100 and survives NaN', () => {
    expect(clampStat(150)).toBe(100);
    expect(clampStat(-3)).toBe(0);
    expect(clampStat(Number.NaN)).toBe(0);
  });

  it('treats future timestamps (clock skew) as zero elapsed', () => {
    expect(elapsedHours(new Date(T0 + H).toISOString(), T0)).toBe(0);
  });

  it('treats invalid timestamps as zero elapsed', () => {
    expect(elapsedHours('not-a-date', T0)).toBe(0);
  });

  it('computes fractional hours', () => {
    expect(elapsedHours(new Date(T0).toISOString(), T0 + 1.5 * H)).toBeCloseTo(1.5);
  });
});

describe('computeLiveStats — awake', () => {
  it('decays at the documented hourly rates', () => {
    const live = computeLiveStats(base(), T0 + 2 * H);
    expect(live.hunger).toBeCloseTo(80 - 12);
    expect(live.hydration).toBeCloseTo(80 - 16);
    expect(live.happiness).toBeCloseTo(80 - 10);
    expect(live.energy).toBeCloseTo(50 - 8);
    expect(live.hygiene).toBeCloseTo(80 - 4);
    expect(live.isSleeping).toBe(false);
  });

  it('never drops below zero after a long absence', () => {
    const live = computeLiveStats(base(), T0 + 72 * H);
    expect(live.hunger).toBe(0);
    expect(live.hydration).toBe(0);
    expect(live.energy).toBe(0);
  });

  it('is unchanged at elapsed = 0', () => {
    const live = computeLiveStats(base(), T0);
    expect(live.hunger).toBe(80);
  });
});

describe('computeLiveStats — sleeping', () => {
  it('regenerates energy and slows hunger while asleep', () => {
    const live = computeLiveStats(base({ is_sleeping: true, energy: 40 }), T0 + 2 * H);
    expect(live.energy).toBeCloseTo(40 + 2 * DECAY_RATES.sleeping.energy);
    expect(live.hunger).toBeCloseTo(80 + 2 * DECAY_RATES.sleeping.hunger);
    expect(live.isSleeping).toBe(true);
  });

  it('wakes up naturally when energy is full, then decays at awake rates', () => {
    // 40 → 100 takes 4h at +15/h. After 6h: 4h asleep + 2h awake.
    const live = computeLiveStats(base({ is_sleeping: true, energy: 40 }), T0 + 6 * H);
    expect(live.isSleeping).toBe(false);
    expect(live.wokeNaturally).toBe(true);
    expect(live.energy).toBeCloseTo(100 - 2 * 4);
    expect(live.hunger).toBeCloseTo(80 - 4 * 3 - 2 * 6);
  });

  it('honours a minimum nap even when energy is already full', () => {
    const almost = computeLiveStats(base({ is_sleeping: true, energy: 100 }), T0 + (MIN_NAP_HOURS * H) / 2);
    expect(almost.isSleeping).toBe(true);
    const after = computeLiveStats(base({ is_sleeping: true, energy: 100 }), T0 + MIN_NAP_HOURS * H + 1);
    expect(after.isSleeping).toBe(false);
  });
});

describe('materialize + applyEffect', () => {
  it('bakes decay into a new snapshot stamped at now', () => {
    const now = T0 + 3 * H;
    const snap = materialize(base(), now);
    expect(snap.hunger).toBeCloseTo(62);
    expect(snap.last_updated_at).toBe(new Date(now).toISOString());
    // Materializing again at the same instant is idempotent.
    expect(materialize(snap, now)).toEqual(snap);
  });

  it('persists a natural wake-up', () => {
    const snap = materialize(base({ is_sleeping: true, energy: 90 }), T0 + 5 * H);
    expect(snap.is_sleeping).toBe(false);
  });

  it('clears an expired calm window', () => {
    const calm = base({ calm_until: new Date(T0 + H).toISOString() });
    expect(materialize(calm, T0 + 0.5 * H).calm_until).toBe(calm.calm_until);
    expect(materialize(calm, T0 + 2 * H).calm_until).toBeNull();
  });

  it('caps boosts at 100 and floors penalties at 0', () => {
    const boosted = applyEffect(base({ hunger: 90, energy: 5 }), { hunger: 35, energy: -10 });
    expect(boosted.hunger).toBe(100);
    expect(boosted.energy).toBe(0);
  });
});

describe('mood & hints', () => {
  it('prioritises sleep, then urgent needs', () => {
    expect(deriveMood(computeLiveStats(base({ is_sleeping: true }), T0))).toBe('sleeping');
    expect(deriveMood(computeLiveStats(base({ hunger: 10 }), T0))).toBe('hungry');
    expect(deriveMood(computeLiveStats(base({ hydration: 10 }), T0))).toBe('thirsty');
  });

  it('is relaxed during the pheromone calm window', () => {
    const live = computeLiveStats(base({ calm_until: new Date(T0 + H).toISOString() }), T0);
    expect(deriveMood(live)).toBe('relaxed');
  });

  it('detects thriving and ecstatic', () => {
    const top = base({ hunger: 95, hydration: 95, happiness: 95, energy: 95, hygiene: 95 });
    const live = computeLiveStats(top, T0);
    expect(isThriving(live)).toBe(true);
    expect(deriveMood(live)).toBe('ecstatic');
  });

  it('predicts the next need (hydration decays fastest)', () => {
    const need = nextNeed(computeLiveStats(base({ energy: 80 }), T0));
    expect(need?.stat).toBe('hydration');
    expect(need?.hours).toBeCloseTo((80 - 25) / 8);
  });
});

describe('security sanitizers (catStorage)', () => {
  it('pins cat name to Oli even if remote payload attempts spoofing', () => {
    const state = sanitizeCatState({ name: '<script>alert(1)</script>', hunger: 50 });
    expect(state.name).toBe('Oli');
  });

  it('strips HTML tags, quotes, and URLs from text fields', () => {
    expect(cleanText('<b>Athina</b> https://evil.example/phish "hi"', 24)).toBe('Athina hi');
  });

  it('rejects unknown action_id payloads and canonicalizes valid action messages', () => {
    expect(
      sanitizeActivity({
        id: '1',
        player: 'Athina',
        action_id: 'unknown_hack',
        message: 'Click https://evil.example',
      }),
    ).toBeNull();

    const valid = sanitizeActivity({
      id: '2',
      player: '<b>Athina</b>',
      action_id: 'churu',
      message: 'Spoofed message that gets replaced with canonical text',
    });
    expect(valid?.player).toBe('Athina');
    expect(valid?.message).toBe('Fed Oli a Churu lickable tube');

    const petEntry = sanitizeActivity({
      id: '3',
      player: 'Nico',
      action_id: PET_ACTION_ID,
      message: 'pet',
    });
    expect(petEntry?.message).toBe('Gave Oli chin scratches — purr session!');
  });
});

describe('Core action, dock & mess rules', () => {
  it('organizes dock into 4 balanced categories (feed, play, care, rest)', () => {
    expect(CATEGORIES.map((c) => c.id)).toEqual(['feed', 'play', 'care', 'rest']);
    expect(CARE_ACTIONS.filter((a) => a.category === 'feed')).toHaveLength(4);
    expect(CARE_ACTIONS.filter((a) => a.category === 'play')).toHaveLength(2);
    expect(CARE_ACTIONS.filter((a) => a.category === 'care')).toHaveLength(3);
    expect(CARE_ACTIONS.filter((a) => a.category === 'rest')).toHaveLength(1);
  });

  it('allocates up to 3 room mess slots and returns null when full', () => {
    expect(pickFreeMessSlot([])).toBe(0);
    expect(pickFreeMessSlot([{ id: '1', kind: 'poop', slot: 0, created_at: '' }])).toBe(1);
    expect(
      pickFreeMessSlot([
        { id: '1', kind: 'poop', slot: 0, created_at: '' },
        { id: '2', kind: 'vomit', slot: 2, created_at: '' },
      ]),
    ).toBe(1);
    expect(
      pickFreeMessSlot([
        { id: '1', kind: 'poop', slot: 0, created_at: '' },
        { id: '2', kind: 'vomit', slot: 1, created_at: '' },
        { id: '3', kind: 'poop', slot: 2, created_at: '' },
      ]),
    ).toBeNull();
  });

  it('enforces fullness caps on meals, trade-offs on wet food, and energy thresholds on play', () => {
    const wet = actionById('wet_food');
    expect(wet?.maxHunger).toBe(85);
    expect(wet?.effect.hygiene).toBe(-4);

    const egg = actionById('quail_egg');
    expect(egg?.maxHunger).toBe(90);
    expect(egg?.effect.energy).toBe(10);

    const laser = actionById('laser_pointer');
    expect(laser?.minEnergy).toBe(25);
    expect(laser?.effect.energy).toBe(-18);

    expect(MAX_SLEEP_ENERGY).toBeGreaterThan(MIN_WAKE_ENERGY);
  });

  it('picks valid Attention Call whims that respect fullness, sleep, and energy thresholds', () => {
    // Sleeping Oli has no whims
    const sleepingLive = computeLiveStats(base({ is_sleeping: true }), T0);
    expect(pickCandidateWhim(sleepingLive, 0)).toBeNull();

    // Stuffed & exhausted Oli should never be asked to eat a heavy meal or play high-energy games
    const stuffedExhausted = computeLiveStats(base({ hunger: 92, energy: 10 }), T0);
    for (let seed = 0; seed < 10; seed++) {
      const w = pickCandidateWhim(stuffedExhausted, seed);
      expect(w).not.toBeNull();
      expect(['wet_food', 'quail_egg', 'feather_wand', 'laser_pointer']).not.toContain(w?.actionId);
    }
  });

  it('rewards 3-round Play minigames with bonus Joy on 2/3 and +1 Churu on 3/3', () => {
    expect(computeMinigameReward(3, 3)).toEqual({ bonusJoy: 15, churuBonus: 1, tier: 'perfect' });
    expect(computeMinigameReward(2, 3)).toEqual({ bonusJoy: 8, churuBonus: 0, tier: 'great' });
    expect(computeMinigameReward(1, 3)).toEqual({ bonusJoy: 0, churuBonus: 0, tier: 'good' });
    expect(computeMinigameReward(0, 3)).toEqual({ bonusJoy: 0, churuBonus: 0, tier: 'good' });

    expect(isFeatherInSweetSpot(50, 0)).toBe(true);
    expect(isFeatherInSweetSpot(10, 0)).toBe(false);
    expect(isFeatherInSweetSpot(36, 0)).toBe(true);
    expect(isFeatherInSweetSpot(36, 2)).toBe(false); // tighter sweet spot on round 3 (38–62%)
  });
});

describe('Care Clock Pause (Vacation Mode) & Extreme Neglect Protection (9 Lives)', () => {
  it('freezes all stat decay when paused_at is set, even after 72 hours away', () => {
    const pauseTime = new Date(T0).toISOString();
    const pausedState = base({ paused_at: pauseTime, last_updated_at: pauseTime });

    // 72 hours later...
    const live = computeLiveStats(pausedState, T0 + 72 * H);
    expect(live.isPaused).toBe(true);
    expect(live.isDeceased).toBe(false);
    expect(live.hunger).toBe(80);
    expect(live.hydration).toBe(80);
    expect(live.energy).toBe(50);
  });

  it('keeps Oli alive during normal everyday absence (e.g. 12h sleep, 24h busy day)', () => {
    const normalAbsence = computeLiveStats(base(), T0 + 24 * H);
    expect(normalAbsence.isDeceased).toBe(false);
    expect(normalAbsence.livesLeft).toBe(MAX_LIVES);
  });

  it('triggers deceased state only after 48 continuous hours of zero food & water (extreme neglect)', () => {
    const timeToZero = hoursUntilBothZero(base(), false); // ~13.3 hours
    expect(timeToZero).toBeGreaterThan(8);

    // Just before 48h at zero: Oli is weak & empty, but still hanging on!
    const justBefore = computeLiveStats(base(), T0 + (timeToZero + NEGLECT_DEATH_HOURS - 1) * H);
    expect(justBefore.isDeceased).toBe(false);

    // After 48h at zero: Oli passes away and mood becomes 'deceased'
    const afterNeglect = computeLiveStats(base(), T0 + (timeToZero + NEGLECT_DEATH_HOURS + 1) * H);
    expect(afterNeglect.isDeceased).toBe(true);
    expect(deriveMood(afterNeglect)).toBe('deceased');
    expect(afterNeglect.hunger).toBe(0);
  });

  it('preserves paused_at, deceased_at, and lives_left in sanitizeCatState', () => {
    const iso = new Date(T0).toISOString();
    const sanitized = sanitizeCatState({
      name: 'Oli',
      hunger: 60,
      paused_at: iso,
      deceased_at: iso,
      lives_left: 7,
    });
    expect(sanitized.paused_at).toBe(iso);
    expect(sanitized.deceased_at).toBe(iso);
    expect(sanitized.lives_left).toBe(7);
  });

  it('canonicalizes PAUSE_ACTION_ID and REVIVE_ACTION_ID in sanitizeActivity', () => {
    const pauseAct = sanitizeActivity({
      id: 'p1',
      player: 'Nico',
      action_id: PAUSE_ACTION_ID,
      message: 'pause',
    });
    expect(pauseAct?.message).toBe('Paused the care clock (vacation mode)');

    const resumeAct = sanitizeActivity({
      id: 'p2',
      player: 'Nico',
      action_id: PAUSE_ACTION_ID,
      message: 'resumed',
    });
    expect(resumeAct?.message).toBe('Resumed the care clock — welcome back!');

    const reviveAct = sanitizeActivity({
      id: 'r1',
      player: 'Athina',
      action_id: REVIVE_ACTION_ID,
      message: 'revive',
    });
    expect(reviveAct?.message).toBe('Miraculous emergency vet care revived Oli!');
  });
});

describe('notification threshold crossings', () => {
  const noneMap: AlertedMap = {
    hunger: 'none',
    hydration: 'none',
    happiness: 'none',
    energy: 'none',
    hygiene: 'none',
  };

  it('alerts once when a stat drops below 25, escalates at <= 5, and resets once refilled >= 25', () => {
    const baseStats = { hunger: 70, hydration: 24, happiness: 80, energy: 80, hygiene: 90 };

    // 1. Crosses < 25 → emits low alert for hydration
    const step1 = evaluateStatThresholds(baseStats, noneMap);
    expect(step1.alerts).toHaveLength(1);
    expect(step1.alerts[0].id).toBe('low-hydration');
    expect(step1.nextAlerted.hydration).toBe('low');

    // 2. Stays at 20 → does NOT spam another low alert
    const step2 = evaluateStatThresholds({ ...baseStats, hydration: 20 }, step1.nextAlerted);
    expect(step2.alerts).toHaveLength(0);

    // 3. Drops to 4 (critical <= 5) → emits critical alert once
    const step3 = evaluateStatThresholds({ ...baseStats, hydration: 4 }, step2.nextAlerted);
    expect(step3.alerts).toHaveLength(1);
    expect(step3.alerts[0].id).toBe('crit-hydration');
    expect(step3.nextAlerted.hydration).toBe('critical');

    // 4. Refilled to 60 (>= 25) → resets alert state back to 'none'
    const step4 = evaluateStatThresholds({ ...baseStats, hydration: 60 }, step3.nextAlerted);
    expect(step4.alerts).toHaveLength(0);
    expect(step4.nextAlerted.hydration).toBe('none');
  });

  it('filters out alerts for stats or severity levels disabled in user preferences', () => {
    const baseStats = { hunger: 20, hydration: 20, happiness: 80, energy: 80, hygiene: 90 };
    const res = evaluateStatThresholds(baseStats, noneMap, {
      lowNeed: true,
      critical: true,
      stats: { hunger: true, hydration: false, happiness: true, energy: true, hygiene: true },
    });
    expect(res.alerts).toHaveLength(1);
    expect(res.alerts[0].stat).toBe('hunger');
  });

  it('resolves notification icon and badge to absolute URLs preventing white square fallbacks', () => {
    const assets = getNotificationAssetUrls('https://example.com/Ravioli/');
    expect(assets.icon).toBe('https://example.com/Ravioli/pwa-192x192.png');
    expect(assets.badge).toBe('https://example.com/Ravioli/badge-96x96.png');

    const devAssets = getNotificationAssetUrls('http://localhost:5173/');
    expect(devAssets.icon).toMatch(/^http:\/\/localhost:5173\/.*pwa-192x192\.png$/);
    expect(devAssets.badge).toMatch(/^http:\/\/localhost:5173\/.*badge-96x96\.png$/);

    expect(toAbsoluteNotificationUrl('/pwa-192x192.png', 'https://game.oli/')).toBe('https://game.oli/pwa-192x192.png');
  });
});
