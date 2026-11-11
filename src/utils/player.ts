/** Player identity & device storage management. */

export const DEFAULT_PLAYER_NAME = 'You';

const PLAYER_KEY = 'ravioli:player';
const DEVICE_KEY = 'ravioli:device-id';
const ONBOARDING_KEY = 'ravioli:v1:onboarding_completed';

export function sanitizePlayerName(raw: string): string {
  return raw
    .replace(/<[^>]*>/g, '')
    .replace(/[\u0000-\u001F\u007F<>`"']/g, '')
    .trim()
    .slice(0, 24);
}

export function loadPlayer(): string {
  try {
    if (typeof localStorage === 'undefined') return DEFAULT_PLAYER_NAME;
    const p = sanitizePlayerName(localStorage.getItem(PLAYER_KEY) ?? '');
    return p || DEFAULT_PLAYER_NAME;
  } catch {
    return DEFAULT_PLAYER_NAME;
  }
}

export function savePlayer(name: string): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const clean = sanitizePlayerName(name);
    localStorage.setItem(PLAYER_KEY, clean || DEFAULT_PLAYER_NAME);
  } catch {
    /* no-op */
  }
}

export function hasSeenOnboarding(): boolean {
  try {
    if (typeof localStorage === 'undefined') return false;
    return Boolean(localStorage.getItem(ONBOARDING_KEY));
  } catch {
    return false;
  }
}

export function markOnboardingSeen(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(ONBOARDING_KEY, '1');
  } catch {
    /* no-op */
  }
}

/** Clears all Ravioli data from localStorage so testers can start fresh. */
export function resetAllGameData(): void {
  try {
    if (typeof localStorage === 'undefined') return;
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('ravioli:')) {
        keysToRemove.push(k);
      }
    }
    for (const k of keysToRemove) {
      localStorage.removeItem(k);
    }
  } catch {
    /* no-op */
  }
}

/**
 * Random id per tab/device (sessionStorage) so two tabs on the same computer
 * behave like two different devices.
 */
export const DEVICE_ID: string = (() => {
  const make = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  try {
    if (typeof sessionStorage === 'undefined') return 'local-device';
    const existing = sessionStorage.getItem(DEVICE_KEY);
    if (existing) return existing;
    const id = make();
    sessionStorage.setItem(DEVICE_KEY, id);
    return id;
  } catch {
    return make();
  }
})();

export function playerColor(name: string): { bg: string; fg: string } {
  const key = name.trim().toLowerCase();
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return { bg: `hsl(${h} 80% 90%)`, fg: `hsl(${h} 55% 38%)` };
}
