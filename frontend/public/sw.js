const CACHE_NAME = 'pozospharma-v1';
const DRUG_CACHE = 'pozospharma-drugs-v1';
const STATIC_ASSETS = ['/', '/index.html'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME && k !== DRUG_CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// ── Push Notifications ──────────────────────────────────
self.addEventListener('push', (event) => {
  let data = { title: 'PozosPharma', body: 'You have a new notification' };

  if (event.data) {
    try {
      data = event.data.json();
    } catch {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body || data.message,
    icon: '/logo.svg',
    badge: '/logo.svg',
    vibrate: [100, 50, 100],
    tag: data.type || 'general',
    data: { url: data.url || '/' },
    actions: [
      { action: 'open', title: 'Open' },
      { action: 'dismiss', title: 'Dismiss' },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'dismiss') return;

  const url = event.notification.data?.url || '/';
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus existing tab if found
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // Otherwise open new window
      return clients.openWindow(url);
    })
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Drug API - network first, cache fallback
  if (url.pathname.startsWith('/api/drugs/')) {
    event.respondWith(
      fetch(event.request).then((res) => {
        const clone = res.clone();
        caches.open(DRUG_CACHE).then((cache) => cache.put(event.request, clone));
        return res;
      }).catch(() => caches.match(event.request))
    );
    return;
  }

  // Static assets - cache first
  if (event.request.destination === 'style' || event.request.destination === 'script' || event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then((cached) => cached || fetch(event.request).then((res) => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return res;
      }))
    );
    return;
  }

  // HTML - network first
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
