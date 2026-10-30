import { useCallback, useEffect, useState } from 'react';
import { APP_VERSION } from '../data/changelog';

const CHECK_INTERVAL_MS = 60_000;

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
      });
      if (!res.ok) return;
      const data = (await res.json()) as { version?: string };
      if (typeof data.version === 'string' && data.version.startsWith('v') && data.version !== APP_VERSION) {
        setAvailableVersion(data.version);
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
