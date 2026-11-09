import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest';
import {
  DEFAULT_ATMOSPHERE_PREFS,
  fetchWeatherForCoords,
  getAtmosphereSummary,
  getWeatherDescription,
  isRainingFromWeather,
  loadAtmospherePrefs,
  loadCachedWeather,
  resolveTimeOfDay,
  reverseGeocodeCity,
  saveAtmospherePrefs,
  saveCachedWeather,
  searchCityCoords,
  type LiveWeatherInfo,
} from './atmosphere';

describe('Atmosphere Utilities & Weather Sync', () => {
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

  it('loads default atmosphere preferences when localStorage is empty', () => {
    const prefs = loadAtmospherePrefs();
    expect(prefs).toEqual(DEFAULT_ATMOSPHERE_PREFS);
    expect(prefs.mode).toBe('auto');
    expect(prefs.rain).toBe(false);
    expect(prefs.weatherSync).toBe(false);
    expect(prefs.location).toBeNull();
  });

  it('saves and reloads custom atmosphere preferences with weather sync and location', () => {
    saveAtmospherePrefs({
      mode: 'sunset',
      rain: true,
      weatherSync: true,
      location: { name: 'Seattle', latitude: 47.6, longitude: -122.33 },
    });
    const prefs = loadAtmospherePrefs();
    expect(prefs.mode).toBe('sunset');
    expect(prefs.rain).toBe(true);
    expect(prefs.weatherSync).toBe(true);
    expect(prefs.location?.name).toBe('Seattle');
    expect(prefs.location?.latitude).toBe(47.6);
  });

  it('caches and loads live weather info', () => {
    expect(loadCachedWeather()).toBeNull();
    const weather: LiveWeatherInfo = {
      city: 'Paris',
      temperatureC: 15,
      weatherCode: 61,
      label: 'Light rain',
      emoji: '🌧️',
      isRaining: true,
      fetchedAt: 12345678,
    };
    saveCachedWeather(weather);
    expect(loadCachedWeather()).toEqual(weather);
  });

  describe('isRainingFromWeather', () => {
    it('detects rain from precipitation and rain metrics', () => {
      expect(isRainingFromWeather(0, 0.5, 0.4, 0)).toBe(true);
      expect(isRainingFromWeather(0, 0, 0, 0.2)).toBe(true);
      expect(isRainingFromWeather(0, 0, 0, 0)).toBe(false);
    });

    it('detects rain from WMO rain codes (drizzle, rain, showers, storms)', () => {
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

  describe('getWeatherDescription', () => {
    it('maps WMO codes to friendly labels and emojis', () => {
      expect(getWeatherDescription(0)).toEqual({ label: 'Clear sky', emoji: '☀️' });
      expect(getWeatherDescription(2)).toEqual({ label: 'Partly cloudy', emoji: '⛅' });
      expect(getWeatherDescription(61)).toEqual({ label: 'Light rain', emoji: '🌧️' });
      expect(getWeatherDescription(95)).toEqual({ label: 'Thunderstorm', emoji: '⛈️' });
    });
  });

  describe('fetchWeatherForCoords', () => {
    it('fetches real weather from Open-Meteo API', async () => {
      const mockResponse = {
        current: {
          weather_code: 61,
          temperature_2m: 14.5,
          precipitation: 1.2,
          rain: 1.2,
          showers: 0.0,
        },
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as any);

      try {
        const info = await fetchWeatherForCoords(48.85, 2.35, 'Paris');
        expect(info.city).toBe('Paris');
        expect(info.temperatureC).toBe(14.5);
        expect(info.weatherCode).toBe(61);
        expect(info.isRaining).toBe(true);
        expect(info.label).toBe('Light rain');
        expect(info.emoji).toBe('🌧️');
        expect(loadCachedWeather()?.city).toBe('Paris');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe('searchCityCoords', () => {
    it('searches for city coordinates via Open-Meteo Geocoding API', async () => {
      const mockResponse = {
        results: [
          {
            name: 'Tokyo',
            country: 'Japan',
            latitude: 35.68,
            longitude: 139.76,
          },
        ],
      };

      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as any);

      try {
        const result = await searchCityCoords('Tokyo');
        expect(result).toEqual({
          name: 'Tokyo, Japan',
          latitude: 35.68,
          longitude: 139.76,
        });
      } finally {
        globalThis.fetch = originalFetch;
      }
    });

    it('returns null if city query is empty or no results', async () => {
      expect(await searchCityCoords('')).toBeNull();
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ results: [] }),
      } as any);
      try {
        expect(await searchCityCoords('nonexistentcity12345')).toBeNull();
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe('reverseGeocodeCity', () => {
    it('returns city name from reverse geocoding API', async () => {
      const originalFetch = globalThis.fetch;
      globalThis.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ city: 'London' }),
      } as any);
      try {
        expect(await reverseGeocodeCity(51.5, -0.12)).toBe('London');
      } finally {
        globalThis.fetch = originalFetch;
      }
    });
  });

  describe('resolveTimeOfDay in auto mode', () => {
    it('returns day during morning and afternoon', () => {
      const morning = new Date(2026, 10, 8, 10, 30);
      expect(resolveTimeOfDay('auto', morning)).toBe('day');
      const afternoon = new Date(2026, 10, 8, 15, 0);
      expect(resolveTimeOfDay('auto', afternoon)).toBe('day');
    });

    it('returns sunset during golden hour', () => {
      const sunset1 = new Date(2026, 10, 8, 18, 0);
      expect(resolveTimeOfDay('auto', sunset1)).toBe('sunset');
    });

    it('returns night during late evening and night', () => {
      const evening = new Date(2026, 10, 8, 21, 0);
      expect(resolveTimeOfDay('auto', evening)).toBe('night');
    });
  });

  describe('getAtmosphereSummary', () => {
    it('returns rain summary when rain is active', () => {
      const summary = getAtmosphereSummary('day', true, 'auto', 'Paris');
      expect(summary.emoji).toBe('🌧️');
      expect(summary.label).toBe('Rainy Day (Paris)');
      expect(summary.isRaining).toBe(true);
      expect(summary.weatherCity).toBe('Paris');
    });

    it('returns sunset summary for sunset', () => {
      const summary = getAtmosphereSummary('sunset', false, 'auto');
      expect(summary.emoji).toBe('🌅');
      expect(summary.label).toBe('Golden Hour (Auto)');
      expect(summary.isRaining).toBe(false);
    });
  });
});
