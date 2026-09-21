import { CardSurface } from '../../components/card-surface'
import { GlassSurface } from '../../components/glass-surface'
import { PopupSurface } from '../../components/popup-surface'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import type { ComponentDefinition } from '../component-docs'

const glassSurfacePreviewBackgroundBands = [
  '#0f172a',
  '#111827',
  '#1e293b',
  '#334155',
  '#475569',
  '#64748b',
  '#94a3b8',
  '#cbd5e1',
  '#e2e8f0',
  '#f8fafc',
] as const

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function SurfaceDemo() {
  return (
    <>
      <ComponentPreviewCard label="卡片材质">
        <div aria-hidden="true" className="card-surface-preview">
          <CardSurface className="card-surface-preview__tile">
            <span className="card-surface-preview__title">Card Surface</span>
            <span className="card-surface-preview__meta">静态实体卡片材质</span>
          </CardSurface>
        </div>
      </ComponentPreviewCard>

      <ComponentPreviewCard label="玻璃材质">
        <div className="glass-surface-preview">
          <div
            className="glass-surface-preview__scroll-viewport"
            aria-label="GlassSurface 可滚动背景预览"
          >
            <div className="glass-surface-preview__scroll-content">
              {glassSurfacePreviewBackgroundBands.map((color, index) => (
                <span
                  aria-hidden="true"
                  className="glass-surface-preview__band"
                  key={color}
                  style={{
                    backgroundColor: color,
                    height: `${100 / glassSurfacePreviewBackgroundBands.length + 0.2}%`,
                    top: `${(index / glassSurfacePreviewBackgroundBands.length) * 100}%`,
                  }}
                />
              ))}
            </div>
          </div>
          <div className="glass-surface-preview__fixed">
            <GlassSurface className="glass-surface-preview__tile">
              <span className="glass-surface-preview__title">Glass Surface</span>
              <span className="glass-surface-preview__meta">data-background-tone</span>
            </GlassSurface>
          </div>
        </div>
      </ComponentPreviewCard>

      <ComponentPreviewCard label="浮层材质">
        <div className="popup-surface-preview">
          <PopupSurface className="popup-surface-preview__tile">
            <span className="popup-surface-preview__title">Modal Surface</span>
            <span className="popup-surface-preview__meta">抬升浮层主体材质</span>
          </PopupSurface>
          <PopupSurface className="popup-surface-preview__tile" level="tooltip">
            <span className="popup-surface-preview__title">Tooltip Surface</span>
          </PopupSurface>
        </div>
      </ComponentPreviewCard>
    </>
  )
}

export const surfaceDefinition = {
  id: 'surface',
  summary: '静态卡片、亮度自适应玻璃层与抬升浮层的材质总览',
  status: 'Preview',
  frame: 'plain',
  searchAliases: [
    'Surface',
    'CardSurface',
    'GlassSurface',
    'PopupSurface',
    '材质',
    '卡片材质',
    '玻璃材质',
    '浮层材质',
    '--color-text-primary',
    '--color-border',
    '--radius',
    '--color-bg-card',
    '--shadow-card',
  ],
  preview: () => <SurfaceDemo />,
} satisfies ComponentDefinition
