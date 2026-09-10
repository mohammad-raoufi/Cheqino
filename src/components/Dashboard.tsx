import { useMemo } from 'react'
import type { Cheque } from '../types'
import { computeStatus } from '../lib/status'
import { formatAmount } from '../lib/shamsi'

interface DashboardProps {
  cheques: Cheque[]
}

export function Dashboard({ cheques }: DashboardProps) {
  const stats = useMemo(() => {
    let upcomingTotal = 0
    let dueSoonCount = 0
    let overdueCount = 0

    for (const cheque of cheques) {
      const status = computeStatus(cheque)
      if (status === 'cleared' || status === 'bounced') continue
      upcomingTotal += cheque.amount
      if (status === 'due_soon') dueSoonCount++
      if (status === 'due') overdueCount++
    }

    return { upcomingTotal, dueSoonCount, overdueCount }
  }, [cheques])

  return (
    <div className="dashboard">
      <div className="dashboard-card">
        <span className="dashboard-label">مجموع چک‌های آینده</span>
        <span className="dashboard-value">
          {formatAmount(stats.upcomingTotal)} ریال
        </span>
      </div>
      <div className="dashboard-card status-due_soon">
        <span className="dashboard-label">نزدیک سررسید</span>
        <span className="dashboard-value">{formatAmount(stats.dueSoonCount)}</span>
      </div>
      <div className="dashboard-card status-due">
        <span className="dashboard-label">عقب‌افتاده</span>
        <span className="dashboard-value">{formatAmount(stats.overdueCount)}</span>
      </div>
    </div>
  )
}
