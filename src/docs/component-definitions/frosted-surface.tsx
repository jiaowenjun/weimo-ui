import { useState } from 'react'

import {
  FrostedSurface,
  useFrostedSurfaceBackgroundToneRef,
} from '../../components/frosted-surface'
import { borderColorToneMap } from '../../components/border-color'
import { textColorToneMap } from '../../components/text-color'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'
import { parseColorLightness } from '../token-preview-color'

// 磨砂材质演示页:只展示有边框变体(无边框变体见材质总览页的切换开关)。
// 探针元素包住瓦片并交给采样 hook——采样排除探针自身与子树后读到的正是
// 材质背后的画布条纹,读数与 FrostedSurface 内部 data-background-tone
// 来自同一条采样管线;标题栏按因果序实时显示滑块位置值(灰度)、感知亮度
// (WCAG 相对亮度,阈值 0.5 翻转 tone)与边框色值。
// 本页瓦片文字色由 tone 映射标准文字 token 的两个主题值(亮背景取
// --color-text-primary 亮主题值,暗背景取暗主题值;说明文字同理用 secondary);
// 边框色亮度随感知亮度两段平滑递增,端点固定为 border/primary 的暗暗亮亮四态
// (20%→98% 与 9%→90%),与站点主题无关。色值均来自 TS 镜像链并经 inline style
// 注入,与读数显示同一字符串。
// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function FrostedSurfaceDemo() {
  const { backgroundLuminance, backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLDivElement>(true)
  const [sliderGray, setSliderGray] = useState<number | null>(null)
  const foregroundColor =
    backgroundTone == null ? null : textColorToneMap.primary.value[backgroundTone]
  const secondaryColor =
    backgroundTone == null ? null : textColorToneMap.secondary.value[backgroundTone]
  const borderColor = interpolateBorderColor(backgroundLuminance)

  return (
    <GlassPreviewCard
      action={
        <span className="frosted-surface-docs__reading">
          {`滑块 ${sliderGray ?? '…'}`}
          <span aria-hidden="true" className="frosted-surface-docs__reading-separator">
            ·
          </span>
          {backgroundLuminance == null
            ? '采样中…'
            : `感知亮度 ${(backgroundLuminance * 100).toFixed(1)}% · ${
                backgroundTone === 'light' ? '亮' : '暗'
              }`}
          <span aria-hidden="true" className="frosted-surface-docs__reading-separator">
            ·
          </span>
          <span
            aria-hidden="true"
            className="frosted-surface-docs__swatch"
            style={borderColor ? { backgroundColor: borderColor } : undefined}
          />
          {`边框 ${borderColor ?? '…'}`}
        </span>
      }
      label="磨砂材质"
      onGrayChange={setSliderGray}
    >
      <div className="frosted-surface-docs__probe" ref={setElementRef}>
        <FrostedSurface
          bordered
          className="frosted-surface-preview__tile"
          style={{
            borderColor: borderColor ?? undefined,
            color: foregroundColor ?? undefined,
          }}
        >
          <span className="frosted-surface-preview__title">Frosted Surface</span>
          <span
            className="frosted-surface-preview__meta"
            style={secondaryColor ? { color: secondaryColor } : undefined}
          >
            有边框变体,颜色随感知亮度自适应
          </span>
        </FrostedSurface>
      </div>
    </GlassPreviewCard>
  )
}

// 边框亮度随感知亮度两段平滑递增,端点固定与站点主题无关:0~50% 从 --color-border
// 暗主题值(20%)到 --color-text-primary 暗主题值(98%),50%~100% 从
// --color-text-primary 亮主题值(9%)到 --color-border 亮主题值(90%)。50% 恰是
// tone 翻转点,边框与文字色同处 98%→9% 跳变,由组件的 border-color 160ms 过渡
// 柔化。涉及的 token 全是零饱和度灰,lightness 域插值与颜色插值等价,输出保持
// hsl token 形态。
function interpolateBorderColor(luminance: number | null) {
  if (luminance == null) {
    return null
  }

  const borderOnDarkLightness = parseColorLightness(
    borderColorToneMap.default.value.dark,
  )?.lightness
  const borderOnLightLightness = parseColorLightness(
    borderColorToneMap.default.value.light,
  )?.lightness
  const darkForegroundLightness = parseColorLightness(
    textColorToneMap.primary.value.dark,
  )?.lightness
  const lightForegroundLightness = parseColorLightness(
    textColorToneMap.primary.value.light,
  )?.lightness

  if (
    borderOnDarkLightness == null ||
    borderOnLightLightness == null ||
    darkForegroundLightness == null ||
    lightForegroundLightness == null
  ) {
    return null
  }

  const progress = Math.min(Math.max(luminance, 0), 1)
  const [fromLightness, toLightness, phase] =
    progress < 0.5
      ? [borderOnDarkLightness, darkForegroundLightness, progress / 0.5]
      : [lightForegroundLightness, borderOnLightLightness, (progress - 0.5) / 0.5]
  const lightness = fromLightness + (toLightness - fromLightness) * phase

  return `hsl(0 0% ${lightness.toFixed(1)}%)`
}

export const frostedSurfaceDefinition = {
  id: 'frosted-surface',
  summary:
    '磨砂玻璃层:随滑块背景实时回传感知亮度,文字取标准文字色,边框亮度随亮度插值',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'FrostedSurface',
    '磨砂材质',
    '磨砂',
    '感知亮度',
    '背景亮度',
    '亮度',
    '文字前景色',
    '前景色',
    '边框色',
    '插值',
    '--color-text-primary',
    '--color-text-secondary',
    '--color-border',
    'luminance',
    'relative luminance',
    'tone',
    'data-background-tone',
    'bordered',
    '有边框',
    '边框',
    '--glass-blur',
    '--glass-surface-fg',
    '--glass-surface-border',
  ],
  preview: () => <FrostedSurfaceDemo />,
} satisfies ComponentDefinition
