import { Capacitor } from '@capacitor/core'
import { PushNotifications } from '@capacitor/push-notifications'
import { getClientId } from './clientId'
import { getFirebaseMessaging, getFirestoreInstance, VAPID_KEY } from './firebase'

export type NotificationSetupResult =
  | { status: 'unsupported' }
  | { status: 'denied' }
  | { status: 'granted'; token: string }

async function saveDeviceToken(token: string) {
  const { doc, setDoc } = await import('firebase/firestore')
  const firestore = await getFirestoreInstance()
  const clientId = getClientId()
  await setDoc(doc(firestore, 'deviceTokens', token), {
    token,
    ownerId: clientId,
    createdAt: new Date().toISOString(),
  })
}

async function enableNativeNotifications(): Promise<NotificationSetupResult> {
  const permissionStatus = await PushNotifications.requestPermissions()
  if (permissionStatus.receive !== 'granted') {
    return { status: 'denied' }
  }

  return new Promise((resolve, reject) => {
    PushNotifications.addListener('registration', (token) => {
      saveDeviceToken(token.value).then(
        () => resolve({ status: 'granted', token: token.value }),
        reject,
      )
    })
    PushNotifications.addListener('registrationError', (error) => {
      reject(new Error(error.error))
    })
    PushNotifications.register()
  })
}

async function enableWebNotifications(): Promise<NotificationSetupResult> {
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

  const { getToken } = await import('firebase/messaging')
  const token = await getToken(messaging, {
    vapidKey: VAPID_KEY,
    serviceWorkerRegistration: registration,
  })

  await saveDeviceToken(token)

  return { status: 'granted', token }
}

export async function enableNotifications(): Promise<NotificationSetupResult> {
  return Capacitor.isNativePlatform() ? enableNativeNotifications() : enableWebNotifications()
}

export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (Capacitor.isNativePlatform()) return 'default'
  if (!('Notification' in window)) return 'unsupported'
  return Notification.permission
}
