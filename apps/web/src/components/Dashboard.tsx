import { useMemo } from 'react'
import { computeStatus, formatAmount } from '@cheqino/shared'
import type { Cheque } from '@cheqino/shared'

interface DashboardProps {
  cheques: Cheque[]
}

export function Dashboard({ cheques }: DashboardProps) {
  const upcomingTotal = useMemo(() => {
    let total = 0
    for (const cheque of cheques) {
      const status = computeStatus(cheque)
      if (status === 'cleared' || status === 'bounced') continue
      total += cheque.amount
    }
    return total
  }, [cheques])

  return (
    <div className="dashboard-card">
      <div>
        <span className="dashboard-label">مجموع چک‌های آینده</span>
        <span className="dashboard-value">{formatAmount(upcomingTotal)} ریال</span>
      </div>
    </div>
  )
}
