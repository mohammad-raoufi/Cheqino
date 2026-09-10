import { useMemo, useState } from 'react'
import type { Cheque } from '../types'
import {
  SHAMSI_MONTH_NAMES,
  SHAMSI_WEEKDAY_NAMES,
  addShamsiMonths,
  shamsiMonthLength,
  shamsiToIso,
  todayShamsi,
  toPersianDigits,
} from '../lib/shamsi'
import { computeStatus } from '../lib/status'

interface ChequeCalendarProps {
  cheques: Cheque[]
  onSelectDate: (iso: string) => void
}

export function ChequeCalendar({ cheques, onSelectDate }: ChequeCalendarProps) {
  const [{ jy, jm }, setYm] = useState(() => {
    const t = todayShamsi()
    return { jy: t.jy, jm: t.jm }
  })

  const chequesByDate = useMemo(() => {
    const map = new Map<string, Cheque[]>()
    for (const cheque of cheques) {
      const list = map.get(cheque.dueDate) ?? []
      list.push(cheque)
      map.set(cheque.dueDate, list)
    }
    return map
  }, [cheques])

  const dayCount = shamsiMonthLength(jy, jm)
  const firstDayIso = shamsiToIso(jy, jm, 1)
  const firstWeekday = new Date(firstDayIso).getDay() // 0=Sun..6=Sat, but Date uses Gregorian weekday of that ISO date
  // JS Date.getDay(): 0=Sunday..6=Saturday. Our week starts Saturday (index 0 in SHAMSI_WEEKDAY_NAMES).
  const leadingBlanks = (firstWeekday + 1) % 7

  const cells = useMemo(() => {
    const result: Array<{ jd: number; iso: string } | null> = []
    for (let i = 0; i < leadingBlanks; i++) result.push(null)
    for (let jd = 1; jd <= dayCount; jd++) {
      result.push({ jd, iso: shamsiToIso(jy, jm, jd) })
    }
    return result
  }, [dayCount, jy, jm, leadingBlanks])

  const todayJalaali = todayShamsi()
  const todayIsoStr = shamsiToIso(todayJalaali.jy, todayJalaali.jm, todayJalaali.jd)

  function goToMonth(delta: number) {
    setYm(addShamsiMonths(jy, jm, delta))
  }

  return (
    <div className="cheque-calendar">
      <div className="calendar-header">
        <button type="button" onClick={() => goToMonth(1)} aria-label="ماه بعد">
          ‹
        </button>
        <span className="calendar-title">
          {SHAMSI_MONTH_NAMES[jm - 1]} {toPersianDigits(jy)}
        </span>
        <button type="button" onClick={() => goToMonth(-1)} aria-label="ماه قبل">
          ›
        </button>
      </div>

      <div className="calendar-weekdays">
        {SHAMSI_WEEKDAY_NAMES.map((name) => (
          <span key={name}>{name.slice(0, 2)}</span>
        ))}
      </div>

      <div className="calendar-grid">
        {cells.map((cell, i) => {
          if (!cell) return <span key={`blank-${i}`} className="calendar-cell empty" />

          const dayCheques = chequesByDate.get(cell.iso) ?? []
          const isToday = cell.iso === todayIsoStr
          const statuses = new Set(dayCheques.map((c) => computeStatus(c)))

          return (
            <button
              key={cell.iso}
              type="button"
              className={`calendar-cell${isToday ? ' today' : ''}${dayCheques.length ? ' has-cheques' : ''}`}
              onClick={() => onSelectDate(cell.iso)}
            >
              <span className="cell-day">{toPersianDigits(cell.jd)}</span>
              {dayCheques.length > 0 && (
                <span className="cell-dots">
                  {[...statuses].map((s) => (
                    <span key={s} className={`dot status-${s}`} />
                  ))}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
