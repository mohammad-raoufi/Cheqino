import { deleteDoc, doc, setDoc } from 'firebase/firestore'
import { useCallback, useEffect, useState } from 'react'
import { getClientId } from '../lib/clientId'
import { deleteCheque, getAllCheques, putCheque } from '../lib/db'
import { firestore } from '../lib/firebase'
import type { Cheque, ChequeInput } from '../types'

function createId(): string {
  return crypto.randomUUID()
}

async function mirrorChequeToFirestore(cheque: Cheque): Promise<void> {
  try {
    // notifiedOffsets is server-owned (set by the reminder check job); never
    // overwrite it from the client mirror, or repeat reminders get re-sent.
    const { notifiedOffsets: _notifiedOffsets, ...rest } = cheque
    await setDoc(
      doc(firestore, 'cheques', cheque.id),
      {
        ...rest,
        ownerId: getClientId(),
      },
      { merge: true },
    )
  } catch (err) {
    // best-effort mirror; local IndexedDB stays the source of truth for the UI
    console.error('Failed to mirror cheque to Firestore', err)
  }
}

async function removeChequeFromFirestore(id: string): Promise<void> {
  try {
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
