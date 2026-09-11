import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, isSupported } from 'firebase/messaging'

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

export const firebaseApp = initializeApp(firebaseConfig)
export const firestore = getFirestore(firebaseApp)

export async function getFirebaseMessaging() {
  if (!(await isSupported())) return null
  return getMessaging(firebaseApp)
}
