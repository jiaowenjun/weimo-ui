import { Solar } from 'lunar-javascript'

function isValidShareCardDate(date: Date | undefined): date is Date {
  return date instanceof Date && Number.isFinite(date.getTime())
}

function padDatePart(value: number): string {
  return String(value).padStart(2, '0')
}

export function formatShareCardSolarDate(date: Date | undefined): string {
  if (!isValidShareCardDate(date)) return ''

  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()

  return `${year}/${padDatePart(month)}/${padDatePart(day)}`
}

export function formatShareCardLunarDate(date: Date | undefined): string {
  const solar = formatShareCardSolarDate(date)
  if (!isValidShareCardDate(date)) return ''

  try {
    const lunar = Solar.fromYmd(
      date.getFullYear(),
      date.getMonth() + 1,
      date.getDate(),
    ).getLunar()
    const text = `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`

    return text.trim() || solar
  } catch {
    return solar
  }
}

export function formatShareCardDate(
  date: Date | undefined,
  useLunarDate: boolean,
): string {
  if (!useLunarDate) {
    return formatShareCardSolarDate(date)
  }

  return formatShareCardLunarDate(date)
}
