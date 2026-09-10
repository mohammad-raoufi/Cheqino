export type ChequeDirection = 'payable' | 'receivable'

export type ChequeStatus =
  | 'pending'
  | 'due_soon'
  | 'due'
  | 'cleared'
  | 'bounced'

export interface Cheque {
  id: string
  direction: ChequeDirection
  amount: number
  dueDate: string // ISO date (YYYY-MM-DD), Gregorian
  partyName: string
  bankName: string
  chequeNumber: string
  description: string
  manualStatus: 'cleared' | 'bounced' | null
  reminderDaysBefore: number[]
  notifiedOffsets: number[]
  createdAt: string
  updatedAt: string
}

export type ChequeInput = Omit<
  Cheque,
  'id' | 'createdAt' | 'updatedAt' | 'manualStatus' | 'notifiedOffsets'
> & {
  manualStatus?: 'cleared' | 'bounced' | null
}
