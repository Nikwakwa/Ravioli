/**
 * An abort signal that fires after `ms`, so slow networks never leave a request hanging.
 * Falls back to a manual timer on browsers without `AbortSignal.timeout` (e.g. iOS 15).
 */
export function timeoutSignal(ms: number): AbortSignal | undefined {
  if (typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function') {
    return AbortSignal.timeout(ms);
  }
  if (typeof AbortController !== 'undefined') {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    return controller.signal;
  }
  return undefined;
}
