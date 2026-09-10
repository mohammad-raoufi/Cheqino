import type { Cheque } from '../types'
import { formatAmount, formatShamsi } from '../lib/shamsi'
import { computeStatus, STATUS_LABELS } from '../lib/status'

interface ChequeCardProps {
  cheque: Cheque
  onMarkCleared: (id: string) => void
  onMarkBounced: (id: string) => void
  onDelete: (id: string) => void
}

export function ChequeCard({
  cheque,
  onMarkCleared,
  onMarkBounced,
  onDelete,
}: ChequeCardProps) {
  const status = computeStatus(cheque)
  const isResolved = status === 'cleared' || status === 'bounced'

  return (
    <div className={`cheque-card status-${status}`}>
      <div className="cheque-card-header">
        <span className={`status-badge status-${status}`}>
          {STATUS_LABELS[status]}
        </span>
        <span className="direction-badge">
          {cheque.direction === 'payable' ? 'پرداختی' : 'دریافتی'}
        </span>
      </div>

      <div className="cheque-card-amount">{formatAmount(cheque.amount)} ریال</div>

      <dl className="cheque-card-details">
        <div>
          <dt>سررسید</dt>
          <dd>{formatShamsi(cheque.dueDate, true)}</dd>
        </div>
        <div>
          <dt>{cheque.direction === 'payable' ? 'دریافت‌کننده' : 'صادرکننده'}</dt>
          <dd>{cheque.partyName}</dd>
        </div>
        {cheque.bankName && (
          <div>
            <dt>بانک</dt>
            <dd>{cheque.bankName}</dd>
          </div>
        )}
        {cheque.chequeNumber && (
          <div>
            <dt>شماره چک</dt>
            <dd>{cheque.chequeNumber}</dd>
          </div>
        )}
        {cheque.description && (
          <div className="full-width">
            <dt>توضیحات</dt>
            <dd>{cheque.description}</dd>
          </div>
        )}
      </dl>

      {!isResolved && (
        <div className="cheque-card-actions">
          <button type="button" onClick={() => onMarkCleared(cheque.id)}>
            وصول شد
          </button>
          <button type="button" onClick={() => onMarkBounced(cheque.id)}>
            برگشت خورد
          </button>
          <button type="button" className="danger" onClick={() => onDelete(cheque.id)}>
            حذف
          </button>
        </div>
      )}
      {isResolved && (
        <div className="cheque-card-actions">
          <button type="button" className="danger" onClick={() => onDelete(cheque.id)}>
            حذف
          </button>
        </div>
      )}
    </div>
  )
}
