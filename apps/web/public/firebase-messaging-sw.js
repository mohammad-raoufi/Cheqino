/* eslint-disable no-undef */
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: 'AIzaSyDRDebYaC3YtBRn0D2GjtMf6N-YhuDPafw',
  authDomain: 'cheqino.firebaseapp.com',
  projectId: 'cheqino',
  storageBucket: 'cheqino.firebasestorage.app',
  messagingSenderId: '686783332216',
  appId: '1:686783332216:web:78d555950fa1741048928d',
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title ?? 'چکینو'
  const options = {
    body: payload.notification?.body ?? '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    data: payload.data ?? {},
  }
  self.registration.showNotification(title, options)
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(self.clients.openWindow('/'))
})
