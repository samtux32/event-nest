// Service Worker for Web Push Notifications

self.addEventListener('push', (event) => {
  if (!event.data) return

  try {
    const data = event.data.json()
    const options = {
      body: data.body || '',
      icon: '/logo.png',
      badge: '/logo.png',
      data: { url: data.url || '/' },
      vibrate: [200, 100, 200],
    }

    event.waitUntil(
      self.registration.showNotification(data.title || 'Event Nest', options)
    )
  } catch {
    // Ignore malformed push data
  }
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()

  const url = event.notification.data?.url || '/'

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Focus an existing window if one is open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url)
          return client.focus()
        }
      }
      // Otherwise open a new window
      return clients.openWindow(url)
    })
  )
})
