/**
 * Real-Time Atmosphere & Cozy Weather for Oli's Living Room and Balcony.
 */

export type AtmosphereMode = 'auto' | 'day' | 'sunset' | 'night';
export type TimeOfDay = 'day' | 'sunset' | 'night';

export interface AtmospherePrefs {
  mode: AtmosphereMode;
  rain: boolean;
}

const LS_ATMOSPHERE_MODE = 'ravioli:v1:atmosphere_mode';
const LS_ATMOSPHERE_RAIN = 'ravioli:v1:atmosphere_rain';

export const DEFAULT_ATMOSPHERE_PREFS: AtmospherePrefs = {
  mode: 'auto',
  rain: false,
};

export function loadAtmospherePrefs(): AtmospherePrefs {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return DEFAULT_ATMOSPHERE_PREFS;
    }
    const rawMode = window.localStorage.getItem(LS_ATMOSPHERE_MODE);
    const rawRain = window.localStorage.getItem(LS_ATMOSPHERE_RAIN);

    const mode: AtmosphereMode =
      rawMode === 'day' || rawMode === 'sunset' || rawMode === 'night' || rawMode === 'auto'
        ? rawMode
        : 'auto';

    const rain = rawRain === 'true';

    return { mode, rain };
  } catch {
    return DEFAULT_ATMOSPHERE_PREFS;
  }
}

export function saveAtmospherePrefs(prefs: AtmospherePrefs): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    window.localStorage.setItem(LS_ATMOSPHERE_MODE, prefs.mode);
    window.localStorage.setItem(LS_ATMOSPHERE_RAIN, prefs.rain ? 'true' : 'false');
  } catch {
    /* no-op */
  }
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
      label: timeLabel,
      emoji: '🌧️',
      tagline: "Gentle raindrops sliding down the window pane for Oli's favorite Cat TV.",
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
