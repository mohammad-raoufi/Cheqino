import { initializeApp } from 'firebase/app'
import type { Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyDRDebYaC3YtBRn0D2GjtMf6N-YhuDPafw',
  authDomain: 'cheqino.firebaseapp.com',
  projectId: 'cheqino',
  storageBucket: 'cheqino.firebasestorage.app',
  messagingSenderId: '686783332216',
  appId: '1:686783332216:web:78d555950fa1741048928d',
}

export const VAPID_KEY =
  'BPy_03i_uLju9PvixdyyXt3prNDjj3WYXpPJcdFW5KGzr4xzxv2TjY9jrDz0SuUSl3QkMyfDEQgZlPXhZyQDWLk'

// Google's Firestore endpoints are blocked for some Iranian IPs, so browser
// traffic is routed through a Cloudflare Worker that reverse-proxies
// firestore.googleapis.com (see cf-firestore-proxy/).
const FIRESTORE_PROXY_HOST = 'cheqino-firestore-proxy.cheqino.workers.dev'

export const firebaseApp = initializeApp(firebaseConfig)

// firebase/firestore and firebase/messaging are dynamically imported: they're
// only needed for background mirroring and on-demand notification setup, not
// for first paint, so keeping them out of the eager bundle shrinks it a lot.
let firestorePromise: Promise<Firestore> | null = null

export function getFirestoreInstance(): Promise<Firestore> {
  if (!firestorePromise) {
    firestorePromise = import('firebase/firestore').then(({ initializeFirestore }) =>
      initializeFirestore(firebaseApp, {
        host: FIRESTORE_PROXY_HOST,
        ssl: true,
        experimentalForceLongPolling: true,
      }),
    )
  }
  return firestorePromise
}

export async function getFirebaseMessaging() {
  const { getMessaging, isSupported } = await import('firebase/messaging')
  if (!(await isSupported())) return null
  return getMessaging(firebaseApp)
}
