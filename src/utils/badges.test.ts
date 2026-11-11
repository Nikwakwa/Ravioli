import { beforeEach, describe, expect, it } from 'vitest';
import {
  BADGES,
  INITIAL_STATS,
  badgeById,
  checkBadgeTier,
  countEarnedMedals,
  getBadgeLevel,
  getBadgeProgress,
  getBadgeState,
  sanitizeBadgeState,
  setBadgeState,
  trackBoxNap,
  trackFeed,
  type BadgeState,
} from './badges';

const mockState: BadgeState = {
  unlockedIds: [],
  levels: {},
  unlockedAt: {},
  stats: { ...INITIAL_STATS },
  hasUnseen: false,
};

describe('secret discovery badges utility (Bronze, Silver, Gold tiers)', () => {
  beforeEach(() => {
    setBadgeState({ ...mockState, levels: {}, stats: { ...INITIAL_STATS, foodsTried: [], daysVisited: [] } });
  });

  it('defines 12 authentic secret badges with Bronze, Silver, Gold tiers', () => {
    expect(BADGES.length).toBe(12);
    const ids = BADGES.map((b) => b.id);
    expect(new Set(ids).size).toBe(12);
    BADGES.forEach((b) => {
      expect(b.name.length).toBeGreaterThan(0);
      expect(b.emoji.length).toBeGreaterThan(0);
      expect(b.description.length).toBeGreaterThan(0);
      expect(b.hint.length).toBeGreaterThan(0);
      expect(b.tiers.bronze.target).toBeGreaterThan(0);
      expect(b.tiers.silver.target).toBeGreaterThan(b.tiers.bronze.target);
      expect(b.tiers.gold.target).toBeGreaterThan(b.tiers.silver.target);
      expect(badgeById(b.id)).toBe(b);
    });
  });

  it('evaluates box naps unlock across Bronze (3), Silver (10), Gold (25)', () => {
    expect(checkBadgeTier('box_sitter', 'bronze', { ...INITIAL_STATS, boxNaps: 2 })).toBe(false);
    expect(checkBadgeTier('box_sitter', 'bronze', { ...INITIAL_STATS, boxNaps: 3 })).toBe(true);
    expect(checkBadgeTier('box_sitter', 'silver', { ...INITIAL_STATS, boxNaps: 9 })).toBe(false);
    expect(checkBadgeTier('box_sitter', 'silver', { ...INITIAL_STATS, boxNaps: 10 })).toBe(true);
    expect(checkBadgeTier('box_sitter', 'gold', { ...INITIAL_STATS, boxNaps: 24 })).toBe(false);
    expect(checkBadgeTier('box_sitter', 'gold', { ...INITIAL_STATS, boxNaps: 25 })).toBe(true);

    trackBoxNap();
    trackBoxNap();
    const bronzeUnlocks = trackBoxNap();
    expect(bronzeUnlocks.length).toBe(1);
    expect(bronzeUnlocks[0].badge.id).toBe('box_sitter');
    expect(bronzeUnlocks[0].tier).toBe('bronze');
    expect(bronzeUnlocks[0].isLevelUp).toBe(false);
    expect(getBadgeLevel(getBadgeState(), 'box_sitter')).toBe('bronze');

    // Reach Silver at 10 naps
    for (let i = 0; i < 6; i++) {
      trackBoxNap();
    }
    expect(getBadgeLevel(getBadgeState(), 'box_sitter')).toBe('bronze');
    const silverUnlocks = trackBoxNap(); // 10th nap
    expect(silverUnlocks.length).toBe(1);
    expect(silverUnlocks[0].tier).toBe('silver');
    expect(silverUnlocks[0].isLevelUp).toBe(true);
    expect(getBadgeLevel(getBadgeState(), 'box_sitter')).toBe('silver');
  });

  it('evaluates midnight feeding after 10 PM and levels up', () => {
    expect(checkBadgeTier('midnight_snack', 'bronze', { ...INITIAL_STATS, midnightFeeds: 0 })).toBe(false);
    expect(checkBadgeTier('midnight_snack', 'bronze', { ...INITIAL_STATS, midnightFeeds: 1 })).toBe(true);

    // Feed at 14:00 (2 PM) - no midnight snack
    const afternoonUnlocks = trackFeed('wet_food', 14);
    expect(afternoonUnlocks.some((u) => u.badge.id === 'midnight_snack')).toBe(false);

    // Feed at 23:00 (11 PM) - triggers bronze midnight snack
    const nightUnlocks = trackFeed('chicken_heart', 23);
    expect(nightUnlocks.some((u) => u.badge.id === 'midnight_snack' && u.tier === 'bronze')).toBe(true);
    expect(getBadgeLevel(getBadgeState(), 'midnight_snack')).toBe('bronze');
  });

  it('evaluates gourmet whiskers across Bronze, Silver, Gold', () => {
    const incomplete = { ...INITIAL_STATS, foodsTried: ['wet_food', 'quail_egg'], feedCount: 20 };
    expect(checkBadgeTier('gourmet_whiskers', 'bronze', incomplete)).toBe(false);

    const bronze = {
      ...INITIAL_STATS,
      foodsTried: ['wet_food', 'quail_egg', 'chicken_heart', 'churu'],
      feedCount: 4,
    };
    expect(checkBadgeTier('gourmet_whiskers', 'bronze', bronze)).toBe(true);
    expect(checkBadgeTier('gourmet_whiskers', 'silver', bronze)).toBe(false);

    const silver = { ...bronze, feedCount: 15 };
    expect(checkBadgeTier('gourmet_whiskers', 'silver', silver)).toBe(true);
    expect(checkBadgeTier('gourmet_whiskers', 'gold', silver)).toBe(false);

    const gold = { ...bronze, feedCount: 40 };
    expect(checkBadgeTier('gourmet_whiskers', 'gold', gold)).toBe(true);
  });

  it('tracks progress towards next tier correctly', () => {
    const stats = { ...INITIAL_STATS, boxNaps: 5 };
    const bronzeProgress = getBadgeProgress('box_sitter', stats, 'bronze');
    expect(bronzeProgress.current).toBe(5);
    expect(bronzeProgress.target).toBe(10); // silver target
    expect(bronzeProgress.label).toBe('10 box naps');

    const goldProgress = getBadgeProgress('box_sitter', { ...INITIAL_STATS, boxNaps: 30 }, 'gold');
    expect(goldProgress.label).toContain('Max Level');
  });

  it('counts earned medals accurately', () => {
    const state: BadgeState = {
      unlockedIds: ['box_sitter', 'midnight_snack', 'rainy_day'],
      levels: {
        box_sitter: 'gold', // 3 medals
        midnight_snack: 'silver', // 2 medals
        rainy_day: 'bronze', // 1 medal
      },
      unlockedAt: {},
      stats: { ...INITIAL_STATS },
      hasUnseen: false,
    };

    const medals = countEarnedMedals(state);
    expect(medals.gold).toBe(1);
    expect(medals.silver).toBe(2);
    expect(medals.bronze).toBe(3);
    expect(medals.total).toBe(6);
  });

  it('sanitizes bad and legacy state cleanly', () => {
    const clean = sanitizeBadgeState(null);
    expect(clean.unlockedIds).toEqual([]);
    expect(clean.levels).toEqual({});
    expect(clean.stats.boxNaps).toBe(0);

    // Legacy state with unlockedIds only should populate bronze levels
    const legacy = sanitizeBadgeState({
      unlockedIds: ['box_sitter'],
      stats: { boxNaps: 5, petCount: -2 },
      hasUnseen: 1,
    });
    expect(legacy.unlockedIds).toEqual(['box_sitter']);
    expect(legacy.levels.box_sitter).toBe('bronze');
    expect(legacy.stats.boxNaps).toBe(5);
    expect(legacy.stats.petCount).toBe(0);
    expect(legacy.hasUnseen).toBe(true);
  });
});
