// Polymath Service Worker — Web Push Notifications
self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()))

self.addEventListener('push', e => {
  const data = e.data?.json() ?? {}
  const title = data.title ?? 'Polymath'
  const options = {
    body: data.body ?? "You have a new match!",
    icon: '/icon-192.png',
    badge: '/icon-96.png',
    data: { url: data.url ?? '/' },
    vibrate: [100, 50, 100],
    actions: [{ action: 'open', title: 'View' }],
  }
  e.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', e => {
  e.notification.close()
  const url = e.notification.data?.url ?? '/'
  e.waitUntil(
    self.clients.matchAll({ type: 'window' }).then(clients => {
      const existing = clients.find(c => c.url.includes(self.location.origin))
      if (existing) { existing.focus(); existing.navigate(url) }
      else self.clients.openWindow(url)
    })
  )
})
