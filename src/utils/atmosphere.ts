/**
 * Real-Time Atmosphere & Cozy Weather for Oli's Living Room and Balcony.
 */

export type AtmosphereMode = 'auto' | 'day' | 'sunset' | 'night';
export type TimeOfDay = 'day' | 'sunset' | 'night';

export interface WeatherLocation {
  name: string;
  latitude: number;
  longitude: number;
}

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
  rain: boolean;
  weatherSync?: boolean;
  location?: WeatherLocation | null;
}

const LS_ATMOSPHERE_MODE = 'ravioli:v1:atmosphere_mode';
const LS_ATMOSPHERE_RAIN = 'ravioli:v1:atmosphere_rain';
const LS_ATMOSPHERE_WEATHER_SYNC = 'ravioli:v1:atmosphere_weather_sync';
const LS_ATMOSPHERE_LOCATION = 'ravioli:v1:atmosphere_weather_location';
const LS_ATMOSPHERE_WEATHER_CACHE = 'ravioli:v1:atmosphere_weather_cache';

export const DEFAULT_ATMOSPHERE_PREFS: AtmospherePrefs = {
  mode: 'auto',
  rain: false,
  weatherSync: false,
  location: null,
};

export function loadAtmospherePrefs(): AtmospherePrefs {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_ATMOSPHERE_PREFS;
    }
    const rawMode = window.localStorage.getItem(LS_ATMOSPHERE_MODE);
    const rawRain = window.localStorage.getItem(LS_ATMOSPHERE_RAIN);
    const rawSync = window.localStorage.getItem(LS_ATMOSPHERE_WEATHER_SYNC);
    const rawLoc = window.localStorage.getItem(LS_ATMOSPHERE_LOCATION);

    const mode: AtmosphereMode =
      rawMode === 'day' || rawMode === 'sunset' || rawMode === 'night' || rawMode === 'auto'
        ? rawMode
        : 'auto';

    const rain = rawRain === 'true';
    const weatherSync = rawSync === 'true';

    let location: WeatherLocation | null = null;
    if (rawLoc) {
      try {
        location = JSON.parse(rawLoc);
      } catch {
        location = null;
      }
    }

    return { mode, rain, weatherSync, location };
  } catch {
    return DEFAULT_ATMOSPHERE_PREFS;
  }
}

export function saveAtmospherePrefs(prefs: AtmospherePrefs): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(LS_ATMOSPHERE_MODE, prefs.mode);
    window.localStorage.setItem(LS_ATMOSPHERE_RAIN, prefs.rain ? 'true' : 'false');
    window.localStorage.setItem(LS_ATMOSPHERE_WEATHER_SYNC, prefs.weatherSync ? 'true' : 'false');
    if (prefs.location) {
      window.localStorage.setItem(LS_ATMOSPHERE_LOCATION, JSON.stringify(prefs.location));
    } else {
      window.localStorage.removeItem(LS_ATMOSPHERE_LOCATION);
    }
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

export async function fetchWeatherForCoords(
  latitude: number,
  longitude: number,
  cityName = 'My Location'
): Promise<LiveWeatherInfo> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,rain,showers,weather_code`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Weather request failed with status ${res.status}`);
  }
  const data = await res.json();
  const current = data.current ?? {};
  const code = Number(current.weather_code ?? 0);
  const temp = Number(current.temperature_2m ?? 20);
  const precip = Number(current.precipitation ?? 0);
  const rain = Number(current.rain ?? 0);
  const showers = Number(current.showers ?? 0);

  const { label, emoji } = getWeatherDescription(code);
  const isRaining = isRainingFromWeather(code, precip, rain, showers);

  const info: LiveWeatherInfo = {
    city: cityName,
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

export async function searchCityCoords(query: string): Promise<WeatherLocation | null> {
  const trimmed = query.trim();
  if (!trimmed) return null;
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(trimmed)}&count=1&language=en&format=json`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  const first = data.results?.[0];
  if (!first) return null;
  return {
    name: first.name + (first.country ? `, ${first.country}` : ''),
    latitude: first.latitude,
    longitude: first.longitude,
  };
}

export async function reverseGeocodeCity(lat: number, lon: number): Promise<string> {
  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`;
    const res = await fetch(url);
    if (!res.ok) return 'My Location';
    const data = await res.json();
    return data.city || data.locality || data.principalSubdivision || 'My Location';
  } catch {
    return 'My Location';
  }
}

export function requestBrowserCoords(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('Geolocation is not supported by your browser'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => {
        reject(err);
      },
      { timeout: 10000, maximumAge: 600000 }
    );
  });
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
  weatherCity?: string;
}

export function getAtmosphereSummary(
  effectiveTime: TimeOfDay,
  isRaining: boolean,
  mode: AtmosphereMode = 'auto',
  weatherCity?: string
): AtmosphereSummary {
  if (isRaining) {
    const timeLabel =
      effectiveTime === 'night' ? 'Rainy Night' : effectiveTime === 'sunset' ? 'Rainy Sunset' : 'Rainy Day';
    return {
      effectiveTime,
      isRaining: true,
      label: weatherCity ? `${timeLabel} (${weatherCity})` : timeLabel,
      emoji: '🌧️',
      tagline: weatherCity
        ? `Gentle raindrops matching real weather in ${weatherCity} for Oli's Cat TV.`
        : "Gentle raindrops sliding down the window pane for Oli's favorite Cat TV.",
      weatherCity,
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
        weatherCity,
      };
    case 'night':
      return {
        effectiveTime: 'night',
        isRaining: false,
        label: mode === 'auto' ? 'Cozy Night (Auto)' : 'Cozy Night',
        emoji: '🌙',
        tagline: 'Deep starlit sky with the cozy windowsill lamp glowing.',
        weatherCity,
      };
    case 'day':
    default:
      return {
        effectiveTime: 'day',
        isRaining: false,
        label: mode === 'auto' ? 'Sunny Daylight (Auto)' : 'Sunny Daylight',
        emoji: '☀️',
        tagline: 'Bright, warm daylight with soft sunbeams streaming across the rug.',
        weatherCity,
      };
  }
}
