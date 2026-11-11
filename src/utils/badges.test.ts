import { beforeEach, describe, expect, it } from 'vitest';
import {
  BADGES,
  INITIAL_STATS,
  badgeById,
  checkBadgeCondition,
  getBadgeState,
  isBadgeUnlocked,
  sanitizeBadgeState,
  setBadgeState,
  trackBoxNap,
  trackFeed,
  trackPet,
  type BadgeState,
} from './badges';

const mockState: BadgeState = {
  unlockedIds: [],
  unlockedAt: {},
  stats: { ...INITIAL_STATS },
  hasUnseen: false,
};

describe('secret discovery badges utility', () => {
  beforeEach(() => {
    setBadgeState({ ...mockState, stats: { ...INITIAL_STATS, foodsTried: [], daysVisited: [] } });
  });

  it('defines 12 authentic, secret discovery badges', () => {
    expect(BADGES.length).toBe(12);
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(12);
    BADGES.forEach((b) => {
      expect(b.name.length).toBeGreaterThan(0);
      expect(b.emoji.length).toBeGreaterThan(0);
      expect(b.description.length).toBeGreaterThan(0);
      expect(b.hint.length).toBeGreaterThan(0);
      expect(badgeById(b.id)).toBe(b);
    });
  });

  it('evaluates box naps unlock after 3 naps', () => {
    expect(checkBadgeCondition('box_sitter', { ...INITIAL_STATS, boxNaps: 2 })).toBe(false);
    expect(checkBadgeCondition('box_sitter', { ...INITIAL_STATS, boxNaps: 3 })).toBe(true);

    trackBoxNap();
    trackBoxNap();
    const unlocks = trackBoxNap();
    expect(unlocks.length).toBe(1);
    expect(unlocks[0].id).toBe('box_sitter');
    expect(isBadgeUnlocked(getBadgeState(), 'box_sitter')).toBe(true);
  });

  it('evaluates midnight feeding after 10 PM', () => {
    expect(checkBadgeCondition('midnight_snack', { ...INITIAL_STATS, midnightFeeds: 0 })).toBe(false);
    expect(checkBadgeCondition('midnight_snack', { ...INITIAL_STATS, midnightFeeds: 1 })).toBe(true);

    // Feed at 14:00 (2 PM) - no midnight snack
    const afternoonUnlocks = trackFeed('wet_food', 14);
    expect(afternoonUnlocks.some((b) => b.id === 'midnight_snack')).toBe(false);

    // Feed at 23:00 (11 PM) - triggers midnight snack
    const nightUnlocks = trackFeed('chicken_heart', 23);
    expect(nightUnlocks.some((b) => b.id === 'midnight_snack')).toBe(true);
  });

  it('evaluates gourmet whiskers when all 4 foods are tasted', () => {
    expect(checkBadgeCondition('gourmet_whiskers', { ...INITIAL_STATS, foodsTried: ['wet_food', 'quail_egg'] })).toBe(
      false,
    );
    expect(
      checkBadgeCondition('gourmet_whiskers', {
        ...INITIAL_STATS,
        foodsTried: ['wet_food', 'quail_egg', 'chicken_heart', 'churu'],
      }),
    ).toBe(true);
  });

  it('evaluates purr engine after 10 pets', () => {
    for (let i = 0; i < 9; i++) {
      trackPet();
    }
    expect(isBadgeUnlocked(getBadgeState(), 'purr_engine')).toBe(false);

    const tenthPet = trackPet();
    expect(tenthPet.some((b) => b.id === 'purr_engine')).toBe(true);
    expect(isBadgeUnlocked(getBadgeState(), 'purr_engine')).toBe(true);
  });

  it('sanitizes bad state cleanly', () => {
    const clean = sanitizeBadgeState(null);
    expect(clean.unlockedIds).toEqual([]);
    expect(clean.stats.boxNaps).toBe(0);

    const partial = sanitizeBadgeState({
      unlockedIds: ['box_sitter', 'fake_badge_id'],
      stats: { boxNaps: 5, petCount: -2 },
      hasUnseen: 1,
    });
    expect(partial.unlockedIds).toEqual(['box_sitter']);
    expect(partial.stats.boxNaps).toBe(5);
    expect(partial.stats.petCount).toBe(0);
    expect(partial.hasUnseen).toBe(true);
  });
});
