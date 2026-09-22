import { useState } from 'react'
import type { CSSProperties } from 'react'

import { bgColorToneMap } from '../../components/bg-color'
import { CardSurface } from '../../components/card-surface'
import { GlassSurface } from '../../components/glass-surface'
import { PopupSurface } from '../../components/popup-surface'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import {
  Slider,
  SliderControl,
  SliderIndicator,
  SliderThumb,
  SliderTrack,
} from '../../components/coss/slider'
import type { ComponentDefinition } from '../component-docs'
import { parseColorLightness } from '../token-preview-color'

// slider 端点取 ComponentPreviewCard（CardSurface）两种主题的卡片底色灰度。
const glassBackgroundGrayDark = parseColorLightness(bgColorToneMap.card.value.dark)?.lightness ?? 12
const glassBackgroundGrayLight = parseColorLightness(bgColorToneMap.card.value.light)?.lightness ?? 100

// 条纹 stop 用 rgb() 输出：GlassSurface 的背景采样只解析 hex 与 rgb()，不识别 hsl()。
// spread 关于中点对称且从左到右递增：条纹逐根变亮，五条条纹的平均亮度等于滑块灰度值
// （采样端取 backgroundImage 内全部颜色的均值，与条纹位移无关）。
const glassGradientStops = [
  { hue: 220, saturation: 0.58, spread: -16 },
  { hue: 262, saturation: 0.55, spread: -8 },
  { hue: 316, saturation: 0.5, spread: 0 },
  { hue: 18, saturation: 0.64, spread: 8 },
  { hue: 44, saturation: 0.72, spread: 16 },
] as const

// 每根条纹固定单色、宽 48px；滑块走满全程时背景恰好向左滑过一个完整周期。
const glassStripeWidth = 48
const glassStripePeriod = glassGradientStops.length * glassStripeWidth

function glassHslToRgb(hue: number, saturation: number, lightness: number) {
  const chroma = (1 - Math.abs(2 * lightness - 1)) * saturation
  const secondary = chroma * (1 - Math.abs(((hue / 60) % 2) - 1))
  const match = lightness - chroma / 2
  const base =
    hue < 60
      ? ([chroma, secondary, 0] as const)
      : hue < 120
        ? ([secondary, chroma, 0] as const)
        : hue < 180
          ? ([0, chroma, secondary] as const)
          : hue < 240
            ? ([0, secondary, chroma] as const)
            : hue < 300
              ? ([secondary, 0, chroma] as const)
              : ([chroma, 0, secondary] as const)

  return [
    Math.round((base[0] + match) * 255),
    Math.round((base[1] + match) * 255),
    Math.round((base[2] + match) * 255),
  ] as const
}

function getGlassPreviewBackground(gray: number): CSSProperties {
  const range = glassBackgroundGrayLight - glassBackgroundGrayDark
  const progress = Math.min(Math.max((gray - glassBackgroundGrayDark) / range, 0), 1)
  // sin 包络让饱和度与亮度离散在两端点同步收敛为 0，条纹退化为端点纯色；
  // 端点显式归零，避免 sin(π) 的浮点残差把纯色端点挤进防洗白 clamp 区间。
  const colorfulness = progress <= 0 || progress >= 1 ? 0 : Math.sin(Math.PI * progress)
  const stripes = glassGradientStops.map(({ hue, saturation, spread }, index) => {
    // clamp 只约束彩色区间的 stop，端点灰度（12/100）原样保留。
    const boundedGray =
      colorfulness === 0 ? gray : Math.min(Math.max(gray + spread * colorfulness, 3), 97)
    const [red, green, blue] = glassHslToRgb(
      hue,
      saturation * colorfulness,
      boundedGray / 100,
    )

    // 首尾双坐标形成硬边界，单根条纹内部保持固定单色。
    return `rgb(${red}, ${green}, ${blue}) ${index * glassStripeWidth}px ${(index + 1) * glassStripeWidth}px`
  })

  return {
    backgroundImage: `repeating-linear-gradient(90deg, ${stripes.join(', ')})`,
    // 滑块左→右：背景整体左移，各点条纹相位走高变亮后回绕，亮暗变化只来自横向位移。
    backgroundPositionX: `${-progress * glassStripePeriod}px`,
  }
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function SurfaceDemo() {
  // 刷新时的初始灰度跟随页面主题：亮色落在亮卡底端点，暗色落在暗卡底端点。
  // docs-shell 首次挂载前 .dark class 尚未写入（useEffect 时序），直接按 system
  // 偏好预判，与 shell 挂载后的主题一致；之后的主题切换不移动滑块。
  const [glassBackgroundGray, setGlassBackgroundGray] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? glassBackgroundGrayDark
      : glassBackgroundGrayLight,
  )

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

      <ComponentPreviewCard
        action={
          <Slider
            className="glass-surface-preview__slider"
            max={glassBackgroundGrayLight}
            min={glassBackgroundGrayDark}
            onValueChange={setGlassBackgroundGray}
            step={1}
            value={glassBackgroundGray}
          >
            <SliderControl>
              <SliderTrack>
                <SliderIndicator />
                <SliderThumb aria-label="背景灰度" />
              </SliderTrack>
            </SliderControl>
          </Slider>
        }
        label="玻璃材质"
      >
        <div
          className="glass-surface-preview"
          style={getGlassPreviewBackground(glassBackgroundGray)}
        >
          <div className="glass-surface-preview__fixed">
            <GlassSurface className="glass-surface-preview__tile">
              <span className="glass-surface-preview__title">Glass Surface</span>
              <span className="glass-surface-preview__meta">前景色随背景亮度自适应明暗</span>
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
