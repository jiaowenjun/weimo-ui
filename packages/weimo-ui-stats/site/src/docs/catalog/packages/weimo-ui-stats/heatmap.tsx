import { useState } from 'react'
import { RotateCcw } from 'lucide-react'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { GhostIconButton } from 'weimo-ui-core/components/ghost-icon-button'
import {
  Heatmap,
  formatHeatmapDateKey,
  type HeatmapDailyCount,
} from 'weimo-ui-stats/components/heatmap'
import { StatGroup } from 'weimo-ui-stats/components/stat-group'
import type { ComponentDefinition } from '../../component-docs'

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

function HeatmapDemo() {
  // 初始无选中单元格,空串即 Heatmap 的「无 active」约定
  const [activeDate, setActiveDate] = useState('')

  return (
    <ComponentPreviewCard
      className="stat-page__card"
      label="热力图"
    >
      <div className="stat-page__heatmap-preview">
        <Heatmap
          activeDate={activeDate}
          dailyCounts={demoDailyCounts}
          onDateSelect={(date) => setActiveDate(date)}
        />
      </div>
    </ComponentPreviewCard>
  )
}

// 字数指标:label 与 format 随数值档位(字/千字/万字)自适应,滚动期间逐帧套用
function wordCountMetric(wordCount: number) {
  if (wordCount < 1000) {
    return { label: '字', format: (value: number) => `${Math.round(value)}` }
  }
  if (wordCount < 10000) {
    return { label: '千字', format: (value: number) => (value / 1000).toFixed(1) }
  }
  return { label: '万字', format: (value: number) => (value / 10000).toFixed(1) }
}

const INITIAL_WORD_COUNT = 12345

// 统计组数字走 MagicNumber:刷新后数值变动滚动到新值,字数档位随之切换
function StatGroupDemo() {
  const [wordCount, setWordCount] = useState(INITIAL_WORD_COUNT)
  const [noteCount, setNoteCount] = useState(128)
  const [dayCount, setDayCount] = useState(36)
  const wordMetric = wordCountMetric(wordCount)

  const refresh = () => {
    setNoteCount(Math.round(40 + Math.random() * 400))
    setWordCount(Math.round(500 + Math.random() * 60000))
    setDayCount(Math.round(5 + Math.random() * 200))
  }

  return (
    <ComponentPreviewCard
      action={
        <GhostIconButton aria-label="模拟数据刷新" onClick={refresh} size="sm">
          <RotateCcw aria-hidden="true" />
        </GhostIconButton>
      }
      className="stat-page__card"
      label="统计组"
    >
      <div className="stat-page__stat-group-preview">
        <StatGroup
          aria-label="笔记统计"
          items={[
            { key: 'notes', value: noteCount, label: '笔记' },
            { key: 'words', value: wordCount, label: wordMetric.label, format: wordMetric.format },
            { key: 'days', value: dayCount, label: '天' },
          ]}
        />
      </div>
    </ComponentPreviewCard>
  )
}

function HeatmapPageDemo() {
  return (
    <>
      <StatGroupDemo />
      <HeatmapDemo />
    </>
  )
}

export const heatmapDefinition = {
  id: 'heatmap',
  summary: '按周排列的 13 周日期活动热力图,附带统计组',
  status: 'Ready',
  frame: 'plain',
  preview: () => <HeatmapPageDemo />,
} satisfies ComponentDefinition
