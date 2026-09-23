import { useState } from 'react'

import { CardSurface } from '../../components/card-surface'
import { GlassSurface } from '../../components/glass-surface'
import { PopupSurface } from '../../components/popup-surface'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'
import { SurfaceBorderToggle } from '../preview-toggle'

function CardSurfacePreview() {
  const [bordered, setBordered] = useState(true)

  return (
    <ComponentPreviewCard
      action={
        <SurfaceBorderToggle bordered={bordered} onBorderedChange={setBordered} />
      }
      label="卡片材质"
    >
      <div aria-hidden="true" className="card-surface-preview">
        <CardSurface bordered={bordered} className="card-surface-preview__tile">
          <span className="card-surface-preview__title">Card Surface</span>
          <span className="card-surface-preview__meta">静态实体卡片材质</span>
        </CardSurface>
      </div>
    </ComponentPreviewCard>
  )
}

function GlassSurfacePreview() {
  const [bordered, setBordered] = useState(true)

  return (
    <GlassPreviewCard
      action={
        <SurfaceBorderToggle bordered={bordered} onBorderedChange={setBordered} />
      }
      canvasClassName="glass-surface-preview"
      label="玻璃材质"
    >
      <div className="glass-surface-preview__fixed">
        <GlassSurface bordered={bordered} className="glass-surface-preview__tile">
          <span className="glass-surface-preview__title">Glass Surface</span>
          <span className="glass-surface-preview__meta">前景色随背景亮度自适应明暗</span>
        </GlassSurface>
      </div>
    </GlassPreviewCard>
  )
}

function PopupSurfacePreview() {
  const [bordered, setBordered] = useState(true)

  return (
    <ComponentPreviewCard
      action={
        <SurfaceBorderToggle bordered={bordered} onBorderedChange={setBordered} />
      }
      label="浮层材质"
    >
      <div className="popup-surface-preview">
        <PopupSurface bordered={bordered} className="popup-surface-preview__tile">
          <span className="popup-surface-preview__title">Modal Surface</span>
          <span className="popup-surface-preview__meta">抬升浮层主体材质</span>
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
      <PopupSurfacePreview />
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
