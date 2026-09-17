import { StatGroup } from '../../components/stat-group'
import type { ComponentDefinition } from '../component-docs'

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

export const statGroupDefinition = {
  id: 'stat-group',
  summary: '复刻 Skyline 侧边栏统计区的笔记、字数、天数三栏',
  status: 'Ready',
  preview: () => <StatGroup items={sidebarStatsItems} aria-label="笔记统计" />,
} satisfies ComponentDefinition
