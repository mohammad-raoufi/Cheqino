import { type DBSchema, openDB } from 'idb'
import type { Cheque } from '../types'

interface ChequeDB extends DBSchema {
  cheques: {
    key: string
    value: Cheque
    indexes: { 'by-dueDate': string }
  }
}

const DB_NAME = 'cheque-reminder'
const DB_VERSION = 1

const dbPromise = openDB<ChequeDB>(DB_NAME, DB_VERSION, {
  upgrade(db) {
    const store = db.createObjectStore('cheques', { keyPath: 'id' })
    store.createIndex('by-dueDate', 'dueDate')
  },
})

export async function getAllCheques(): Promise<Cheque[]> {
  const db = await dbPromise
  return db.getAllFromIndex('cheques', 'by-dueDate')
}

export async function getCheque(id: string): Promise<Cheque | undefined> {
  const db = await dbPromise
  return db.get('cheques', id)
}

export async function putCheque(cheque: Cheque): Promise<void> {
  const db = await dbPromise
  await db.put('cheques', cheque)
}

export async function deleteCheque(id: string): Promise<void> {
  const db = await dbPromise
  await db.delete('cheques', id)
}
