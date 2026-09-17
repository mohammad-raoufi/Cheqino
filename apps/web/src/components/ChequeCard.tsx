import { useEffect, useRef, useState } from 'react'
import { computeStatus, formatAmount, formatShamsi, STATUS_ICONS, STATUS_LABELS } from '@cheqino/shared'
import type { Cheque } from '@cheqino/shared'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  return (
    <div className={`cheque-card status-${status}`}>
      <div className="cheque-card-top">
        <div className="cheque-card-main">
          <div className="cheque-card-amount">{formatAmount(cheque.amount)} ریال</div>
          <div className="cheque-card-party">{cheque.partyName}</div>
        </div>
        <span className={`status-badge status-${status}`}>
          <span aria-hidden="true">{STATUS_ICONS[status]}</span>
          {STATUS_LABELS[status]}
        </span>
      </div>

      <div className="cheque-card-subline">
        <span>📅 {formatShamsi(cheque.dueDate, true)}</span>
        {cheque.bankName && <span>🏦 {cheque.bankName}</span>}
        <span className="direction-tag">
          {cheque.direction === 'payable' ? 'پرداختی' : 'دریافتی'}
        </span>
      </div>

      {(cheque.chequeNumber || cheque.description) && (
        <details className="cheque-card-more">
          <summary>جزئیات بیشتر</summary>
          <dl className="cheque-card-details">
            {cheque.chequeNumber && (
              <div>
                <dt>شماره چک</dt>
                <dd className="ltr-num">{cheque.chequeNumber}</dd>
              </div>
            )}
            {cheque.description && (
              <div className="full-width">
                <dt>توضیحات</dt>
                <dd>{cheque.description}</dd>
              </div>
            )}
          </dl>
        </details>
      )}

      <div className="cheque-card-footer">
        {!isResolved ? (
          <button type="button" className="cheque-card-primary" onClick={() => onMarkCleared(cheque.id)}>
            وصول شد
          </button>
        ) : (
          <span />
        )}

        <div className="cheque-card-menu" ref={menuRef}>
          <button
            type="button"
            className="more-btn"
            aria-label="گزینه‌های بیشتر"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
          >
            ⋯
          </button>
          {menuOpen && (
            <div className="action-menu" role="menu">
              {!isResolved && (
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    onMarkBounced(cheque.id)
                    setMenuOpen(false)
                  }}
                >
                  برگشت خورد
                </button>
              )}
              <button
                type="button"
                role="menuitem"
                className="danger"
                onClick={() => {
                  setMenuOpen(false)
                  setConfirmingDelete(true)
                }}
              >
                حذف چک
              </button>
            </div>
          )}
        </div>
      </div>

      {confirmingDelete && (
        <div className="confirm-overlay" onClick={() => setConfirmingDelete(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>حذف این چک؟</h3>
            <p>
              چک {formatAmount(cheque.amount)} ریالی {cheque.partyName} حذف می‌شود. این عملیات
              قابل بازگشت نیست.
            </p>
            <div className="confirm-actions">
              <button type="button" onClick={() => setConfirmingDelete(false)}>
                انصراف
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => {
                  setConfirmingDelete(false)
                  onDelete(cheque.id)
                }}
              >
                حذف چک
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
