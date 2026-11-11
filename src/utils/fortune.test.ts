import { describe, expect, it } from 'vitest';
import {
  FORTUNE_COOKIE_PRICE,
  FORTUNES,
  canAffordFortune,
  getFortuneIndexForDate,
  getTodayDateString,
  getTodayFortune,
  hasOpenedToday,
  isFortuneReady,
  isFortuneUnlocked,
  sanitizeFortune,
  type FortuneState,
} from './fortune';

describe('daily fortune cookie utility', () => {
  it('has a collection of unique, numbered fortunes', () => {
    expect(FORTUNES.length).toBeGreaterThanOrEqual(30);
    const ids = FORTUNES.map((f) => f.id);
    expect(new Set(ids).size).toBe(FORTUNES.length);
    FORTUNES.forEach((f) => {
      expect(f.text.length).toBeGreaterThan(10);
      expect(f.luckySpot).toBeDefined();
      expect(f.luckySnack).toBeDefined();
      expect(f.luckyVibe).toBeDefined();
    });
  });

  it('determines affordability based on Churu stash and cookie price', () => {
    expect(FORTUNE_COOKIE_PRICE).toBe(5);
    expect(canAffordFortune(0)).toBe(false);
    expect(canAffordFortune(4)).toBe(false);
    expect(canAffordFortune(5)).toBe(true);
    expect(canAffordFortune(10)).toBe(true);
  });

  it('formats dates consistently in YYYY-MM-DD format', () => {
    const testDate = new Date(2026, 10, 11); // Nov 11, 2026
    expect(getTodayDateString(testDate)).toBe('2026-11-11');
  });

  it('generates consistent fortune index for the same date', () => {
    const d1 = new Date(2026, 10, 11, 8, 30);
    const d2 = new Date(2026, 10, 11, 22, 15);
    expect(getFortuneIndexForDate(d1)).toBe(getFortuneIndexForDate(d2));
    expect(getFortuneIndexForDate(d1)).toBeGreaterThanOrEqual(0);
    expect(getFortuneIndexForDate(d1)).toBeLessThan(FORTUNES.length);
  });

  it('reports opened and ready states accurately', () => {
    const lockedState: FortuneState = { unlocked: false, lastOpenedDate: null, todayFortuneId: null };
    expect(isFortuneUnlocked(lockedState)).toBe(false);
    expect(isFortuneReady(lockedState)).toBe(false);

    const unlockedUnopened: FortuneState = { unlocked: true, lastOpenedDate: null, todayFortuneId: null };
    expect(isFortuneUnlocked(unlockedUnopened)).toBe(true);
    expect(isFortuneReady(unlockedUnopened)).toBe(true);

    const todayStr = getTodayDateString();
    const openedToday: FortuneState = { unlocked: true, lastOpenedDate: todayStr, todayFortuneId: 1 };
    expect(hasOpenedToday(openedToday)).toBe(true);
    expect(isFortuneReady(openedToday)).toBe(false);

    const openedYesterday: FortuneState = { unlocked: true, lastOpenedDate: '2020-01-01', todayFortuneId: 1 };
    expect(hasOpenedToday(openedYesterday)).toBe(false);
    expect(isFortuneReady(openedYesterday)).toBe(true);
  });

  it('returns consistent fortune when opened today', () => {
    const testDate = new Date(2026, 10, 11);
    const todayStr = getTodayDateString(testDate);
    const state: FortuneState = { unlocked: true, lastOpenedDate: todayStr, todayFortuneId: 4 };
    expect(getTodayFortune(state, testDate).id).toBe(4);
  });

  it('sanitizes malformed localStorage data safely', () => {
    expect(sanitizeFortune(null)).toEqual({ unlocked: false, lastOpenedDate: null, todayFortuneId: null });
    expect(sanitizeFortune('invalid')).toEqual({ unlocked: false, lastOpenedDate: null, todayFortuneId: null });
    expect(sanitizeFortune({ unlocked: true, lastOpenedDate: '2026-11-11', todayFortuneId: 2 })).toEqual({
      unlocked: true,
      lastOpenedDate: '2026-11-11',
      todayFortuneId: 2,
    });
    expect(sanitizeFortune({ unlocked: 1, lastOpenedDate: 42, todayFortuneId: 'none' })).toEqual({
      unlocked: true,
      lastOpenedDate: null,
      todayFortuneId: null,
    });
  });
});
