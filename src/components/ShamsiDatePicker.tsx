import { useMemo } from 'react'
import {
  SHAMSI_MONTH_NAMES,
  isoToShamsi,
  shamsiMonthLength,
  shamsiToIso,
  todayShamsi,
  toPersianDigits,
} from '../lib/shamsi'

interface ShamsiDatePickerProps {
  value: string // ISO date
  onChange: (iso: string) => void
}

export function ShamsiDatePicker({ value, onChange }: ShamsiDatePickerProps) {
  const current = value ? isoToShamsi(value) : todayShamsi()
  const { jy, jm, jd } = current

  const years = useMemo(() => {
    const base = todayShamsi().jy
    return Array.from({ length: 12 }, (_, i) => base - 2 + i)
  }, [])

  const dayCount = shamsiMonthLength(jy, jm)
  const days = useMemo(
    () => Array.from({ length: dayCount }, (_, i) => i + 1),
    [dayCount],
  )

  function handleChange(nextJy: number, nextJm: number, nextJd: number) {
    const clampedJd = Math.min(nextJd, shamsiMonthLength(nextJy, nextJm))
    onChange(shamsiToIso(nextJy, nextJm, clampedJd))
  }

  return (
    <div className="shamsi-date-picker">
      <select
        aria-label="روز"
        value={jd}
        onChange={(e) => handleChange(jy, jm, Number(e.target.value))}
      >
        {days.map((d) => (
          <option key={d} value={d}>
            {toPersianDigits(d)}
          </option>
        ))}
      </select>
      <select
        aria-label="ماه"
        value={jm}
        onChange={(e) => handleChange(jy, Number(e.target.value), jd)}
      >
        {SHAMSI_MONTH_NAMES.map((name, i) => (
          <option key={name} value={i + 1}>
            {name}
          </option>
        ))}
      </select>
      <select
        aria-label="سال"
        value={jy}
        onChange={(e) => handleChange(Number(e.target.value), jm, jd)}
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {toPersianDigits(y)}
          </option>
        ))}
      </select>
    </div>
  )
}
