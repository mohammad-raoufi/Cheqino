import { useCallback, useEffect, useState } from 'react'
import { deleteCheque, getAllCheques, putCheque } from '../lib/db'
import { getClientId, getFirestoreInstance } from '@cheqino/shared'
import type { Cheque, ChequeInput } from '@cheqino/shared'

function createId(): string {
  return crypto.randomUUID()
}

async function mirrorChequeToFirestore(cheque: Cheque): Promise<void> {
  // notifiedOffsets is server-owned (set by the reminder check job); never
  // overwrite it from the client mirror, or repeat reminders get re-sent.
  const { notifiedOffsets, ...rest } = cheque
  try {
    const { doc, setDoc } = await import('firebase/firestore')
    const firestore = await getFirestoreInstance()
    const ref = doc(firestore, 'cheques', cheque.id)
    const withoutNotifiedOffsets = { ...rest, ownerId: getClientId() }
    try {
      await setDoc(ref, withoutNotifiedOffsets, { merge: true })
    } catch {
      // The doc doesn't exist remotely yet, so the merge above produced a
      // document missing notifiedOffsets, which security rules reject.
      // Retry including it so the doc can actually be created.
      await setDoc(ref, { ...withoutNotifiedOffsets, notifiedOffsets }, { merge: true })
    }
  } catch (err) {
    // best-effort mirror; local IndexedDB stays the source of truth for the UI
    console.error('Failed to mirror cheque to Firestore', err)
  }
}

async function removeChequeFromFirestore(id: string): Promise<void> {
  try {
    const { deleteDoc, doc } = await import('firebase/firestore')
    const firestore = await getFirestoreInstance()
    await deleteDoc(doc(firestore, 'cheques', id))
  } catch (err) {
    // best-effort mirror
    console.error('Failed to remove cheque from Firestore', err)
  }
}

export function useCheques() {
  const [cheques, setCheques] = useState<Cheque[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const all = await getAllCheques()
    setCheques(all)
    return all
  }, [])

  useEffect(() => {
    reload()
      .then((all) => {
        void Promise.all(all.map((c) => mirrorChequeToFirestore(c)))
      })
      .finally(() => setLoading(false))
  }, [reload])

  const addCheque = useCallback(
    async (input: ChequeInput) => {
      const now = new Date().toISOString()
      const cheque: Cheque = {
        ...input,
        id: createId(),
        manualStatus: input.manualStatus ?? null,
        notifiedOffsets: [],
        createdAt: now,
        updatedAt: now,
      }
      await putCheque(cheque)
      void mirrorChequeToFirestore(cheque)
      await reload()
      return cheque
    },
    [reload],
  )

  const updateCheque = useCallback(
    async (id: string, patch: Partial<Cheque>) => {
      const existing = cheques.find((c) => c.id === id)
      if (!existing) return
      const updated: Cheque = {
        ...existing,
        ...patch,
        updatedAt: new Date().toISOString(),
      }
      await putCheque(updated)
      void mirrorChequeToFirestore(updated)
      await reload()
    },
    [cheques, reload],
  )

  const removeCheque = useCallback(
    async (id: string) => {
      await deleteCheque(id)
      void removeChequeFromFirestore(id)
      await reload()
    },
    [reload],
  )

  return { cheques, loading, addCheque, updateCheque, removeCheque, reload }
}
