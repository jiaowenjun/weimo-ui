import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { CanvasTransparency } from 'weimo-ui-image/components/canvas-transparency'
import type { ComponentDefinition } from '../../component-docs'
import { ComponentCardTitle } from '../../component-card-title'

const sampleGeometry = `data:image/svg+xml;utf8,${encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 240">
    <rect width="360" height="240" fill="#fff" />
    <g fill="none" stroke="#111" stroke-width="4">
      <ellipse cx="180" cy="120" rx="130" ry="76" />
      <path d="M50 120h260M180 44v152M92 65l176 110" />
    </g>
    <g fill="#111" font-family="sans-serif" font-size="18">
      <text x="316" y="126">x</text>
      <text x="187" y="39">y</text>
    </g>
  </svg>
`)}`

function CanvasTransparencyDemo() {
  return (
    <ComponentPreviewCard
      className="image-page__card"
      label={
        <ComponentCardTitle componentName="canvas-transparency">
          画布透明化
        </ComponentCardTitle>
      }
    >
      <div className="canvas-transparency-docs-preview">
        <CanvasTransparency
          alt="几何图透明化结果"
          src={sampleGeometry}
        />
      </div>
    </ComponentPreviewCard>
  )
}

export const canvasTransparencyDefinition = {
  id: 'canvas-transparency',
  summary: '按背景色采样生成透明化图片，明暗主题自动切换产物',
  status: 'Ready',
  frame: 'plain',
  preview: () => <CanvasTransparencyDemo />,
} satisfies ComponentDefinition
