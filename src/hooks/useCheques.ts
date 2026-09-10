import { useCallback, useEffect, useState } from 'react'
import { deleteCheque, getAllCheques, putCheque } from '../lib/db'
import type { Cheque, ChequeInput } from '../types'

function createId(): string {
  return crypto.randomUUID()
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
      await reload()
    },
    [cheques, reload],
  )

  const removeCheque = useCallback(
    async (id: string) => {
      await deleteCheque(id)
      await reload()
    },
    [reload],
  )

  return { cheques, loading, addCheque, updateCheque, removeCheque, reload }
}
