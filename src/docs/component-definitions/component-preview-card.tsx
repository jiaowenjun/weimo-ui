import { useState } from 'react'

import { bgColorToneMap } from '../../components/bg-color'
import { borderRadiusScaleMap } from '../../components/border-radius'
import { Chip } from '../../components/chip'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import { GlassSurface } from '../../components/glass-surface'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'
import { PreviewToggle } from '../preview-toggle'

// 示例 token 行直接取真实 token 表：预览卡自身的材质（卡片底色 + 基础圆角）。
const previewCardItems = [
  {
    token: bgColorToneMap.card.token,
    value: bgColorToneMap.card.value.light,
    darkValue: bgColorToneMap.card.value.dark,
  },
  {
    token: borderRadiusScaleMap.base.token,
    value: borderRadiusScaleMap.base.value,
  },
]

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function PreviewCardDemo() {
  const [showTokenRows, setShowTokenRows] = useState(true)

  return (
    <>
      <ComponentPreviewCard
        action={
          <PreviewToggle
            ariaLabel="显示 token 行"
            checked={showTokenRows}
            label={showTokenRows ? '显示 token 行' : '隐藏 token 行'}
            onCheckedChange={setShowTokenRows}
          />
        }
        align="center"
        items={showTokenRows ? previewCardItems : undefined}
        label="组件预览卡"
      >
        <TextButton>内容区示例</TextButton>
        <Chip content="示例胶囊" />
      </ComponentPreviewCard>
      <GlassPreviewCard label="玻璃预览卡">
        <GlassSurface className="glass-surface-preview__tile">
          <span className="glass-surface-preview__title">Glass Preview</span>
          <span className="glass-surface-preview__meta">拖动灰度滑块验证玻璃材质</span>
        </GlassSurface>
      </GlassPreviewCard>
    </>
  )
}

export const componentPreviewCardDefinition = {
  id: 'component-preview-card',
  summary: '文档站预览卡外壳：标题栏 + 可选 token 行 + 内容画布；玻璃变体自带灰度滑块画布',
  status: 'Preview',
  frame: 'plain',
  searchAliases: [
    'ComponentPreviewCard',
    'GlassPreviewCard',
    'TokenPreviewCard',
    '预览卡',
  ],
  preview: () => <PreviewCardDemo />,
} satisfies ComponentDefinition
