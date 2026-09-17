import { CanvasTransparency } from '../../components/canvas-transparency'
import type { ComponentDefinition } from '../component-docs'

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

export const canvasTransparencyDefinition = {
  id: 'canvas-transparency',
  summary: '基于角点背景采样生成亮暗主题透明 PNG，最多缓存 32 组处理结果及已解码资源，由共享缓存管理对象 URL 生命周期',
  status: 'Ready',
  preview: () => (
    <CanvasTransparency
      alt="几何图透明化结果"
      src={sampleGeometry}
    />
  ),
} satisfies ComponentDefinition
