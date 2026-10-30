import confetti from 'canvas-confetti';

/** Android haptics (silently ignored where unsupported, e.g. iOS / desktop). */
export function vibrate(pattern: number | number[]): void {
  try {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) navigator.vibrate(pattern);
  } catch {
    /* no-op */
  }
}

const CONFETTI_COLORS = ['#f08a3c', '#ffd27a', '#ef5f8f', '#7cc6ef', '#8fd19e', '#fff1dc'];

/** Celebratory burst when Oli becomes "thriving". */
export function celebrate(): void {
  const base = { colors: CONFETTI_COLORS, disableForReducedMotion: true, zIndex: 60 } as const;
  void confetti({ ...base, particleCount: 70, spread: 75, startVelocity: 38, origin: { x: 0.5, y: 0.62 } });
  window.setTimeout(() => {
    void confetti({ ...base, particleCount: 35, angle: 60, spread: 55, origin: { x: 0, y: 0.7 } });
    void confetti({ ...base, particleCount: 35, angle: 120, spread: 55, origin: { x: 1, y: 0.7 } });
  }, 180);
}

/** "18:45" today, "Yesterday 18:45", or "29 Oct 18:45". */
export function formatActivityTime(iso: string, now: number = Date.now()): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit', hour12: false });
  const today = new Date(now);
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  if (d.getTime() >= startOfToday) return time;
  if (d.getTime() >= startOfToday - 86_400_000) return `Yesterday ${time}`;
  return `${d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' })} ${time}`;
}

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.max(1, Math.round(hours * 60))} min`;
  if (hours < 10) return `${Math.round(hours * 2) / 2} h`;
  return `${Math.round(hours)} h`;
}
