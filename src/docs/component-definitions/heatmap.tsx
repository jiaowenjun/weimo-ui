import { useState } from 'react'

import {
  Heatmap,
  formatHeatmapDateKey,
  type HeatmapDailyCount,
} from '../../components/heatmap'
import type { ComponentDefinition } from '../component-docs'

function dateOffset(days: number) {
  const date = new Date()

  date.setDate(date.getDate() + days)

  return formatHeatmapDateKey(date)
}

const demoDailyCounts: HeatmapDailyCount[] = [
  { date: dateOffset(-84), count: 1 },
  { date: dateOffset(-83), count: 2 },
  { date: dateOffset(-76), count: 4 },
  { date: dateOffset(-69), count: 6 },
  { date: dateOffset(-60), count: 1 },
  { date: dateOffset(-43), count: 3 },
  { date: dateOffset(-29), count: 5 },
  { date: dateOffset(-14), count: 1 },
  { date: dateOffset(-13), count: 2 },
  { date: dateOffset(-12), count: 4 },
  { date: dateOffset(-6), count: 6 },
  { date: dateOffset(-2), count: 3 },
  { date: dateOffset(0), count: 2 },
]

function HeatmapDemo({
  counts = demoDailyCounts,
  initialDate = dateOffset(-2),
}: {
  counts?: HeatmapDailyCount[]
  initialDate?: string
} = {}) {
  const [activeDate, setActiveDate] = useState(initialDate)

  return (
    <div className="heatmap-preview">
      <Heatmap
        activeDate={activeDate}
        dailyCounts={counts}
        onDateSelect={(date) => setActiveDate(date)}
      />
    </div>
  )
}

export const heatmapDefinition = {
  id: 'heatmap',
  summary: '复刻 Skyline 侧边栏日期热力图的可点击筛选组件',
  status: 'Ready',
  preview: () => <HeatmapDemo />,
} satisfies ComponentDefinition
