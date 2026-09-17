import { CardSurface } from '../../components/card-surface'
import type { ComponentDefinition } from '../component-docs'

function CardSurfaceDemo() {
  return (
    <div className="card-surface-preview">
      <CardSurface className="card-surface-preview__tile">
        <span className="card-surface-preview__title">Card Surface</span>
        <span className="card-surface-preview__meta">静态实体卡片材质</span>
      </CardSurface>
    </div>
  )
}

export const cardSurfaceDefinition = {
  id: 'card-surface',
  summary: '统一静态实体卡片的背景、边框、圆角与轻量阴影',
  status: 'Preview',
  preview: () => <CardSurfaceDemo />,
} satisfies ComponentDefinition
