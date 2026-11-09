/**
 * Automatic Real-Time Atmosphere for Luxembourg City.
 * Dynamically tracks real sunrise, sunset, and rain data with zero manual configuration.
 */

export type TimeOfDay = 'day' | 'sunset' | 'night';

export const LUXEMBOURG_COORDS = {
  name: 'Luxembourg',
  latitude: 49.6116,
  longitude: 6.1319,
} as const;

export interface LiveLuxembourgData {
  temperatureC: number;
  weatherCode: number;
  isRaining: boolean;
  isDay: boolean;
  sunrise: string;
  sunset: string;
  fetchedAt: number;
}

const LS_LUXEMBOURG_CACHE = 'ravioli:v1:luxembourg_atmosphere';

export function loadCachedLuxembourgData(): LiveLuxembourgData | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(LS_LUXEMBOURG_CACHE);
    if (!raw) return null;
    return JSON.parse(raw) as LiveLuxembourgData;
  } catch {
    return null;
  }
}

export function saveCachedLuxembourgData(data: LiveLuxembourgData): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(LS_LUXEMBOURG_CACHE, JSON.stringify(data));
  } catch {
    /* no-op */
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

/**
 * Solar position approximation for Luxembourg (latitude: 49.6116, longitude: 6.1319).
 * Used as an immediate offline fallback before any API response is received.
 */
export function calculateLuxembourgSunTimes(date: Date = new Date()): { sunrise: Date; sunset: Date } {
  const safeDate = Number.isFinite(date.getTime()) ? date : new Date();
  const startOfYear = new Date(Date.UTC(safeDate.getUTCFullYear(), 0, 0));
  const diff = safeDate.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));

  // Approximate solar declination in radians
  const declination = -0.4093 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  const latRad = (LUXEMBOURG_COORDS.latitude * Math.PI) / 180;

  const cosHourAngle = -Math.tan(latRad) * Math.tan(declination);
  const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHourAngle)));
  const daylightHalfHours = ((hourAngle * 180) / Math.PI) / 15;

  // Luxembourg time zone offset: UTC+1 in winter (CET), UTC+2 in summer (CEST)
  // Solar noon ~ 12:35 local CET
  const solarNoonHours = 12.6;
  const sunriseHours = solarNoonHours - daylightHalfHours;
  const sunsetHours = solarNoonHours + daylightHalfHours;

  const sunrise = new Date(safeDate);
  sunrise.setHours(Math.floor(sunriseHours), Math.round((sunriseHours % 1) * 60), 0, 0);

  const sunset = new Date(safeDate);
  sunset.setHours(Math.floor(sunsetHours), Math.round((sunsetHours % 1) * 60), 0, 0);

  return { sunrise, sunset };
}

/**
 * Calculates current lighting mode (day, golden sunset, or cozy night)
 * dynamically matching the real solar sunrise and sunset.
 *
 * - Golden hour / sunset: 45 minutes before sunset until 45 minutes after sunset
 * - Day: Between sunrise and golden hour
 * - Night: All other hours (before sunrise, or after dusk)
 */
export function resolveTimeOfDay(
  date: Date = new Date(),
  sunTimes?: { sunrise?: string; sunset?: string } | null
): TimeOfDay {
  const safeDate = Number.isFinite(date.getTime()) ? date : new Date();
  let sunriseDate: Date;
  let sunsetDate: Date;

  if (
    sunTimes?.sunrise &&
    sunTimes?.sunset &&
    Number.isFinite(new Date(sunTimes.sunrise).getTime()) &&
    Number.isFinite(new Date(sunTimes.sunset).getTime())
  ) {
    sunriseDate = new Date(sunTimes.sunrise);
    sunsetDate = new Date(sunTimes.sunset);
  } else {
    const calc = calculateLuxembourgSunTimes(safeDate);
    sunriseDate = calc.sunrise;
    sunsetDate = calc.sunset;
  }

  const t = safeDate.getTime();
  const sunriseMs = sunriseDate.getTime();
  const sunsetMs = sunsetDate.getTime();

  // Golden hour starts 45 minutes before sunset and ends 45 minutes after sunset
  const sunsetWindowStart = sunsetMs - 45 * 60 * 1000;
  const sunsetWindowEnd = sunsetMs + 45 * 60 * 1000;

  if (t < sunriseMs) {
    return 'night';
  }
  if (t >= sunriseMs && t < sunsetWindowStart) {
    return 'day';
  }
  if (t >= sunsetWindowStart && t < sunsetWindowEnd) {
    return 'sunset';
  }
  return 'night';
}

export async function fetchLuxembourgAtmosphere(): Promise<LiveLuxembourgData> {
  const { latitude, longitude } = LUXEMBOURG_COORDS;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,rain,showers,weather_code,is_day&daily=sunrise,sunset&timezone=auto`;
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
  if (!res.ok) {
    throw new Error(`Weather request failed with status ${res.status}`);
  }
  const data = await res.json();
  const current = data.current ?? {};
  const daily = data.daily ?? {};

  const code = Number(current.weather_code ?? 0);
  const temp = Number(current.temperature_2m ?? 15);
  const precip = Number(current.precipitation ?? 0);
  const rain = Number(current.rain ?? 0);
  const showers = Number(current.showers ?? 0);
  const isDay = Boolean(current.is_day === 1);

  const isRaining = isRainingFromWeather(code, precip, rain, showers);
  const sunrise = daily.sunrise?.[0] ?? '';
  const sunset = daily.sunset?.[0] ?? '';

  const live: LiveLuxembourgData = {
    temperatureC: temp,
    weatherCode: code,
    isRaining,
    isDay,
    sunrise,
    sunset,
    fetchedAt: Date.now(),
  };

  saveCachedLuxembourgData(live);
  return live;
}
