/*
* Venjs v3.4 Service Worker
* @author Myxo victor
* * IMPORTANT: This file must be placed in the ROOT directory of your website.
* It cannot be loaded from a CDN due to browser security restrictions.
*/

// Listen for the Push event from the server
self.addEventListener('push', function(event) {
    let data = { title: 'New Update', content: 'You have a new notification from Venjs.', url: '/' };

    try {
        if (event.data) {
            data = event.data.json();
        }
    } catch (e) {
        // Fallback for plain text data
        data.content = event.data.text();
    }

    const options = {
        body: data.content,
        icon: data.icon || '/images/myappIcon.png',
        badge: data.badge || '/images/badge.png',
        vibrate: [100, 50, 100],
        data: {
            url: data.url || '/'
        },
        actions: [
            { action: 'open', title: 'View Now' },
            { action: 'close', title: 'Dismiss' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(data.title || 'Notification', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
    const clickedNotification = event.notification;
    clickedNotification.close();

    if (event.action === 'close') return;

    // Check if the URL is provided and open it
    const urlToOpen = new URL(clickedNotification.data.url, self.location.origin).href;

    const promiseChain = clients.matchAll({
        type: 'window',
        includeUncontrolled: true
    }).then((windowClients) => {
        let matchingClient = null;

        for (let i = 0; i < windowClients.length; i++) {
            const windowClient = windowClients[i];
            if (windowClient.url === urlToOpen) {
                matchingClient = windowClient;
                break;
            }
        }

        if (matchingClient) {
            return matchingClient.focus();
        } else {
            return clients.openWindow(urlToOpen);
        }
    });

    event.waitUntil(promiseChain);
});

// Clean up old caches if necessary
self.addEventListener('activate', function(event) {
    event.waitUntil(clients.claim());
});
