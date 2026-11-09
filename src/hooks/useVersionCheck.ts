import { useCallback, useEffect, useState } from 'react';
import { APP_VERSION } from '../data/changelog';

const CHECK_INTERVAL_MS = 60_000;
export const VERSION_RE = /^v?(\d{1,3}\.\d{1,3}\.\d{1,3})$/;

export function normalizeVersion(v: string): string | null {
  const match = v.trim().match(VERSION_RE);
  return match ? `v${match[1]}` : null;
}

export function parseSemver(v: string): [number, number, number] | null {
  const match = v.trim().match(VERSION_RE);
  if (!match) return null;
  const parts = match[1].split('.').map((p) => parseInt(p, 10));
  return [parts[0], parts[1], parts[2]];
}

export function isNewerVersion(remote: string, current: string): boolean {
  const r = parseSemver(remote);
  const c = parseSemver(current);
  if (!r || !c) return false;
  if (r[0] !== c[0]) return r[0] > c[0];
  if (r[1] !== c[1]) return r[1] > c[1];
  return r[2] > c[2];
}

export function useVersionCheck() {
  const [availableVersion, setAvailableVersion] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);

  const checkNow = useCallback(async () => {
    try {
      // Ask the Service Worker (if any) to check for a new bundle in the background.
      if ('serviceWorker' in navigator) {
        const reg = await navigator.serviceWorker.getRegistration();
        void reg?.update();
      }

      const baseUrl = import.meta.env.BASE_URL || '/';
      const res = await fetch(`${baseUrl}version.json?t=${Date.now()}`, {
        cache: 'no-store',
        headers: { pragma: 'no-cache', 'cache-control': 'no-cache' },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) return;
      const data = (await res.json()) as { version?: unknown };
      if (typeof data.version === 'string') {
        const remote = normalizeVersion(data.version);
        const current = normalizeVersion(APP_VERSION);
        if (remote && current && isNewerVersion(remote, current)) {
          setAvailableVersion(remote);
        } else {
          setAvailableVersion(null);
        }
      }
    } catch {
      /* offline or dev server restarting — ignore */
    }
  }, []);

  useEffect(() => {
    void checkNow();
    const id = window.setInterval(() => void checkNow(), CHECK_INTERVAL_MS);
    const onVisible = () => {
      if (document.visibilityState === 'visible') void checkNow();
    };
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onVisible);
    return () => {
      window.clearInterval(id);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onVisible);
    };
  }, [checkNow]);

  const applyUpdate = useCallback(async () => {
    setReloading(true);
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map((k) => caches.delete(k)));
      }
    } catch {
      /* ignore */
    }
    const url = new URL(window.location.href);
    url.searchParams.set('v', availableVersion ?? Date.now().toString());
    window.location.replace(url.toString());
  }, [availableVersion]);

  return { availableVersion, reloading, applyUpdate };
}
