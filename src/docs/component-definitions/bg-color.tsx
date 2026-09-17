import { useEffect, useState } from 'react'

import {
  bgColorToneMap,
  getBgColorClassName,
  getBgColorToken,
  type BgColorTone,
} from '../../components/bg-color'
import { CardPanel } from '../../components/coss/card'
import type { ComponentDefinition } from '../component-docs'

const bgColorPreviewTones = [
  'page',
  'card',
  'raised',
  'primary',
  'hover',
  'hover-on-hover',
  'selected',
  'chip',
  'selection',
  'share-card',
  'share-card-tag-mask',
] as const satisfies readonly BgColorTone[]

function hasTransparentBgColorValue(tone: { value: { light: string; dark: string } }) {
  const slashAlphaPattern = /\/\s*(?:0?\.\d+|[1-9]\d?%)/

  return [tone.value.light, tone.value.dark].some(
    (value) => value.includes('rgba(') || value.includes('hsla(') || slashAlphaPattern.test(value),
  )
}

function parseColorLightness(value: string): { lightness: number; alpha: number } | null {
  const hsl = value.match(/^hsl\(\s*[\d.]+\s+[\d.]+%\s+([\d.]+)%(?:\s*\/\s*([\d.]+))?\s*\)/)

  if (hsl) {
    return { lightness: Number(hsl[1]), alpha: hsl[2] === undefined ? 1 : Number(hsl[2]) }
  }

  const hex = value.match(/^#([0-9a-f]{6})$/i)

  if (hex) {
    const [r, g, b] = [0, 2, 4].map((offset) => parseInt(hex[1].slice(offset, offset + 2), 16))

    return { lightness: (Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 2.55, alpha: 1 }
  }

  return null
}

function toneBrightness(tone: BgColorTone, isDark: boolean): number {
  const color = parseColorLightness(isDark ? bgColorToneMap[tone].value.dark : bgColorToneMap[tone].value.light)

  if (!color) {
    return 0
  }

  if (color.alpha >= 1) {
    return color.lightness
  }

  const base = parseColorLightness(
    isDark ? bgColorToneMap.raised.value.dark : bgColorToneMap.raised.value.light,
  )
  const baseLightness = base?.lightness ?? (isDark ? 15 : 94)

  return color.alpha * color.lightness + (1 - color.alpha) * baseLightness
}

function useIsDarkTheme() {
  const [isDark, setIsDark] = useState(() =>
    typeof document === 'undefined' ? false : document.documentElement.classList.contains('dark'),
  )

  useEffect(() => {
    const root = document.documentElement
    const sync = () => {
      setIsDark(root.classList.contains('dark'))
    }

    sync()

    const observer = new MutationObserver(sync)

    observer.observe(root, { attributes: true, attributeFilter: ['class'] })

    return () => observer.disconnect()
  }, [])

  return isDark
}

function BgColorPreview() {
  const isDark = useIsDarkTheme()
  const orderedTones = [...bgColorPreviewTones].sort(
    (a, b) => toneBrightness(b, isDark) - toneBrightness(a, isDark),
  )

  return (
    <div className="bg-color-preview" aria-label="背景色档位预览（按亮度排序）">
      {orderedTones.map((tone) => {
        const item = bgColorToneMap[tone]
        const isTransparent = hasTransparentBgColorValue(item)

        return (
          <CardPanel className="bg-color-preview__panel" key={tone}>
            <div className="bg-color-preview__meta">
              <span className="bg-color-preview__label">{item.label}</span>
              <code className="bg-color-preview__token">
                {getBgColorToken(tone)}:{' '}
                <span className="bg-color-preview__token-value--light">{item.value.light}</span>
                <span className="bg-color-preview__token-value--dark">{item.value.dark}</span>
              </code>
            </div>
            <div className="bg-color-preview__sample" aria-hidden="true">
              {isTransparent ? <span className="bg-color-preview__sample-backdrop" /> : null}
              <span
                className={[
                  'bg-color-preview__sample-fill',
                  isTransparent ? 'bg-color-preview__sample-fill--framed' : '',
                  getBgColorClassName(tone),
                ]
                  .filter(Boolean)
                  .join(' ')}
              />
            </div>
          </CardPanel>
        )
      })}
    </div>
  )
}

export const bgColorDefinition = {
  id: 'bg-color',
  status: 'Ready',
  frame: 'plain',
  preview: () => <BgColorPreview />,
} satisfies ComponentDefinition
