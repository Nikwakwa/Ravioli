// Web Push event handlers imported by the Workbox service worker.
// Runs in the background even when the Ravioli app is closed.

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload = {
    title: '🐱 Oli needs you!',
    body: 'Open Ravioli to check on Oli.',
    tag: 'oli-alert',
    icon: './pwa-192x192.png',
    badge: './badge-96x96.png',
    url: './',
  };

  try {
    const data = event.data.json();
    if (data && typeof data === 'object') {
      payload = {
        ...payload,
        ...(typeof data.title === 'string' ? { title: data.title } : {}),
        ...(typeof data.body === 'string' ? { body: data.body } : {}),
        ...(typeof data.tag === 'string' ? { tag: data.tag } : {}),
        ...(typeof data.icon === 'string' ? { icon: data.icon } : {}),
        ...(typeof data.badge === 'string' ? { badge: data.badge } : {}),
        ...(typeof data.url === 'string' ? { url: data.url } : {}),
      };
    }
  } catch {
    const text = event.data.text();
    if (text) payload.body = text;
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
  const targetUrl = new URL(event.notification.data?.url || './', self.registration.scope).href;

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
