export type HeatmapDailyCount = {
  date: string
  count: number
}

export type HeatmapLevel = 0 | 1 | 2 | 3 | 4

export type HeatmapCell = {
  date: string
  count: number
  level: HeatmapLevel
  isToday: boolean
  isActive: boolean
}

export type HeatmapColumn = {
  cells: HeatmapCell[]
  index: number
}

export type HeatmapMonthLabel = {
  name: string
  columnIndex: number
}

const visibleWeekCount = 13
const daysPerWeek = 7

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split('-').map(Number)

  return new Date(year, month - 1, day)
}

function startOfIsoWeek(date: Date) {
  const current = new Date(date)
  const day = current.getDay()
  const diff = day === 0 ? -6 : 1 - day

  current.setDate(current.getDate() + diff)
  current.setHours(0, 0, 0, 0)

  return current
}

export function formatHeatmapDateKey(date: Date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

export function getHeatmapLevel(count: number): HeatmapLevel {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3

  return 4
}

export function buildHeatmapCells(
  dailyCounts: HeatmapDailyCount[],
  today = formatHeatmapDateKey(new Date()),
  activeDate = '',
) {
  const todayDate = parseDateKey(today)
  const endWeekStart = startOfIsoWeek(todayDate)
  const startDate = new Date(endWeekStart)

  startDate.setDate(endWeekStart.getDate() - (visibleWeekCount - 1) * daysPerWeek)

  const countsByDate = new Map(
    dailyCounts.map((entry) => [entry.date, Math.max(0, entry.count)]),
  )
  const cells: HeatmapCell[] = []
  const cursor = new Date(startDate)

  for (let index = 0; index < visibleWeekCount * daysPerWeek; index += 1) {
    const date = formatHeatmapDateKey(cursor)
    const count = countsByDate.get(date) ?? 0

    cells.push({
      date,
      count,
      level: getHeatmapLevel(count),
      isToday: date === today,
      isActive: date === activeDate,
    })

    cursor.setDate(cursor.getDate() + 1)
  }

  return cells
}

export function buildHeatmapColumns(cells: HeatmapCell[]) {
  const columns: HeatmapColumn[] = []

  for (let index = 0; index < cells.length; index += daysPerWeek) {
    columns.push({
      cells: cells.slice(index, index + daysPerWeek),
      index: columns.length,
    })
  }

  return columns
}

export function buildHeatmapMonthLabels(cells: HeatmapCell[]) {
  const labels: HeatmapMonthLabel[] = []

  for (let index = 0; index < cells.length; index += daysPerWeek) {
    const column = cells.slice(index, index + daysPerWeek)
    const monthStart = column.find((cell) => {
      const day = Number(cell.date.split('-')[2])

      return day === 1
    })

    if (monthStart) {
      const month = Number(monthStart.date.split('-')[1])

      labels.push({
        name: `${month}月`,
        columnIndex: index / daysPerWeek,
      })
    }
  }

  return labels
}
