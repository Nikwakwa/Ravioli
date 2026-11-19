import { describe, expect, it } from 'vitest';
import {
  actionById,
  getVisibleActionsForCategory,
  isActionUnlockedForStage,
  pickCandidateWhim,
} from '../data/actions';
import { sanitizeCatState } from '../services/catStorage';
import { LIFE_STAGES, type CatState } from '../types';
import {
  addGrowthBonus,
  computeLiveStats,
  createDefaultCatState,
  createNewGameCatState,
  materialize,
} from './decayEngine';
import {
  ADULT_GROWTH_HOURS,
  CARE_ACTION_GROWTH_BONUS,
  formatRemainingGrowth,
  getStageProgressInfo,
  STAGE_THRESHOLDS,
  stageFromGrowthHours,
} from './lifeStage';

const T0 = Date.parse('2026-11-19T12:00:00.000Z');
const H = 3_600_000;

function stateAt(growthHours: number, overrides: Partial<CatState> = {}): CatState {
  return {
    ...createDefaultCatState(T0),
    hunger: 90,
    hydration: 90,
    happiness: 90,
    energy: 90,
    hygiene: 90,
    growth_hours: growthHours,
    ...overrides,
  };
}

describe('Life stages schedule & Adult-forever rule', () => {
  it('follows the ~2.5-week (18d) progression: Newborn (3d) → Kitten (6d) → Teen (9d) → Adult forever', () => {
    expect(STAGE_THRESHOLDS.newborn).toBe(0);
    expect(STAGE_THRESHOLDS.kitten).toBe(72); // 3 days
    expect(STAGE_THRESHOLDS.teen).toBe(216); // +6 days = 9 days
    expect(STAGE_THRESHOLDS.adult).toBe(432); // +9 days = 18 days

    expect(stageFromGrowthHours(0)).toBe('newborn');
    expect(stageFromGrowthHours(71.9)).toBe('newborn');
    expect(stageFromGrowthHours(72)).toBe('kitten');
    expect(stageFromGrowthHours(215.9)).toBe('kitten');
    expect(stageFromGrowthHours(216)).toBe('teen');
    expect(stageFromGrowthHours(431.9)).toBe('teen');
    expect(stageFromGrowthHours(432)).toBe('adult');
  });

  it('caps permanently at Adult Oli and NEVER ages further or dies of old age', () => {
    expect(stageFromGrowthHours(10_000)).toBe('adult');

    const info = getStageProgressInfo(9999);
    expect(info.stage).toBe('adult');
    expect(info.nextStage).toBeNull();
    expect(info.progress).toBe(1);
    expect(info.hoursRemaining).toBe(0);

    // Even after hundreds of hours of well-fed care, Adult stays alive and stays Adult forever
    let s = stateAt(ADULT_GROWTH_HOURS);
    for (let i = 0; i < 100; i++) {
      const nextT = Date.parse(s.last_updated_at) + 5 * H;
      s = {
        ...materialize(s, nextT),
        hunger: 90,
        hydration: 90,
        happiness: 90,
        energy: 90,
        hygiene: 90,
      };
    }
    const live = computeLiveStats(s, Date.parse(s.last_updated_at));
    expect(live.lifeStage).toBe('adult');
    expect(live.growthHours).toBe(ADULT_GROWTH_HOURS);
    expect(live.isDeceased).toBe(false);
  });

  it('computes accurate stage progress and friendly countdown labels', () => {
    const midNewborn = getStageProgressInfo(36);
    expect(midNewborn.stage).toBe('newborn');
    expect(midNewborn.nextStage).toBe('kitten');
    expect(midNewborn.progress).toBeCloseTo(0.5);
    expect(midNewborn.hoursRemaining).toBeCloseTo(36);
    expect(formatRemainingGrowth(36)).toBe('~1.5d left');
    expect(formatRemainingGrowth(5.2)).toBe('~6h left');
    expect(formatRemainingGrowth(0.4)).toBe('<1h left');
  });
});

describe('Healthy care growth & persistence migration', () => {
  it('grows during healthy hours and stops growing once a need drops into the red (< 25)', () => {
    // Newborn awake: hunger -7.5/h, hydration -7/h, energy -6.5/h.
    // From 70 hunger → hits 25 in (70-25)/7.5 = 6h. Hydration from 90 → hits 25 in 9.28h.
    // After 10h elapsed, only the first 6 healthy hours count toward growth!
    const baby = stateAt(0, { hunger: 70, hydration: 90, happiness: 90, energy: 90, hygiene: 90 });
    const live = computeLiveStats(baby, T0 + 10 * H);
    expect(live.growthHours).toBeCloseTo(6, 1);
    expect(live.isGrowingNow).toBe(false);
  });

  it('grows while sleeping peacefully as long as hunger/hydration/happiness/hygiene stay >= 25', () => {
    // Newborn sleeping: energy +20/h (from 20 -> 100 takes 4h). Non-energy stats stay well above 25.
    const sleepingBaby = stateAt(10, { is_sleeping: true, energy: 20, hunger: 80, hydration: 80 });
    const live = computeLiveStats(sleepingBaby, T0 + 4 * H);
    expect(live.growthHours).toBeCloseTo(14, 1);
    expect(live.isGrowingNow).toBe(true);
  });

  it('freezes growth when Vacation Mode (paused_at) is active', () => {
    const pausedBaby = stateAt(20, { paused_at: new Date(T0).toISOString() });
    const live = computeLiveStats(pausedBaby, T0 + 48 * H);
    expect(live.growthHours).toBe(20);
    expect(live.lifeStage).toBe('newborn');
    expect(live.isGrowingNow).toBe(false);
  });

  it('advances stage automatically when healthy growth crosses a threshold', () => {
    const almostKitten = stateAt(70);
    const live = computeLiveStats(almostKitten, T0 + 3 * H);
    expect(live.growthHours).toBeCloseTo(73, 1);
    expect(live.lifeStage).toBe('kitten');
  });

  it('applies active care growth bonuses without ever exceeding Adult cap', () => {
    const baby = stateAt(10);
    expect(addGrowthBonus(baby, CARE_ACTION_GROWTH_BONUS).growth_hours).toBeCloseTo(10.25);

    const adult = stateAt(ADULT_GROWTH_HOURS);
    expect(addGrowthBonus(adult, 5).growth_hours).toBe(ADULT_GROWTH_HOURS);
  });

  it('keeps existing saves without growth_hours as Adult Oli, while fresh games start as Newborn', () => {
    const migratedExisting = sanitizeCatState({ hunger: 65, hydration: 70, version: 12 });
    expect(migratedExisting.growth_hours).toBe(ADULT_GROWTH_HOURS);
    expect(computeLiveStats(migratedExisting, Date.parse(migratedExisting.last_updated_at)).lifeStage).toBe('adult');

    const freshGame = createNewGameCatState(T0);
    expect(freshGame.growth_hours).toBe(0);
    expect(computeLiveStats(freshGame, T0).lifeStage).toBe('newborn');
  });
});

describe('Stage-specific unlocks, dock feed grid, and cravings', () => {
  it('shows exactly 4 Feed actions in the 2x2 ActionDock at every life stage', () => {
    for (const stage of LIFE_STAGES) {
      const feed = getVisibleActionsForCategory('feed', stage);
      expect(feed).toHaveLength(4);
    }
    expect(getVisibleActionsForCategory('feed', 'newborn').map((a) => a.id)).toContain('kitten_milk');
    expect(getVisibleActionsForCategory('feed', 'kitten').map((a) => a.id)).toContain('kitten_milk');
    expect(getVisibleActionsForCategory('feed', 'teen').map((a) => a.id)).not.toContain('kitten_milk');
    expect(getVisibleActionsForCategory('feed', 'teen').map((a) => a.id)).toContain('quail_egg');
    expect(getVisibleActionsForCategory('feed', 'adult').map((a) => a.id)).toContain('quail_egg');
  });

  it('unlocks food and play gradually: Newborn milk only → Kitten simple play → Teen/Adult all unlocked', () => {
    const milk = actionById('kitten_milk')!;
    const wet = actionById('wet_food')!;
    const egg = actionById('quail_egg')!;
    const feather = actionById('feather_wand')!;
    const tail = actionById('tail_chase')!;
    const laser = actionById('laser_pointer')!;
    const ball = actionById('red_ball')!;

    // Newborn: only kitten milk (no solid food, no minigames)
    expect(isActionUnlockedForStage(milk, 'newborn')).toBe(true);
    expect(isActionUnlockedForStage(wet, 'newborn')).toBe(false);
    expect(isActionUnlockedForStage(egg, 'newborn')).toBe(false);
    expect(isActionUnlockedForStage(feather, 'newborn')).toBe(false);
    expect(isActionUnlockedForStage(tail, 'newborn')).toBe(false);
    expect(isActionUnlockedForStage(laser, 'newborn')).toBe(false);
    expect(isActionUnlockedForStage(ball, 'newborn')).toBe(false);

    // Kitten: milk + wet food + simple play (feather & tail), laser/ball/egg locked until Teen
    expect(isActionUnlockedForStage(milk, 'kitten')).toBe(true);
    expect(isActionUnlockedForStage(wet, 'kitten')).toBe(true);
    expect(isActionUnlockedForStage(egg, 'kitten')).toBe(false);
    expect(isActionUnlockedForStage(feather, 'kitten')).toBe(true);
    expect(isActionUnlockedForStage(tail, 'kitten')).toBe(true);
    expect(isActionUnlockedForStage(laser, 'kitten')).toBe(false);
    expect(isActionUnlockedForStage(ball, 'kitten')).toBe(false);

    // Teen & Adult: weaned off milk, all meals & minigames unlocked
    for (const stage of ['teen', 'adult'] as const) {
      expect(isActionUnlockedForStage(milk, stage)).toBe(false);
      expect(isActionUnlockedForStage(wet, stage)).toBe(true);
      expect(isActionUnlockedForStage(egg, stage)).toBe(true);
      expect(isActionUnlockedForStage(feather, stage)).toBe(true);
      expect(isActionUnlockedForStage(tail, stage)).toBe(true);
      expect(isActionUnlockedForStage(laser, stage)).toBe(true);
      expect(isActionUnlockedForStage(ball, stage)).toBe(true);
    }
  });

  it('never generates locked cravings for Newborn or Kitten, and never asks Adult for Kitten Milk', () => {
    const newbornLive = computeLiveStats(stateAt(0, { hunger: 50, hydration: 50, hygiene: 50 }), T0);
    for (let i = 0; i < 20; i++) {
      const whim = pickCandidateWhim(newbornLive, i / 20);
      expect(whim).not.toBeNull();
      expect(['chin_scratch', 'kitten_milk', 'fountain', 'brush']).toContain(whim!.actionId);
    }

    const adultLive = computeLiveStats(stateAt(ADULT_GROWTH_HOURS, { hunger: 50, hydration: 50, hygiene: 50 }), T0);
    for (let i = 0; i < 30; i++) {
      const whim = pickCandidateWhim(adultLive, i / 30);
      expect(whim).not.toBeNull();
      expect(whim!.actionId).not.toBe('kitten_milk');
    }
  });
});
