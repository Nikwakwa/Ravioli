import { beforeEach, describe, expect, it } from 'vitest';
import { LIFE_STAGES } from '../types';
import {
  applyCareStreak,
  areAllQuestsDone,
  claimDailyQuestReward,
  ensureTodayState,
  generateDailyQuests,
  getDailyRewardChurus,
  getDailyQuestState,
  getNextStreakMilestone,
  getVisibleStreak,
  isDailyRewardReady,
  isQuestAvailableForStage,
  isStreakMilestone,
  previousDayKey,
  protectStreakForVacation,
  recordQuestEvent,
  sanitizeDailyQuestState,
  setDailyQuestState,
  type DailyQuestState,
} from './dailyQuests';

const DAY1_MS = new Date(2026, 10, 22, 10, 0, 0).getTime(); // 2026-11-22
const DAY2_MS = new Date(2026, 10, 23, 10, 0, 0).getTime(); // 2026-11-23
const DAY4_MS = new Date(2026, 10, 25, 10, 0, 0).getTime(); // 2026-11-25

function makeCustomState(overrides: Partial<DailyQuestState> = {}): DailyQuestState {
  return {
    day: '2026-11-22',
    quests: [
      { id: '2026-11-22:brush', kind: 'brush', label: 'Brush Oli’s ginger coat', emoji: '🪮', target: 1, progress: 0 },
      { id: '2026-11-22:play_any', kind: 'play_any', label: 'Play any minigame with Oli', emoji: '🎮', target: 1, progress: 0 },
      { id: '2026-11-22:balcony_visitor', kind: 'balcony_visitor', label: 'Tap a visitor on the balcony', emoji: '🕊️', target: 1, progress: 0 },
    ],
    rewardClaimed: false,
    streak: 0,
    bestStreak: 0,
    lastCaredDay: null,
    pausedProtectionDay: null,
    ...overrides,
  };
}

describe('Daily Quests & Care Streak', () => {
  beforeEach(() => {
    setDailyQuestState(makeCustomState());
  });

  it('generates 3 distinct, deterministic quests that are always unlocked for every life stage', () => {
    const qA = generateDailyQuests('2026-11-22', 'adult');
    const qB = generateDailyQuests('2026-11-22', 'adult');
    expect(qA).toHaveLength(3);
    expect(qA).toEqual(qB);
    expect(new Set(qA.map((q) => q.kind)).size).toBe(3);

    expect(isQuestAvailableForStage('play_brain', 'newborn')).toBe(false);
    expect(isQuestAvailableForStage('play_brain', 'kitten')).toBe(true);
    expect(isQuestAvailableForStage('play_active', 'newborn')).toBe(true);

    // Across every day of the month and every life stage, every generated quest must be available!
    for (const stage of LIFE_STAGES) {
      for (let d = 1; d <= 30; d++) {
        const day = `2026-11-${String(d).padStart(2, '0')}`;
        const quests = generateDailyQuests(day, stage);
        expect(quests).toHaveLength(3);
        expect(new Set(quests.map((q) => q.kind)).size).toBe(3);
        for (const q of quests) {
          expect(isQuestAvailableForStage(q.kind, stage), `${q.kind} for ${stage}`).toBe(true);
        }
      }
    }
  });

  it('seeds brand-new players with quests for their actual life stage and repairs any locked saved quests', () => {
    // Fresh unseeded state rolls over into newborn-safe quests immediately
    const unseeded = sanitizeDailyQuestState(null);
    expect(unseeded.quests).toHaveLength(0);
    const seededForNewborn = ensureTodayState(unseeded, 'newborn', DAY1_MS);
    expect(seededForNewborn.quests).toHaveLength(3);
    expect(seededForNewborn.quests.every((q) => isQuestAvailableForStage(q.kind, 'newborn'))).toBe(true);

    // Existing saved state containing a locked Brain game quest gets repaired while keeping other quest progress
    const brokenSaved: DailyQuestState = {
      day: '2026-11-22',
      quests: [
        { id: '2026-11-22:feed_meal', kind: 'feed_meal', label: 'Feed Oli a meal', emoji: '🍽️', target: 1, progress: 1 },
        { id: '2026-11-22:play_brain', kind: 'play_brain', label: 'Play a Brain game', emoji: '🧠', target: 1, progress: 0 },
        { id: '2026-11-22:pet', kind: 'pet', label: 'Give Oli 3 chin scratches', emoji: '🐾', target: 3, progress: 2 },
      ],
      rewardClaimed: false,
      streak: 1,
      bestStreak: 1,
      lastCaredDay: '2026-11-22',
      pausedProtectionDay: null,
    };

    const repaired = ensureTodayState(brokenSaved, 'newborn', DAY1_MS);
    expect(repaired.quests.every((q) => isQuestAvailableForStage(q.kind, 'newborn'))).toBe(true);
    expect(repaired.quests.some((q) => q.kind === 'play_brain')).toBe(false);
    // Preserves progress on the valid quests and refreshes newborn wording
    expect(repaired.quests[0].progress).toBe(1);
    expect(repaired.quests[0].label).toBe('Bottle-feed Oli warm milk');
    expect(repaired.quests[2].progress).toBe(2);
    expect(repaired.quests[2].label).toBe('Give Oli 3 warm cuddles');
  });

  it('tracks quest progress, detects completion, and claims the daily Churu bonus once', () => {
    const r1 = recordQuestEvent({ type: 'brush' }, 'adult', DAY1_MS);
    expect(r1.newlyCompleted).toHaveLength(1);
    expect(r1.allDoneJustNow).toBe(false);
    expect(r1.streak).toBe(1);

    const r2 = recordQuestEvent({ type: 'play', playGroup: 'active', perfect: false }, 'adult', DAY1_MS);
    expect(r2.newlyCompleted).toHaveLength(1);
    expect(r2.allDoneJustNow).toBe(false);

    const r3 = recordQuestEvent({ type: 'balcony_visitor' }, 'adult', DAY1_MS);
    expect(r3.newlyCompleted).toHaveLength(1);
    expect(r3.allDoneJustNow).toBe(true);

    const state = getDailyQuestState();
    expect(areAllQuestsDone(state)).toBe(true);
    expect(isDailyRewardReady(state, DAY1_MS)).toBe(true);

    const claim = claimDailyQuestReward(DAY1_MS);
    expect(claim.claimed).toBe(true);
    expect(claim.churus).toBe(1);
    expect(claim.isMilestone).toBe(false);

    // Second claim on the same day is blocked
    const secondClaim = claimDailyQuestReward(DAY1_MS);
    expect(secondClaim.claimed).toBe(false);
    expect(isDailyRewardReady(getDailyQuestState(), DAY1_MS)).toBe(false);
  });

  it('awards +2 Churus on Day 3 and weekly streak milestones', () => {
    expect(isStreakMilestone(1)).toBe(false);
    expect(isStreakMilestone(3)).toBe(true);
    expect(isStreakMilestone(7)).toBe(true);
    expect(isStreakMilestone(14)).toBe(true);
    expect(getDailyRewardChurus(3)).toBe(2);
    expect(getDailyRewardChurus(7)).toBe(2);
    expect(getDailyRewardChurus(4)).toBe(1);
    expect(getNextStreakMilestone(0)).toBe(3);
    expect(getNextStreakMilestone(3)).toBe(7);
    expect(getNextStreakMilestone(7)).toBe(14);

    setDailyQuestState(
      makeCustomState({
        streak: 3,
        bestStreak: 3,
        lastCaredDay: '2026-11-22',
        quests: makeCustomState().quests.map((q) => ({ ...q, progress: q.target })),
      }),
    );

    const claim = claimDailyQuestReward(DAY1_MS);
    expect(claim.claimed).toBe(true);
    expect(claim.churus).toBe(2);
    expect(claim.isMilestone).toBe(true);
  });

  it('increments streak across consecutive days and resets if a day is missed without Vacation Mode', () => {
    expect(previousDayKey('2026-11-22')).toBe('2026-11-21');

    const day1 = applyCareStreak(makeCustomState(), '2026-11-22');
    expect(day1.streak).toBe(1);

    const day2 = applyCareStreak(day1, '2026-11-23');
    expect(day2.streak).toBe(2);
    expect(day2.bestStreak).toBe(2);

    // Skipping a day resets streak back to 1
    const day5 = applyCareStreak(day2, '2026-11-26');
    expect(day5.streak).toBe(1);
    expect(day5.bestStreak).toBe(2);
    expect(getVisibleStreak(day2, DAY4_MS)).toBe(0);
  });

  it('preserves care streak across missed days when Vacation Mode was enabled', () => {
    setDailyQuestState(
      makeCustomState({
        streak: 5,
        bestStreak: 5,
        lastCaredDay: '2026-11-22',
      }),
    );
    protectStreakForVacation(DAY1_MS);

    // Even 3 days later, visible streak stays safe and next care action increments to 6
    expect(getVisibleStreak(getDailyQuestState(), DAY4_MS)).toBe(5);
    const res = recordQuestEvent({ type: 'pet' }, 'adult', DAY4_MS);
    expect(res.streak).toBe(6);
    expect(getDailyQuestState().pausedProtectionDay).toBeNull();
  });

  it('rolls over quests on a new calendar day while preserving streak history', () => {
    const prev = makeCustomState({
      rewardClaimed: true,
      streak: 4,
      bestStreak: 6,
      lastCaredDay: '2026-11-22',
    });
    const next = ensureTodayState(prev, 'adult', DAY2_MS);
    expect(next.day).toBe('2026-11-23');
    expect(next.rewardClaimed).toBe(false);
    expect(next.streak).toBe(4);
    expect(next.bestStreak).toBe(6);
    expect(next.quests.every((q) => q.progress === 0)).toBe(true);
  });

  it('does not resurrect an already-expired streak when turning on Vacation Mode', () => {
    setDailyQuestState(
      makeCustomState({
        streak: 5,
        bestStreak: 5,
        lastCaredDay: '2026-11-22',
      }),
    );
    // 3 days later without caring, streak is already expired
    expect(getVisibleStreak(getDailyQuestState(), DAY4_MS)).toBe(0);
    protectStreakForVacation(DAY4_MS);
    expect(getDailyQuestState().pausedProtectionDay).toBeNull();
    expect(getVisibleStreak(getDailyQuestState(), DAY4_MS)).toBe(0);
  });

  it('rejects non-finite targets and progress in sanitizeDailyQuestState', () => {
    const sanitized = sanitizeDailyQuestState({
      day: '2026-11-22',
      quests: [
        { id: '1', kind: 'brush', label: 'Brush', emoji: '🪮', target: Number.POSITIVE_INFINITY, progress: 0 },
        { id: '2', kind: 'pet', label: 'Pet', emoji: '🐾', target: 3, progress: Number.NaN },
        { id: '3', kind: 'fountain', label: 'Water', emoji: '💧', target: 1, progress: 0 },
      ],
      rewardClaimed: false,
      streak: Number.NaN,
      bestStreak: -4,
      lastCaredDay: 'not-a-date',
      pausedProtectionDay: 'bad',
    });
    expect(sanitized.quests).toHaveLength(0);
    expect(sanitized.day).toBe('');
    expect(sanitized.streak).toBe(0);
    expect(sanitized.bestStreak).toBe(0);
    expect(sanitized.lastCaredDay).toBeNull();
    expect(sanitized.pausedProtectionDay).toBeNull();
  });
});
