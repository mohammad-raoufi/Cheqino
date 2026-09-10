import type { Cheque, ChequeStatus } from '../types'
import { daysBetweenIso, todayIso } from './shamsi'

const DUE_SOON_THRESHOLD_DAYS = 3

export function computeStatus(cheque: Cheque, today = todayIso()): ChequeStatus {
  if (cheque.manualStatus === 'cleared') return 'cleared'
  if (cheque.manualStatus === 'bounced') return 'bounced'

  const daysLeft = daysBetweenIso(today, cheque.dueDate)
  if (daysLeft < 0) return 'due'
  if (daysLeft <= DUE_SOON_THRESHOLD_DAYS) return 'due_soon'
  return 'pending'
}

export const STATUS_LABELS: Record<ChequeStatus, string> = {
  pending: 'در انتظار',
  due_soon: 'نزدیک سررسید',
  due: 'سررسید شده',
  cleared: 'وصول شده',
  bounced: 'برگشتی',
}

export const STATUS_COLORS: Record<ChequeStatus, string> = {
  pending: 'var(--status-pending)',
  due_soon: 'var(--status-due-soon)',
  due: 'var(--status-due)',
  cleared: 'var(--status-cleared)',
  bounced: 'var(--status-bounced)',
}
