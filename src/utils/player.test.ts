import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_PLAYER_NAME,
  hasSeenOnboarding,
  loadPlayer,
  markOnboardingSeen,
  playerColor,
  resetAllGameData,
  sanitizePlayerName,
  savePlayer,
} from './player';

const store = new Map<string, string>();
const mockLocalStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => store.set(k, String(v)),
  removeItem: (k: string) => store.delete(k),
  clear: () => store.clear(),
  get length() {
    return store.size;
  },
  key: (i: number) => Array.from(store.keys())[i] ?? null,
};

Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
  configurable: true,
});

describe('player utility & data management', () => {
  beforeEach(() => {
    mockLocalStorage.clear();
  });

  it('sanitizes player names safely', () => {
    expect(sanitizePlayerName('  <b>Alex</b>  ')).toBe('Alex');
    expect(sanitizePlayerName('Sam "The Cat"')).toBe('Sam The Cat');
    expect(sanitizePlayerName('A'.repeat(50))).toBe('A'.repeat(24));
  });

  it('loads default player name when none saved', () => {
    expect(loadPlayer()).toBe(DEFAULT_PLAYER_NAME);
  });

  it('saves and loads customized player name', () => {
    savePlayer('Jamie');
    expect(loadPlayer()).toBe('Jamie');
  });

  it('tracks onboarding completion flag', () => {
    expect(hasSeenOnboarding()).toBe(false);
    markOnboardingSeen();
    expect(hasSeenOnboarding()).toBe(true);
  });

  it('resets all ravioli:* keys but preserves unrelated keys', () => {
    mockLocalStorage.setItem('ravioli:player', 'Alex');
    mockLocalStorage.setItem('ravioli:v1:cat_state', '{"hunger":80}');
    mockLocalStorage.setItem('ravioli:v1:onboarding_completed', '1');
    mockLocalStorage.setItem('unrelated_app_setting', 'keep_me');

    expect(mockLocalStorage.length).toBe(4);

    resetAllGameData();

    expect(mockLocalStorage.getItem('ravioli:player')).toBeNull();
    expect(mockLocalStorage.getItem('ravioli:v1:cat_state')).toBeNull();
    expect(mockLocalStorage.getItem('ravioli:v1:onboarding_completed')).toBeNull();
    expect(mockLocalStorage.getItem('unrelated_app_setting')).toBe('keep_me');
  });

  it('generates stable pastel colors for names', () => {
    const c1 = playerColor('Alex');
    const c2 = playerColor('Alex');
    expect(c1).toEqual(c2);
    expect(c1.bg).toContain('hsl');
  });
});
