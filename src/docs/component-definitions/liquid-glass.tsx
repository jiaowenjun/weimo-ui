import type { ReactNode } from 'react'

import { LiquidGlassSurface } from '../../components/liquid-glass'
import { useGlassSurfaceBackgroundToneRef } from '../../components/glass-surface'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'

// 液态玻璃内容文字借普通玻璃材质的 tone 采样自适应明暗(与玻璃材质卡同一
// 机制与翻转阈值):瓦片持有 data-background-tone,背景转亮时翻深字、覆盖
// 库默认的深色文字投影,背景转暗时维持白字。材质层本身不参与自适应。
// eslint-disable-next-line react-refresh/only-export-components
function LiquidGlassTile({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  const { backgroundTone, setElementRef } =
    useGlassSurfaceBackgroundToneRef<HTMLDivElement>(true)

  return (
    <div
      className={className}
      data-background-tone={backgroundTone ?? undefined}
      ref={setElementRef}
    >
      {children}
    </div>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function LiquidGlassDemo() {
  return (
    <GlassPreviewCard label="液态玻璃材质">
      <div className="liquid-glass-preview">
        <LiquidGlassTile className="liquid-glass-preview__tile">
          <LiquidGlassSurface cornerRadius={16} padding="14px 20px">
            <div className="liquid-glass-preview__content">
              <span className="liquid-glass-preview__title">Liquid Glass</span>
              <span className="liquid-glass-preview__meta">位移贴图折射背景、边缘色差与高光</span>
            </div>
          </LiquidGlassSurface>
        </LiquidGlassTile>
        <LiquidGlassTile className="liquid-glass-preview__tile liquid-glass-preview__tile--pill">
          <LiquidGlassSurface padding="12px 24px">
            <span className="liquid-glass-preview__pill-label">液态胶囊</span>
          </LiquidGlassSurface>
        </LiquidGlassTile>
      </div>
    </GlassPreviewCard>
  )
}

export const liquidGlassDefinition = {
  id: 'liquid-glass',
  summary: '位移贴图折射背景的液态玻璃材质、边缘色差、高光与悬停弹性,独立于普通玻璃材质',
  status: 'Preview',
  frame: 'plain',
  searchAliases: [
    'LiquidGlass',
    'LiquidGlassSurface',
    '液态玻璃',
    'liquid-glass-react',
    '玻璃材质',
  ],
  preview: () => <LiquidGlassDemo />,
} satisfies ComponentDefinition
