// public/sw.js — place this in your frontend /public folder

self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  
  const options = {
    body: data.body || 'You have a new notification from FocusFlow',
    icon: '/icon.png',
    badge: '/icon.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/dashboard'
    }
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || '⚡ FocusFlow',
      options
    )
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data.url || '/dashboard')
  );
});