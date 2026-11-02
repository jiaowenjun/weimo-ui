import { describe, expect, it } from 'vitest'

import {
  buildHeatmapCells,
  buildHeatmapColumns,
  buildHeatmapMonthLabels,
  formatHeatmapDateKey,
  getHeatmapLevel,
} from '../src/components/heatmap/heatmap-model'

describe('heatmap model', () => {
  it('maps counts to five heat levels', () => {
    expect([-1, 0, 1, 2, 3, 4, 5, 6, 100].map(getHeatmapLevel)).toEqual([
      0, 0, 1, 2, 2, 3, 3, 4, 4,
    ])
  })

  it('formats local dates as zero-padded keys', () => {
    expect(formatHeatmapDateKey(new Date(2026, 0, 5))).toBe('2026-01-05')
    expect(formatHeatmapDateKey(new Date(2026, 11, 31))).toBe('2026-12-31')
  })

  it('builds a 13-week window ending on the sunday of the current iso week', () => {
    const saturday = buildHeatmapCells([], '2026-10-24')
    const sunday = buildHeatmapCells([], '2026-10-25')

    expect(saturday).toHaveLength(13 * 7)
    expect(saturday[0].date).toBe('2026-07-27')
    expect(saturday.at(-1)?.date).toBe('2026-10-25')

    // 周日属于前一个周一开启的 ISO 周,窗口与同周的周六完全一致
    expect(sunday.map((cell) => cell.date)).toEqual(
      saturday.map((cell) => cell.date),
    )
  })

  it('flags today and the active date and clamps negative counts', () => {
    const cells = buildHeatmapCells(
      [
        { date: '2026-10-24', count: 6 },
        { date: '2026-10-20', count: -3 },
        { date: '2026-10-21', count: 2 },
      ],
      '2026-10-24',
      '2026-10-21',
    )
    const byDate = new Map(cells.map((cell) => [cell.date, cell]))

    expect(byDate.get('2026-10-24')).toMatchObject({
      count: 6,
      level: 4,
      isToday: true,
      isActive: false,
    })
    expect(byDate.get('2026-10-21')).toMatchObject({
      count: 2,
      level: 2,
      isToday: false,
      isActive: true,
    })
    expect(byDate.get('2026-10-20')).toMatchObject({ count: 0, level: 0 })
    expect(cells.filter((cell) => cell.isToday)).toHaveLength(1)
    expect(cells.filter((cell) => cell.isActive)).toHaveLength(1)
  })

  it('splits cells into 13 columns of 7 days', () => {
    const columns = buildHeatmapColumns(buildHeatmapCells([], '2026-10-24'))

    expect(columns).toHaveLength(13)
    expect(columns.map((column) => column.index)).toEqual(
      Array.from({ length: 13 }, (_, index) => index),
    )
    expect(columns.every((column) => column.cells.length === 7)).toBe(true)
    expect(columns[0].cells[0].date).toBe('2026-07-27')
    expect(columns[12].cells[6].date).toBe('2026-10-25')
  })

  it('labels the columns that contain the first day of a month', () => {
    const labels = buildHeatmapMonthLabels(buildHeatmapCells([], '2026-10-24'))

    expect(labels).toEqual([
      { name: '8月', columnIndex: 0 },
      { name: '9月', columnIndex: 5 },
      { name: '10月', columnIndex: 9 },
    ])
  })
})
