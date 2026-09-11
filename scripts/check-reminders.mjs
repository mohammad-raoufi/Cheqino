import { initializeApp } from 'firebase-admin/app'
import { cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getMessaging } from 'firebase-admin/messaging'

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT
if (!serviceAccountJson) {
  throw new Error('FIREBASE_SERVICE_ACCOUNT environment variable is not set')
}

initializeApp({
  credential: cert(JSON.parse(serviceAccountJson)),
})

const db = getFirestore()
const messaging = getMessaging()

function todayIso() {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

function daysBetweenIso(fromIso, toIso) {
  const from = new Date(fromIso)
  const to = new Date(toIso)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
      msPerDay,
  )
}

const DIRECTION_LABEL = {
  payable: 'پرداختی',
  receivable: 'دریافتی',
}

async function main() {
  const today = todayIso()
  const chequesSnap = await db.collection('cheques').where('manualStatus', '==', null).get()

  for (const chequeDoc of chequesSnap.docs) {
    const cheque = chequeDoc.data()
    const reminderDaysBefore = cheque.reminderDaysBefore ?? []
    const notifiedOffsets = cheque.notifiedOffsets ?? []
    const ownerId = cheque.ownerId
    if (!ownerId) continue

    const daysLeft = daysBetweenIso(today, cheque.dueDate)
    if (!reminderDaysBefore.includes(daysLeft) || notifiedOffsets.includes(daysLeft)) {
      continue
    }

    const tokensSnap = await db.collection('deviceTokens').where('ownerId', '==', ownerId).get()
    const tokens = tokensSnap.docs.map((d) => d.id)
    if (tokens.length === 0) continue

    const directionLabel = DIRECTION_LABEL[cheque.direction] ?? cheque.direction
    const body =
      daysLeft <= 0
        ? `چک ${directionLabel} ${cheque.partyName} امروز سررسید شده است.`
        : `چک ${directionLabel} ${cheque.partyName} تا ${daysLeft} روز دیگر سررسید می‌شود.`

    const response = await messaging.sendEachForMulticast({
      tokens,
      notification: {
        title: 'یادآوری چک',
        body,
      },
      data: { chequeId: chequeDoc.id },
    })
    console.log(
      `cheque ${chequeDoc.id}: sent ${response.successCount}/${tokens.length} notifications`,
    )

    await chequeDoc.ref.update({
      notifiedOffsets: [...notifiedOffsets, daysLeft],
    })
  }
}

await main()
