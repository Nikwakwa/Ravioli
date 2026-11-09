/**
 * Automatic Real-Time Atmosphere for Luxembourg City.
 * Dynamically tracks real sunrise, sunset, and rain data with zero manual configuration.
 */
import { timeoutSignal } from './net';

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

/** Rain reports older than this are ignored, so an old shower never sticks to the window. */
export const RAIN_MAX_AGE_MS = 3 * 60 * 60 * 1000;

export function loadCachedLuxembourgData(): LiveLuxembourgData | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return null;
    const raw = window.localStorage.getItem(LS_LUXEMBOURG_CACHE);
    if (!raw) return null;
    const p = JSON.parse(raw) as Partial<LiveLuxembourgData> | null;
    if (!p || typeof p !== 'object') return null;
    if (typeof p.fetchedAt !== 'number' || !Number.isFinite(p.fetchedAt)) return null;
    return {
      temperatureC: typeof p.temperatureC === 'number' && Number.isFinite(p.temperatureC) ? p.temperatureC : 15,
      weatherCode: typeof p.weatherCode === 'number' && Number.isFinite(p.weatherCode) ? p.weatherCode : 0,
      isRaining: p.isRaining === true,
      isDay: p.isDay === true,
      sunrise: typeof p.sunrise === 'string' ? p.sunrise : '',
      sunset: typeof p.sunset === 'string' ? p.sunset : '',
      fetchedAt: p.fetchedAt,
    };
  } catch {
    return null;
  }
}

/** True only while the latest weather report is recent and says it is raining. */
export function isRainingNow(data: LiveLuxembourgData | null | undefined, nowMs: number = Date.now()): boolean {
  if (!data?.isRaining) return false;
  const age = nowMs - data.fetchedAt;
  return age >= 0 && age < RAIN_MAX_AGE_MS;
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
 * Used as an offline fallback before any API response is received.
 * Computed in UTC, so it stays right in summer time and on phones set to any time zone.
 */
export function calculateLuxembourgSunTimes(date: Date = new Date()): { sunrise: Date; sunset: Date } {
  const safeDate = Number.isFinite(date.getTime()) ? date : new Date();
  const dayStartUtc = Date.UTC(safeDate.getUTCFullYear(), safeDate.getUTCMonth(), safeDate.getUTCDate());
  const startOfYear = Date.UTC(safeDate.getUTCFullYear(), 0, 0);
  const dayOfYear = Math.floor((dayStartUtc - startOfYear) / 86_400_000);

  // Approximate solar declination (radians)
  const declination = -0.4093 * Math.cos(((2 * Math.PI) / 365) * (dayOfYear + 10));
  const latRad = (LUXEMBOURG_COORDS.latitude * Math.PI) / 180;

  // Sun's upper edge on the horizon, including atmospheric refraction (-0.833°)
  const horizon = (-0.833 * Math.PI) / 180;
  const cosHourAngle =
    (Math.sin(horizon) - Math.sin(latRad) * Math.sin(declination)) / (Math.cos(latRad) * Math.cos(declination));
  const hourAngle = Math.acos(Math.max(-1, Math.min(1, cosHourAngle)));
  const halfDayHours = (hourAngle * 180) / Math.PI / 15;

  // Equation of time (minutes) shifts solar noon through the year
  const b = ((2 * Math.PI) / 365) * (dayOfYear - 81);
  const equationOfTimeMin = 9.87 * Math.sin(2 * b) - 7.53 * Math.cos(b) - 1.5 * Math.sin(b);
  const solarNoonUtcHours = 12 - LUXEMBOURG_COORDS.longitude / 15 - equationOfTimeMin / 60;

  const toDate = (hours: number) => new Date(dayStartUtc + Math.round(hours * 3_600_000));
  return {
    sunrise: toDate(solarNoonUtcHours - halfDayHours),
    sunset: toDate(solarNoonUtcHours + halfDayHours),
  };
}

function sameLocalDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
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

  const apiSunrise = typeof sunTimes?.sunrise === 'string' ? new Date(sunTimes.sunrise) : null;
  const apiSunset = typeof sunTimes?.sunset === 'string' ? new Date(sunTimes.sunset) : null;

  // Only trust saved sunrise/sunset for the same day: yesterday's times would turn today into night.
  if (
    apiSunrise &&
    apiSunset &&
    Number.isFinite(apiSunrise.getTime()) &&
    Number.isFinite(apiSunset.getTime()) &&
    sameLocalDay(apiSunrise, safeDate)
  ) {
    sunriseDate = apiSunrise;
    sunsetDate = apiSunset;
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

function toIsoTime(value: unknown): string {
  if (typeof value === 'number' && Number.isFinite(value)) return new Date(value * 1000).toISOString();
  if (typeof value === 'string' && Number.isFinite(new Date(value).getTime())) return value;
  return '';
}

export async function fetchLuxembourgAtmosphere(): Promise<LiveLuxembourgData> {
  const { latitude, longitude } = LUXEMBOURG_COORDS;
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,precipitation,rain,showers,weather_code,is_day&daily=sunrise,sunset&timezone=auto&timeformat=unixtime`;
  const res = await fetch(url, { signal: timeoutSignal(8000) });
  if (!res.ok) {
    throw new Error(`Weather request failed with status ${res.status}`);
  }
  const data = await res.json();
  const current = data.current ?? {};
  const daily = data.daily ?? {};

  const finite = (v: unknown, fallback: number) => (Number.isFinite(Number(v)) && v !== null ? Number(v) : fallback);
  const code = finite(current.weather_code, 0);
  const temp = finite(current.temperature_2m, 15);
  const precip = finite(current.precipitation, 0);
  const rain = finite(current.rain, 0);
  const showers = finite(current.showers, 0);
  const isDay = Boolean(current.is_day === 1);

  const isRaining = isRainingFromWeather(code, precip, rain, showers);
  // Unix timestamps are time-zone proof (correct even if the phone is set to another zone).
  const sunrise = toIsoTime(daily.sunrise?.[0]);
  const sunset = toIsoTime(daily.sunset?.[0]);

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
