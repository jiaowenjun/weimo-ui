import { GlassSurface } from '../../components/glass-surface'
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

function GlassSurfaceDemo() {
  return (
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
  )
}

export const glassSurfaceDefinition = {
  id: 'glass-surface',
  summary: '运行时读取组件背后的背景亮度，自动切换玻璃层文字和边框颜色',
  status: 'Preview',
  props: [
    { name: 'observe', type: 'boolean', defaultValue: 'true' },
    { name: '...divProps', type: "ComponentPropsWithoutRef<'div'>", defaultValue: '-' },
  ],
  preview: () => <GlassSurfaceDemo />,
} satisfies ComponentDefinition
