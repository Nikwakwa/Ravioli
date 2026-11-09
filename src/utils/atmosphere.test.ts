import { describe, expect, it, beforeEach, afterEach } from 'vitest';
import {
  DEFAULT_ATMOSPHERE_PREFS,
  getAtmosphereSummary,
  loadAtmospherePrefs,
  resolveTimeOfDay,
  saveAtmospherePrefs,
} from './atmosphere';

describe('Atmosphere Utilities', () => {
  const store: Record<string, string> = {};

  beforeEach(() => {
    for (const k of Object.keys(store)) delete store[k];
    const mockStorage = {
      getItem: (key: string) => (key in store ? store[key] : null),
      setItem: (key: string, value: string) => {
        store[key] = value;
      },
      removeItem: (key: string) => {
        delete store[key];
      },
      clear: () => {
        for (const k of Object.keys(store)) delete store[k];
      },
      length: 0,
      key: () => null,
    };

    (globalThis as any).window = {
      localStorage: mockStorage,
    };
  });

  afterEach(() => {
    delete (globalThis as any).window;
  });

  it('loads default atmosphere preferences when localStorage is empty', () => {
    const prefs = loadAtmospherePrefs();
    expect(prefs).toEqual(DEFAULT_ATMOSPHERE_PREFS);
    expect(prefs.mode).toBe('auto');
    expect(prefs.rain).toBe(false);
  });

  it('saves and reloads custom atmosphere preferences', () => {
    saveAtmospherePrefs({ mode: 'sunset', rain: true });
    const prefs = loadAtmospherePrefs();
    expect(prefs.mode).toBe('sunset');
    expect(prefs.rain).toBe(true);
  });

  describe('resolveTimeOfDay in auto mode', () => {
    it('returns day during morning and afternoon (e.g. 10:30 AM, 3:00 PM)', () => {
      const morning = new Date(2026, 10, 8, 10, 30);
      expect(resolveTimeOfDay('auto', morning)).toBe('day');

      const afternoon = new Date(2026, 10, 8, 15, 0);
      expect(resolveTimeOfDay('auto', afternoon)).toBe('day');
    });

    it('returns sunset during golden hour (e.g. 6:00 PM, 7:45 PM)', () => {
      const sunset1 = new Date(2026, 10, 8, 18, 0);
      expect(resolveTimeOfDay('auto', sunset1)).toBe('sunset');

      const sunset2 = new Date(2026, 10, 8, 19, 45);
      expect(resolveTimeOfDay('auto', sunset2)).toBe('sunset');
    });

    it('returns night during late evening and night (e.g. 9:00 PM, 2:00 AM, 6:30 AM)', () => {
      const evening = new Date(2026, 10, 8, 21, 0);
      expect(resolveTimeOfDay('auto', evening)).toBe('night');

      const midnight = new Date(2026, 10, 8, 2, 0);
      expect(resolveTimeOfDay('auto', midnight)).toBe('night');

      const dawn = new Date(2026, 10, 8, 6, 30);
      expect(resolveTimeOfDay('auto', dawn)).toBe('night');
    });
  });

  describe('resolveTimeOfDay with manual overrides', () => {
    it('honors explicit day, sunset, and night overrides regardless of the clock', () => {
      const midnight = new Date(2026, 10, 8, 2, 0);
      expect(resolveTimeOfDay('day', midnight)).toBe('day');
      expect(resolveTimeOfDay('sunset', midnight)).toBe('sunset');
      expect(resolveTimeOfDay('night', midnight)).toBe('night');
    });
  });

  describe('getAtmosphereSummary', () => {
    it('returns rain summary when rain is active', () => {
      const summary = getAtmosphereSummary('day', true);
      expect(summary.emoji).toBe('🌧️');
      expect(summary.label).toBe('Rainy Day');
      expect(summary.isRaining).toBe(true);
    });

    it('returns sunset summary for sunset', () => {
      const summary = getAtmosphereSummary('sunset', false, 'auto');
      expect(summary.emoji).toBe('🌅');
      expect(summary.label).toContain('Golden Hour');
    });

    it('returns night summary for night', () => {
      const summary = getAtmosphereSummary('night', false, 'auto');
      expect(summary.emoji).toBe('🌙');
      expect(summary.label).toContain('Cozy Night');
    });

    it('returns day summary for day', () => {
      const summary = getAtmosphereSummary('day', false, 'auto');
      expect(summary.emoji).toBe('☀️');
      expect(summary.label).toContain('Sunny Daylight');
    });
  });
});
