import { useState } from 'react'

import {
  FrostedSurface,
  useFrostedSurfaceBackgroundToneRef,
} from '../../components/frosted-surface'
import { interpolateFrostedBorderColor } from '../../components/frosted-surface-model'
import { textColorToneMap } from '../../components/text-color'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'

// 磨砂材质演示页:只展示有边框变体(无边框变体见材质总览页的切换开关)。
// 探针元素包住瓦片并交给采样 hook——采样排除探针自身与子树后读到的正是
// 材质背后的画布条纹,读数与 FrostedSurface 内部 data-background-tone
// 来自同一条采样管线;标题栏按因果序实时显示滑块位置值(灰度)、感知亮度
// (WCAG 相对亮度,阈值 0.5 翻转 tone)及其反变换的等效 RGB 灰度值,与边框色值。
// 本页瓦片文字色由 tone 映射标准文字 token 的两个主题值(亮背景取
// --color-text-primary 亮主题值,暗背景取暗主题值;说明文字同理用 secondary);
// 边框色亮度随感知亮度两段平滑递增(20%→98% 与 9%→90%,与站点主题无关)——
// 这是所有磨砂材质共享的组件层行为(interpolateFrostedBorderColor),本页
// 读数与瓦片注入调用同一函数。色值经 inline style 注入,与读数显示同一字符串。
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
  const borderColor = interpolateFrostedBorderColor(backgroundLuminance)
  const perceivedRgbGray =
    backgroundLuminance == null
      ? null
      : Math.round(luminanceToSrgbGrayChannel(backgroundLuminance) * 255)

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
            : `感知亮度 ${(backgroundLuminance * 100).toFixed(1)}% · RGB ${perceivedRgbGray} · ${
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

// WCAG 相对亮度(线性光)反变换回 sRGB 传递函数,得到等效中性灰的通道值(0~1):
// 感知亮度与 RGB 值的差异正是 sRGB gamma——63.4% 的感知亮度对应 RGB 207。
function luminanceToSrgbGrayChannel(luminance: number) {
  return luminance <= 0.0031308
    ? 12.92 * luminance
    : 1.055 * luminance ** (1 / 2.4) - 0.055
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
