import { doc, setDoc } from 'firebase/firestore'
import { getToken } from 'firebase/messaging'
import { getClientId } from './clientId'
import { firestore, getFirebaseMessaging, VAPID_KEY } from './firebase'

export type NotificationSetupResult =
  | { status: 'unsupported' }
  | { status: 'denied' }
  | { status: 'granted'; token: string }

export async function enableNotifications(): Promise<NotificationSetupResult> {
  const messaging = await getFirebaseMessaging()
  if (!messaging || !('Notification' in window)) {
    return { status: 'unsupported' }
  }

  const permission = await Notification.requestPermission()
  if (permission !== 'granted') {
    return { status: 'denied' }
  }

  const registration = await navigator.serviceWorker.register(
    '/firebase-messaging-sw.js',
    { scope: '/firebase-cloud-messaging-push-scope' },
  )

  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  })

  const clientId = getClientId()
  await setDoc(doc(firestore, 'deviceTokens', token), {
    token,
    ownerId: clientId,
    createdAt: new Date().toISOString(),
  })

  return { status: 'granted', token }
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}
