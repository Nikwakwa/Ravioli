// Web Push event handlers imported by the Workbox service worker.
// Runs in the background even when the Ravioli app is closed.

function toSameOriginUrl(raw, fallback) {
  try {
    const resolved = new URL(typeof raw === 'string' && raw ? raw : fallback, self.registration.scope);
    if (resolved.origin === self.location.origin) {
      return resolved.href;
    }
  } catch {
    // fall through to safe fallback
  }
  return new URL(fallback, self.registration.scope).href;
}

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {
    title: '🐱 Oli needs you!',
    body: 'Open Ravioli to check on Oli.',
    tag: 'oli-alert',
    icon: toSameOriginUrl('./pwa-192x192.png', './pwa-192x192.png'),
    badge: toSameOriginUrl('./badge-96x96.png', './badge-96x96.png'),
    url: self.registration.scope,
  };

  try {
    const data = event.data.json();
    if (data && typeof data === 'object') {
      payload = {
        ...payload,
        ...(typeof data.title === 'string' ? { title: data.title.slice(0, 120) } : {}),
        ...(typeof data.body === 'string' ? { body: data.body.slice(0, 240) } : {}),
        ...(typeof data.tag === 'string' ? { tag: data.tag.slice(0, 64) } : {}),
        icon: toSameOriginUrl(data.icon, './pwa-192x192.png'),
        badge: toSameOriginUrl(data.badge, './badge-96x96.png'),
        url: toSameOriginUrl(data.url, './'),
      };
    }
  } catch {
    const text = event.data.text();
    if (text) payload.body = text.slice(0, 240);
  }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      tag: payload.tag,
      icon: payload.icon,
      badge: payload.badge,
      renotify: true,
      data: { url: payload.url },
    }),
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = toSameOriginUrl(event.notification.data?.url, './');

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.startsWith(self.registration.scope) && 'focus' in client) {
          return client.focus();
        }
      }
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
      return undefined;
    }),
  );
});
