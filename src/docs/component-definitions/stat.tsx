import { useState } from 'react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import {
  Heatmap,
  formatHeatmapDateKey,
  type HeatmapDailyCount,
} from '../../components/heatmap'
import { StatGroup } from '../../components/stat-group'
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
    <ComponentPreviewCard label="热力图">
      <div className="heatmap-preview">
        <Heatmap
          activeDate={activeDate}
          dailyCounts={counts}
          onDateSelect={(date) => setActiveDate(date)}
        />
      </div>
    </ComponentPreviewCard>
  )
}

function formatWordCountMetric(wordCount: number) {
  if (wordCount < 1000) {
    return { value: String(wordCount), label: '字' }
  }
  if (wordCount < 10000) {
    return { value: (wordCount / 1000).toFixed(1), label: '千字' }
  }
  return { value: (wordCount / 10000).toFixed(1), label: '万字' }
}

const wordMetric = formatWordCountMetric(12345)

const sidebarStatsItems = [
  { key: 'notes', value: '128', label: '笔记' },
  { key: 'words', value: wordMetric.value, label: wordMetric.label },
  { key: 'days', value: '36', label: '天' },
]

// eslint-disable-next-line react-refresh/only-export-components
function StatGroupDemo() {
  return (
    <ComponentPreviewCard label="统计组">
      <StatGroup items={sidebarStatsItems} aria-label="笔记统计" />
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function StatDemo() {
  return (
    <>
      <HeatmapDemo />
      <StatGroupDemo />
    </>
  )
}

export const statDefinition = {
  id: 'stat',
  summary: '日期热力图与侧边栏统计组的统计总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'Heatmap',
    'StatGroup',
    '热力图',
    '统计组',
  ],
  preview: () => <StatDemo />,
} satisfies ComponentDefinition
