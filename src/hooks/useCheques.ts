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
    await setDoc(doc(firestore, 'cheques', cheque.id), {
      ...cheque,
      ownerId: getClientId(),
    })
  } catch {
    // best-effort mirror; local IndexedDB stays the source of truth for the UI
  }
}

async function removeChequeFromFirestore(id: string): Promise<void> {
  try {
    await deleteDoc(doc(firestore, 'cheques', id))
  } catch {
    // best-effort mirror
  }
}

export function useCheques() {
  const [cheques, setCheques] = useState<Cheque[]>([])
  const [loading, setLoading] = useState(true)

  const reload = useCallback(async () => {
    const all = await getAllCheques()
    setCheques(all)
  }, [])

  useEffect(() => {
    reload().finally(() => setLoading(false))
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
      await mirrorChequeToFirestore(cheque)
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
      await mirrorChequeToFirestore(updated)
      await reload()
    },
    [cheques, reload],
  )

  const removeCheque = useCallback(
    async (id: string) => {
      await deleteCheque(id)
      await removeChequeFromFirestore(id)
      await reload()
    },
    [reload],
  )

  return { cheques, loading, addCheque, updateCheque, removeCheque, reload }
}
