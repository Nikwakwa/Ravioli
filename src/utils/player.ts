/** Player identity, persisted per device. */

export const PLAYER_PRESETS = ['Nico', 'Athina'] as const;

const PLAYER_KEY = 'ravioli:player';
const DEVICE_KEY = 'ravioli:device-id';

export function loadPlayer(): string | null {
  try {
    const p = window.localStorage.getItem(PLAYER_KEY)?.trim();
    if (!p) return null;
    // Migrate previous default labels if already stored on device
    if (p.toLowerCase() === 'me') return 'Nico';
    if (p.toLowerCase() === 'her') return 'Athina';
    return p.slice(0, 24);
  } catch {
    return null;
  }
}

export function savePlayer(name: string): void {
  try {
    window.localStorage.setItem(PLAYER_KEY, name.slice(0, 24));
  } catch {
    /* no-op */
  }
}

/**
 * Random id per tab/device (sessionStorage) so two tabs on the same computer
 * behave like two different phones when testing co-op in local mode.
 */
export const DEVICE_ID: string = (() => {
  const make = () =>
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now().toString(36)}${Math.random().toString(36).slice(2)}`;
  try {
    const existing = window.sessionStorage.getItem(DEVICE_KEY);
    if (existing) return existing;
    const id = make();
    window.sessionStorage.setItem(DEVICE_KEY, id);
    return id;
  } catch {
    return make();
  }
})();

export function playerColor(name: string): { bg: string; fg: string } {
  const key = name.trim().toLowerCase();
  if (key === 'athina' || key === 'her') return { bg: '#fde0ea', fg: '#c2416c' };
  if (key === 'nico' || key === 'me') return { bg: '#d9eefc', fg: '#2c7bb6' };
  // Stable pastel for custom names.
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) % 360;
  return { bg: `hsl(${h} 80% 90%)`, fg: `hsl(${h} 55% 38%)` };
}
