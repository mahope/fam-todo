// Push notification service worker
// This file handles push notifications when the app is not in focus

self.addEventListener('push', function(event) {
  console.log('Push event received:', event);

  if (!event.data) {
    console.log('Push event has no data');
    return;
  }

  try {
    const data = event.data.json();
    console.log('Push data:', data);

    const options = {
      body: data.body,
      icon: data.icon || '/icon-192x192.png',
      badge: data.badge || '/badge-72x72.png',
      tag: data.tag || 'default',
      data: data.data || {},
      actions: data.actions || [],
      requireInteraction: data.requireInteraction || false,
      silent: data.silent || false,
      timestamp: Date.now(),
      vibrate: [200, 100, 200],
    };

    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  } catch (error) {
    console.error('Error processing push event:', error);
    
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('FamTodo', {
        body: 'Du har en ny notifikation',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        tag: 'fallback',
      })
    );
  }
});

self.addEventListener('notificationclick', function(event) {
  console.log('Notification click event:', event);

  event.notification.close();

  const action = event.action;
  const notificationData = event.notification.data || {};

  if (action) {
    console.log('Notification action clicked:', action);
    
    // Handle specific actions
    switch (action) {
      case 'view':
        event.waitUntil(
          handleViewAction(notificationData)
        );
        break;
      case 'accept':
        event.waitUntil(
          handleAcceptAction(notificationData)
        );
        break;
      case 'decline':
        event.waitUntil(
          handleDeclineAction(notificationData)
        );
        break;
      case 'snooze':
        event.waitUntil(
          handleSnoozeAction(notificationData)
        );
        break;
      case 'dismiss':
        // Just close, no action needed
        break;
      default:
        event.waitUntil(
          openApp(notificationData)
        );
    }
  } else {
    // Default click behavior - open the app
    event.waitUntil(
      openApp(notificationData)
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification closed:', event.notification.tag);
  
  // Track notification dismissal if needed
  const notificationData = event.notification.data || {};
  if (notificationData.trackDismissal) {
    // Could send analytics event here
  }
});

// Helper functions for notification actions
async function handleViewAction(data) {
  const url = getActionUrl(data, 'view');
  return openApp(data, url);
}

async function handleAcceptAction(data) {
  const url = getActionUrl(data, 'accept');
  return openApp(data, url);
}

async function handleDeclineAction(data) {
  const url = getActionUrl(data, 'decline');
  return openApp(data, url);
}

async function handleSnoozeAction(data) {
  // Could implement snooze logic here
  console.log('Snooze action - could reschedule notification');
}

function getActionUrl(data, action) {
  const baseUrl = self.location.origin;
  
  switch (data.type) {
    case 'task-assigned':
    case 'task-completed':
    case 'deadline-reminder':
      return `${baseUrl}/tasks/${data.taskId || ''}`;
    case 'list-shared':
      return `${baseUrl}/lists/${data.listId || ''}`;
    case 'family-invite':
      if (action === 'accept') {
        return `${baseUrl}/family/invites?action=accept&token=${data.inviteToken || ''}`;
      } else if (action === 'decline') {
        return `${baseUrl}/family/invites?action=decline&token=${data.inviteToken || ''}`;
      }
      return `${baseUrl}/family/invites`;
    case 'shopping-item-added':
      return `${baseUrl}/shopping`;
    case 'comment-added':
      return `${baseUrl}/tasks/${data.taskId || ''}#comments`;
    default:
      return baseUrl;
  }
}

async function openApp(data, url) {
  const targetUrl = url || self.location.origin;
  
  // Check if the app is already open
  const clients = await self.clients.matchAll({
    type: 'window',
    includeUncontrolled: true
  });

  // If a client is already open, focus it and navigate if needed
  for (const client of clients) {
    if (client.url.startsWith(self.location.origin)) {
      if (url && client.url !== targetUrl) {
        client.navigate(targetUrl);
      }
      return client.focus();
    }
  }

  // No client is open, open a new window
  return self.clients.openWindow(targetUrl);
}

// Background sync for offline notification handling
self.addEventListener('sync', function(event) {
  if (event.tag === 'notification-sync') {
    event.waitUntil(
      syncNotifications()
    );
  }
});

async function syncNotifications() {
  // Could implement background sync for notifications here
  console.log('Syncing notifications in background');
}