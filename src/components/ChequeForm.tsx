import { useState } from 'react'
import type { ChequeDirection, ChequeInput } from '../types'
import { IRANIAN_BANKS } from '../lib/banks'
import { todayIso } from '../lib/shamsi'
import { ShamsiDatePicker } from './ShamsiDatePicker'

interface ChequeFormProps {
  onSubmit: (input: ChequeInput) => Promise<void>
  onCancel: () => void
}

const DEFAULT_REMINDERS = [7, 3, 1]

export function ChequeForm({ onSubmit, onCancel }: ChequeFormProps) {
  const [direction, setDirection] = useState<ChequeDirection>('payable')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState(todayIso())
  const [partyName, setPartyName] = useState('')
  const [bankName, setBankName] = useState('')
  const [chequeNumber, setChequeNumber] = useState('')
  const [description, setDescription] = useState('')
  const [reminderDaysText, setReminderDaysText] = useState(
    DEFAULT_REMINDERS.join('، '),
  )
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  function parseReminders(text: string): number[] {
    return text
      .split(/[،,]/)
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n) && n >= 0)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    const numericAmount = Number(amount)
    if (!numericAmount || numericAmount <= 0) {
      setError('مبلغ را به‌درستی وارد کنید.')
      return
    }
    if (!partyName.trim()) {
      setError(
        direction === 'payable'
          ? 'نام دریافت‌کننده را وارد کنید.'
          : 'نام صادرکننده را وارد کنید.',
      )
      return
    }

    setSubmitting(true)
    try {
      await onSubmit({
        direction,
        amount: numericAmount,
        dueDate,
        partyName: partyName.trim(),
        bankName: bankName.trim(),
        chequeNumber: chequeNumber.trim(),
        description: description.trim(),
        reminderDaysBefore: parseReminders(reminderDaysText),
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="cheque-form" onSubmit={handleSubmit}>
      <div className="field-group direction-toggle">
        <button
          type="button"
          className={
            direction === 'payable' ? 'direction-payable active' : 'direction-payable'
          }
          onClick={() => setDirection('payable')}
        >
          پرداختی
        </button>
        <button
          type="button"
          className={
            direction === 'receivable'
              ? 'direction-receivable active'
              : 'direction-receivable'
          }
          onClick={() => setDirection('receivable')}
        >
          دریافتی
        </button>
      </div>

      <label className="field">
        <span>مبلغ (ریال)</span>
        <input
          className="numeric-field"
          type="text"
          inputMode="numeric"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^0-9]/g, ''))}
          placeholder="۰"
          required
        />
      </label>

      <label className="field">
        <span>تاریخ سررسید</span>
        <ShamsiDatePicker value={dueDate} onChange={setDueDate} />
      </label>

      <label className="field">
        <span>{direction === 'payable' ? 'دریافت‌کننده' : 'صادرکننده'}</span>
        <input
          type="text"
          value={partyName}
          onChange={(e) => setPartyName(e.target.value)}
          placeholder="نام طرف مقابل"
          required
        />
      </label>

      <label className="field">
        <span>بانک</span>
        <select value={bankName} onChange={(e) => setBankName(e.target.value)}>
          <option value="" disabled>
            انتخاب بانک
          </option>
          {IRANIAN_BANKS.map((bank) => (
            <option key={bank} value={bank}>
              {bank}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>شماره چک</span>
        <input
          className="numeric-field"
          type="text"
          value={chequeNumber}
          onChange={(e) => setChequeNumber(e.target.value)}
          placeholder="شماره چک"
        />
      </label>

      <label className="field">
        <span>توضیحات</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="توضیحات اختیاری"
          rows={2}
        />
      </label>

      <label className="field">
        <span>یادآوری (روز قبل از سررسید، با کاما جدا کنید)</span>
        <input
          type="text"
          value={reminderDaysText}
          onChange={(e) => setReminderDaysText(e.target.value)}
          placeholder="۷، ۳، ۱"
        />
      </label>

      {error && <p className="form-error">{error}</p>}

      <div className="form-actions">
        <button type="submit" className="primary" disabled={submitting}>
          {submitting ? 'در حال ذخیره...' : 'ثبت چک'}
        </button>
        <button type="button" onClick={onCancel} disabled={submitting}>
          انصراف
        </button>
      </div>
    </form>
  )
}
