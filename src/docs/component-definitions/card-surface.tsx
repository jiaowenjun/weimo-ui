import { CardSurface } from '../../components/card-surface'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import type { ComponentDefinition } from '../component-docs'

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function CardSurfaceDemo() {
  return (
    <ComponentPreviewCard>
      <CardSurface className="card-surface-preview__tile">
        <span className="card-surface-preview__title">Card Surface</span>
        <span className="card-surface-preview__meta">静态实体卡片材质</span>
      </CardSurface>
    </ComponentPreviewCard>
  )
}

export const cardSurfaceDefinition = {
  id: 'card-surface',
  summary: '统一静态实体卡片的背景、边框、圆角与轻量阴影',
  status: 'Preview',
  frame: 'plain',
  searchAliases: [
    'CardSurface',
    '材质',
    '卡片材质',
    '--color-text-primary',
    '--color-border',
    '--radius',
    '--color-bg-card',
    '--shadow-card',
  ],
  preview: () => <CardSurfaceDemo />,
} satisfies ComponentDefinition
