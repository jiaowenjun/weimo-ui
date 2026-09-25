import { useState } from 'react'
import type { ReactNode } from 'react'

import { CardSurface } from '../../components/card-surface'
import { GlassSurface, useGlassSurfaceBackgroundToneRef } from '../../components/glass-surface'
import { PopupSurface } from '../../components/popup-surface'
import { LiquidGlassSurface } from '../../components/liquid-glass'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'
import { SurfaceBorderToggle } from '../preview-toggle'

function CardSurfacePreview() {
  return (
    <ComponentPreviewCard align="center" label="卡片材质">
      <div aria-hidden="true" className="card-surface-preview">
        <CardSurface className="card-surface-preview__tile">
          <span className="card-surface-preview__title">Card Surface</span>
          <span className="card-surface-preview__meta">亮主题细微阴影，暗主题边框描边</span>
        </CardSurface>
      </div>
    </ComponentPreviewCard>
  )
}

function GlassSurfacePreview() {
  const [bordered, setBordered] = useState(false)

  return (
    <GlassPreviewCard
      action={
        <SurfaceBorderToggle bordered={bordered} onBorderedChange={setBordered} />
      }
      label="磨砂材质"
    >
      <GlassSurface bordered={bordered} className="glass-surface-preview__tile">
        <span className="glass-surface-preview__title">Glass Surface</span>
        <span className="glass-surface-preview__meta">前景色随背景亮度自适应明暗</span>
      </GlassSurface>
    </GlassPreviewCard>
  )
}

// 液态玻璃内容文字借磨砂材质的 tone 采样自适应明暗(与磨砂材质卡同一
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

// eslint-disable-next-line react-refresh/only-export-components
function LiquidGlassPreview() {
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
      </div>
    </GlassPreviewCard>
  )
}

function PopupSurfacePreview() {
  return (
    <ComponentPreviewCard align="center" label="浮层材质">
      <div className="popup-surface-preview">
        <PopupSurface className="popup-surface-preview__tile">
          <span className="popup-surface-preview__title">Modal Surface</span>
          <span className="popup-surface-preview__meta">亮主题抬升投影，暗主题边框描边</span>
        </PopupSurface>
      </div>
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function SurfaceDemo() {
  return (
    <>
      <CardSurfacePreview />
      <GlassSurfacePreview />
      <LiquidGlassPreview />
      <PopupSurfacePreview />
    </>
  )
}

export const surfaceDefinition = {
  id: 'surface',
  summary: '静态卡片、亮度自适应磨砂玻璃层、液态玻璃与抬升浮层的材质总览',
  status: 'Preview',
  frame: 'plain',
  searchAliases: [
    'Surface',
    'CardSurface',
    'GlassSurface',
    'PopupSurface',
    'LiquidGlass',
    'LiquidGlassSurface',
    '液态玻璃',
    'liquid-glass-react',
    '材质',
    '卡片材质',
    '磨砂材质',
    '无边框',
    '浮层材质',
    '--color-text-primary',
    '--color-border',
    '--radius',
    '--color-bg-card',
    '--shadow-card',
  ],
  preview: () => <SurfaceDemo />,
} satisfies ComponentDefinition
