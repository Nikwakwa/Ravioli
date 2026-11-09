/**
 * Real-Time Atmosphere & Luxembourg Weather for Oli's Living Room and Balcony.
 */

export type AtmosphereMode = 'auto' | 'day' | 'sunset' | 'night';
export type TimeOfDay = 'day' | 'sunset' | 'night';

export const LUXEMBOURG_COORDS = {
  name: 'Luxembourg',
  latitude: 49.6116,
  longitude: 6.1319,
} as const;

export interface LiveWeatherInfo {
  city: string;
  temperatureC: number;
  weatherCode: number;
  label: string;
  emoji: string;
  isRaining: boolean;
  fetchedAt: number;
}

export interface AtmospherePrefs {
  mode: AtmosphereMode;
}

const LS_ATMOSPHERE_MODE = 'ravioli:v1:atmosphere_mode';
const LS_ATMOSPHERE_WEATHER_CACHE = 'ravioli:v1:atmosphere_weather_cache';

export const DEFAULT_ATMOSPHERE_PREFS: AtmospherePrefs = {
  mode: 'auto',
};

export function loadAtmospherePrefs(): AtmospherePrefs {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_ATMOSPHERE_PREFS;
    }
    const rawMode = window.localStorage.getItem(LS_ATMOSPHERE_MODE);
    const mode: AtmosphereMode =
      rawMode === 'day' || rawMode === 'sunset' || rawMode === 'night' || rawMode === 'auto'
        ? rawMode
        : 'auto';

    return { mode };
  } catch {
    return DEFAULT_ATMOSPHERE_PREFS;
  }
}

export function saveAtmospherePrefs(prefs: AtmospherePrefs): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(LS_ATMOSPHERE_MODE, prefs.mode);
  } catch {
    /* no-op */
  }
}

export function loadCachedWeather(): LiveWeatherInfo | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(LS_ATMOSPHERE_WEATHER_CACHE);
    if (!raw) return null;
    return JSON.parse(raw) as LiveWeatherInfo;
  } catch {
    return null;
  }
}

export function saveCachedWeather(info: LiveWeatherInfo): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(LS_ATMOSPHERE_WEATHER_CACHE, JSON.stringify(info));
  } catch {
    /* no-op */
  }
}

export function getWeatherDescription(code: number): { label: string; emoji: string } {
  switch (code) {
    case 0:
      return { label: 'Clear sky', emoji: '☀️' };
    case 1:
      return { label: 'Mainly clear', emoji: '🌤️' };
    case 2:
      return { label: 'Partly cloudy', emoji: '⛅' };
    case 3:
      return { label: 'Overcast', emoji: '☁️' };
    case 45:
    case 48:
      return { label: 'Foggy', emoji: '🌫️' };
    case 51:
      return { label: 'Light drizzle', emoji: '🌦️' };
    case 53:
      return { label: 'Drizzle', emoji: '🌦️' };
    case 55:
      return { label: 'Dense drizzle', emoji: '🌧️' };
    case 56:
    case 57:
      return { label: 'Freezing drizzle', emoji: '🌧️' };
    case 61:
      return { label: 'Light rain', emoji: '🌧️' };
    case 63:
      return { label: 'Moderate rain', emoji: '🌧️' };
    case 65:
      return { label: 'Heavy rain', emoji: '🌧️' };
    case 66:
    case 67:
      return { label: 'Freezing rain', emoji: '🌧️' };
    case 71:
      return { label: 'Light snow', emoji: '🌨️' };
    case 73:
      return { label: 'Moderate snow', emoji: '🌨️' };
    case 75:
      return { label: 'Heavy snow', emoji: '❄️' };
    case 77:
      return { label: 'Snow grains', emoji: '❄️' };
    case 80:
      return { label: 'Light showers', emoji: '🌦️' };
    case 81:
      return { label: 'Rain showers', emoji: '🌧️' };
    case 82:
      return { label: 'Violent showers', emoji: '⛈️' };
    case 85:
    case 86:
      return { label: 'Snow showers', emoji: '🌨️' };
    case 95:
      return { label: 'Thunderstorm', emoji: '⛈️' };
    case 96:
    case 99:
      return { label: 'Thunderstorm & hail', emoji: '⛈️' };
    default:
      return { label: 'Passing clouds', emoji: '🌤️' };
  }
}

export function isRainingFromWeather(
  code: number,
  precipitation = 0,
  rain = 0,
  showers = 0
): boolean {
  if (rain > 0.05 || showers > 0.05 || precipitation > 0.05) return true;
  return (
    (code >= 51 && code <= 67) || // drizzle, freezing drizzle, rain, freezing rain
    (code >= 80 && code <= 82) || // rain showers
    (code >= 95 && code <= 99) // thunderstorm
  );
}

export async function fetchLuxembourgWeather(): Promise<LiveWeatherInfo> {
  const { latitude, longitude, name } = LUXEMBOURG_COORDS;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,rain,showers,weather_code`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather request failed with status ${res.status}`);
  }
  const data = await res.json();
  const current = data.current ?? {};
  const code = Number(current.weather_code ?? 0);
  const temp = Number(current.temperature_2m ?? 15);
  const precip = Number(current.precipitation ?? 0);
  const rain = Number(current.rain ?? 0);
  const showers = Number(current.showers ?? 0);

  const { label, emoji } = getWeatherDescription(code);
  const isRaining = isRainingFromWeather(code, precip, rain, showers);

  const info: LiveWeatherInfo = {
    city: name,
    temperatureC: temp,
    weatherCode: code,
    label,
    emoji,
    isRaining,
    fetchedAt: Date.now(),
  };

  saveCachedWeather(info);
  return info;
}

/**
 * Calculates the effective time of day based on the user's preference and clock:
 * - Day: 07:00 – 17:30 (Morning & Afternoon daylight)
 * - Sunset: 17:30 – 20:30 (Golden hour & dusk glow)
 * - Night: 20:30 – 07:00 (Cozy nighttime & starlight)
 */
export function resolveTimeOfDay(mode: AtmosphereMode, date: Date = new Date()): TimeOfDay {
  if (mode === 'day' || mode === 'sunset' || mode === 'night') {
    return mode;
  }

  const hours = date.getHours() + date.getMinutes() / 60;

  if (hours >= 7 && hours < 17.5) {
    return 'day';
  }
  if (hours >= 17.5 && hours < 20.5) {
    return 'sunset';
  }
  return 'night';
}

export interface AtmosphereSummary {
  effectiveTime: TimeOfDay;
  isRaining: boolean;
  label: string;
  emoji: string;
  tagline: string;
}

export function getAtmosphereSummary(
  effectiveTime: TimeOfDay,
  isRaining: boolean,
  mode: AtmosphereMode = 'auto'
): AtmosphereSummary {
  if (isRaining) {
    const timeLabel =
      effectiveTime === 'night' ? 'Rainy Night' : effectiveTime === 'sunset' ? 'Rainy Sunset' : 'Rainy Day';
    return {
      effectiveTime,
      isRaining: true,
      label: `${timeLabel} (Luxembourg)`,
      emoji: '🌧️',
      tagline: 'Raining in Luxembourg — gentle raindrops sliding down the window pane for Cat TV.',
    };
  }

  switch (effectiveTime) {
    case 'sunset':
      return {
        effectiveTime: 'sunset',
        isRaining: false,
        label: mode === 'auto' ? 'Golden Hour (Auto)' : 'Golden Hour',
        emoji: '🌅',
        tagline: 'Warm amber sunset glow stretching across the living room and balcony.',
      };
    case 'night':
      return {
        effectiveTime: 'night',
        isRaining: false,
        label: mode === 'auto' ? 'Cozy Night (Auto)' : 'Cozy Night',
        emoji: '🌙',
        tagline: 'Deep starlit sky with the cozy windowsill lamp glowing.',
      };
    case 'day':
    default:
      return {
        effectiveTime: 'day',
        isRaining: false,
        label: mode === 'auto' ? 'Sunny Daylight (Auto)' : 'Sunny Daylight',
        emoji: '☀️',
        tagline: 'Bright, warm daylight with soft sunbeams streaming across the rug.',
      };
  }
}
