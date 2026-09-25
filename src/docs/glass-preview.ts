import type { CSSProperties } from 'react'

import { bgColorToneMap } from '../components/bg-color'
import { parseColorLightness } from './token-preview-color'

// slider 端点取 ComponentPreviewCard（CardSurface）两种主题的卡片底色灰度。
export const glassBackgroundGrayDark = parseColorLightness(bgColorToneMap.card.value.dark)?.lightness ?? 12
export const glassBackgroundGrayLight = parseColorLightness(bgColorToneMap.card.value.light)?.lightness ?? 100

// 轨道中点灰度：需要固定起始位置的调用方（如背景模糊度卡）用它让亮暗主题从同一点出发。
export const glassBackgroundGrayMidpoint = (glassBackgroundGrayDark + glassBackgroundGrayLight) / 2

// 条纹 stop 用 rgb() 输出：FrostedSurface 的背景采样只解析 hex 与 rgb()，不识别 hsl()。
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

export function getGlassPreviewBackground(gray: number): CSSProperties {
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
