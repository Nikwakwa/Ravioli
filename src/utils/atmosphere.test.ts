import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateLuxembourgSunTimes,
  fetchLuxembourgAtmosphere,
  isRainingFromWeather,
  isRainingNow,
  loadCachedLuxembourgData,
  LUXEMBOURG_COORDS,
  resolveTimeOfDay,
  saveCachedLuxembourgData,
  type LiveLuxembourgData,
} from './atmosphere';

describe('Luxembourg Real-Time Atmosphere', () => {
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
    vi.restoreAllMocks();
  });

  it('has coordinates for Luxembourg City', () => {
    expect(LUXEMBOURG_COORDS.name).toBe('Luxembourg');
    expect(LUXEMBOURG_COORDS.latitude).toBeCloseTo(49.6116, 2);
    expect(LUXEMBOURG_COORDS.longitude).toBeCloseTo(6.1319, 2);
  });

  it('caches and loads live Luxembourg atmosphere data', () => {
    expect(loadCachedLuxembourgData()).toBeNull();
    const mock: LiveLuxembourgData = {
      temperatureC: 8.5,
      weatherCode: 61,
      isRaining: true,
      isDay: true,
      sunrise: '2026-11-09T07:37',
      sunset: '2026-11-09T17:00',
      fetchedAt: 12345678,
    };
    saveCachedLuxembourgData(mock);
    expect(loadCachedLuxembourgData()).toEqual(mock);
  });

  describe('resolveTimeOfDay based on real sunrise and sunset', () => {
    const sunTimes = {
      sunrise: '2026-11-09T07:30:00',
      sunset: '2026-11-09T17:00:00',
    };

    it('returns night before sunrise', () => {
      const predawn = new Date('2026-11-09T06:00:00');
      expect(resolveTimeOfDay(predawn, sunTimes)).toBe('night');
    });

    it('returns day after sunrise until golden hour begins', () => {
      const morning = new Date('2026-11-09T08:00:00');
      expect(resolveTimeOfDay(morning, sunTimes)).toBe('day');

      const midday = new Date('2026-11-09T12:00:00');
      expect(resolveTimeOfDay(midday, sunTimes)).toBe('day');

      const afternoon = new Date('2026-11-09T16:00:00');
      expect(resolveTimeOfDay(afternoon, sunTimes)).toBe('day');
    });

    it('returns sunset during golden hour (45 minutes before to 45 minutes after sunset)', () => {
      // Sunset is 17:00, golden hour is 16:15 to 17:45
      const earlySunset = new Date('2026-11-09T16:20:00');
      expect(resolveTimeOfDay(earlySunset, sunTimes)).toBe('sunset');

      const atSunset = new Date('2026-11-09T17:00:00');
      expect(resolveTimeOfDay(atSunset, sunTimes)).toBe('sunset');

      const dusk = new Date('2026-11-09T17:35:00');
      expect(resolveTimeOfDay(dusk, sunTimes)).toBe('sunset');
    });

    it('returns night after dusk', () => {
      const lateEvening = new Date('2026-11-09T18:00:00');
      expect(resolveTimeOfDay(lateEvening, sunTimes)).toBe('night');

      const midnight = new Date('2026-11-09T23:30:00');
      expect(resolveTimeOfDay(midnight, sunTimes)).toBe('night');
    });

    it('falls back to offline solar calculation if sunTimes are omitted', () => {
      // 13:00 and 01:00 in Luxembourg (CET = UTC+1), whatever time zone the test machine uses
      const midday = new Date(Date.UTC(2026, 10, 9, 12, 0));
      expect(resolveTimeOfDay(midday)).toBe('day');

      const midnight = new Date(Date.UTC(2026, 10, 9, 0, 0));
      expect(resolveTimeOfDay(midnight)).toBe('night');
    });

    it('gracefully handles malformed sunTimes strings without crashing', () => {
      const invalidSunTimes = { sunrise: 'corrupted-data', sunset: 'invalid-date' };
      const midday = new Date(Date.UTC(2026, 10, 9, 12, 0));
      expect(resolveTimeOfDay(midday, invalidSunTimes)).toBe('day');
    });

    it('gracefully handles invalid Date objects without crashing', () => {
      const invalidDate = new Date('not-a-date');
      expect(['day', 'sunset', 'night']).toContain(resolveTimeOfDay(invalidDate));
    });
  });

  describe('calculateLuxembourgSunTimes', () => {
    const utcHours = (d: Date) => d.getUTCHours() + d.getUTCMinutes() / 60;

    it('matches real Luxembourg sunrise and sunset in winter (in UTC, any phone time zone)', () => {
      // Real values for 9 Nov: sunrise ~06:37 UTC, sunset ~15:57 UTC
      const { sunrise, sunset } = calculateLuxembourgSunTimes(new Date(Date.UTC(2026, 10, 9, 12)));
      expect(utcHours(sunrise)).toBeGreaterThan(6.3);
      expect(utcHours(sunrise)).toBeLessThan(6.9);
      expect(utcHours(sunset)).toBeGreaterThan(15.7);
      expect(utcHours(sunset)).toBeLessThan(16.3);
    });

    it('stays correct in summer time', () => {
      // Real values for 21 Jun: sunrise ~03:30 UTC (05:30 CEST), sunset ~19:43 UTC (21:43 CEST)
      const { sunrise, sunset } = calculateLuxembourgSunTimes(new Date(Date.UTC(2026, 5, 21, 12)));
      expect(utcHours(sunrise)).toBeGreaterThan(3.2);
      expect(utcHours(sunrise)).toBeLessThan(3.8);
      expect(utcHours(sunset)).toBeGreaterThan(19.4);
      expect(utcHours(sunset)).toBeLessThan(20);
    });
  });

  describe('stale weather protection', () => {
    it('ignores saved sunrise/sunset from another day', () => {
      const yesterday = { sunrise: '2026-11-08T07:30:00', sunset: '2026-11-08T17:00:00' };
      // Midday today must be day, not night (yesterday's sunset is in the past)
      expect(resolveTimeOfDay(new Date(Date.UTC(2026, 10, 9, 11, 0)), yesterday)).toBe('day');
    });

    it('only shows rain from a recent report', () => {
      const base: LiveLuxembourgData = {
        temperatureC: 8,
        weatherCode: 61,
        isRaining: true,
        isDay: true,
        sunrise: '',
        sunset: '',
        fetchedAt: 1_000_000,
      };
      expect(isRainingNow(base, 1_000_000 + 60_000)).toBe(true);
      expect(isRainingNow(base, 1_000_000 + 4 * 3_600_000)).toBe(false);
      expect(isRainingNow({ ...base, isRaining: false }, 1_000_000)).toBe(false);
      expect(isRainingNow(null)).toBe(false);
    });

    it('drops corrupted cache entries', () => {
      store['ravioli:v1:luxembourg_atmosphere'] = '"oops"';
      expect(loadCachedLuxembourgData()).toBeNull();
      store['ravioli:v1:luxembourg_atmosphere'] = '{"isRaining":"yes"}';
      expect(loadCachedLuxembourgData()).toBeNull();
    });
  });

  describe('isRainingFromWeather', () => {
    it('detects rain from precipitation and rain metrics', () => {
      expect(isRainingFromWeather(0, 0.5, 0.4, 0)).toBe(true);
      expect(isRainingFromWeather(0, 0, 0, 0.2)).toBe(true);
      expect(isRainingFromWeather(0, 0, 0, 0)).toBe(false);
    });

    it('detects rain from WMO rain codes', () => {
      expect(isRainingFromWeather(51)).toBe(true); // Light drizzle
      expect(isRainingFromWeather(61)).toBe(true); // Light rain
      expect(isRainingFromWeather(65)).toBe(true); // Heavy rain
      expect(isRainingFromWeather(80)).toBe(true); // Rain showers
      expect(isRainingFromWeather(95)).toBe(true); // Thunderstorm
      expect(isRainingFromWeather(0)).toBe(false); // Clear sky
      expect(isRainingFromWeather(2)).toBe(false); // Partly cloudy
      expect(isRainingFromWeather(3)).toBe(false); // Overcast
    });
  });

  describe('fetchLuxembourgAtmosphere', () => {
    it('fetches real weather and daily sunrise/sunset from Open-Meteo', async () => {
      const mockResponse = {
        current: {
          weather_code: 61,
          temperature_2m: 9.5,
          precipitation: 0.8,
          rain: 0.8,
          showers: 0.0,
          is_day: 1,
        },
        daily: {
          // Unix seconds (timeformat=unixtime)
          sunrise: [Date.UTC(2026, 10, 9, 6, 37) / 1000],
          sunset: [Date.UTC(2026, 10, 9, 16, 0) / 1000],
        },
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as any);

      try {
        const info = await fetchLuxembourgAtmosphere();
        expect(info.temperatureC).toBe(9.5);
        expect(info.weatherCode).toBe(61);
        expect(info.isRaining).toBe(true);
        expect(info.isDay).toBe(true);
        expect(info.sunrise).toBe('2026-11-09T06:37:00.000Z');
        expect(info.sunset).toBe('2026-11-09T16:00:00.000Z');
        expect(loadCachedLuxembourgData()?.sunrise).toBe('2026-11-09T06:37:00.000Z');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });
});
