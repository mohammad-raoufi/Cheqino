import {
  isLeapJalaaliYear,
  jalaaliMonthLength,
  jalaaliToDateObject,
  toGregorian,
  toJalaali,
} from 'jalaali-js'

export const SHAMSI_MONTH_NAMES = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
]

export const SHAMSI_WEEKDAY_NAMES = [
  'شنبه',
  'یک‌شنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنج‌شنبه',
  'جمعه',
]

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']

export function toPersianDigits(value: number | string): string {
  return String(value).replace(/[0-9]/g, (d) => PERSIAN_DIGITS[Number(d)])
}

export interface ShamsiDate {
  jy: number
  jm: number
  jd: number
}

export function isoToShamsi(iso: string): ShamsiDate {
  const [y, m, d] = iso.split('-').map(Number)
  return toJalaali(y, m, d)
}

export function shamsiToIso(jy: number, jm: number, jd: number): string {
  const { gy, gm, gd } = toGregorian(jy, jm, jd)
  return `${String(gy).padStart(4, '0')}-${String(gm).padStart(2, '0')}-${String(gd).padStart(2, '0')}`
}

export function todayIso(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
}

export function todayShamsi(): ShamsiDate {
  return toJalaali(new Date())
}

export function formatShamsi(iso: string, withWeekday = false): string {
  const { jy, jm, jd } = isoToShamsi(iso)
  const datePart = `${toPersianDigits(jd)} ${SHAMSI_MONTH_NAMES[jm - 1]} ${toPersianDigits(jy)}`
  if (!withWeekday) return datePart
  const weekday = SHAMSI_WEEKDAY_NAMES[jalaaliToDateObject(jy, jm, jd).getDay()]
  return `${weekday}، ${datePart}`
}

export function shamsiMonthLength(jy: number, jm: number): number {
  return jalaaliMonthLength(jy, jm)
}

export function isLeapShamsiYear(jy: number): boolean {
  return isLeapJalaaliYear(jy)
}

export function addShamsiMonths(
  jy: number,
  jm: number,
  delta: number,
): { jy: number; jm: number } {
  const total = (jy * 12 + (jm - 1)) + delta
  const newJy = Math.floor(total / 12)
  const newJm = (total % 12) + 1
  return { jy: newJy, jm: newJm }
}

export function daysBetweenIso(fromIso: string, toIso: string): number {
  const from = new Date(fromIso)
  const to = new Date(toIso)
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.round(
    (Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) -
      Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) /
      msPerDay,
  )
}

export function formatAmount(amount: number): string {
  return toPersianDigits(amount.toLocaleString('en-US'))
}
