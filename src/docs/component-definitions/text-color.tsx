import { useEffect, useState } from 'react'

import {
  textColorToneMap,
  textColorTones,
  getTextColorClassName,
  getTextColorToken,
  type TextColorTone,
} from '../../components/text-color'
import { CardPanel } from '../../components/coss/card'
import type { ComponentDefinition } from '../component-docs'

const previewTextColorTones = textColorTones.filter((tone) => tone !== 'inherit')

function parseColorLightness(value: string): { lightness: number; alpha: number } | null {
  const hsl = value.match(/^hsl\(\s*[\d.]+\s+[\d.]+%\s+([\d.]+)%(?:\s*\/\s*([\d.]+%?))?\s*\)/)

  if (hsl) {
    const alpha = hsl[2] === undefined ? 1 : hsl[2].endsWith('%') ? Number(hsl[2].slice(0, -1)) / 100 : Number(hsl[2])

    return { lightness: Number(hsl[1]), alpha }
  }

  const rgb = value.match(/^rgb\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+%?))?\s*\)/)

  if (rgb) {
    const channels = [Number(rgb[1]), Number(rgb[2]), Number(rgb[3])]
    const alpha = rgb[4] === undefined ? 1 : rgb[4].endsWith('%') ? Number(rgb[4].slice(0, -1)) / 100 : Number(rgb[4])

    return {
      lightness: (Math.max(...channels) + Math.min(...channels)) / 2 / 2.55,
      alpha,
    }
  }

  const hex = value.match(/^#([0-9a-f]{6})$/i)

  if (hex) {
    const [r, g, b] = [0, 2, 4].map((offset) => parseInt(hex[1].slice(offset, offset + 2), 16))

    return { lightness: (Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 2.55, alpha: 1 }
  }

  return null
}

function toneTextBrightness(tone: TextColorTone, isDark: boolean): number {
  const color = parseColorLightness(
    isDark ? textColorToneMap[tone].value.dark : textColorToneMap[tone].value.light,
  )

  if (!color) {
    return 0
  }

  if (color.alpha >= 1) {
    return color.lightness
  }

  const cardBaseLightness = isDark ? 12 : 100

  return color.alpha * color.lightness + (1 - color.alpha) * cardBaseLightness
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

function TextColorPreview() {
  const isDark = useIsDarkTheme()
  const orderedTones = [...previewTextColorTones].sort(
    (a, b) => toneTextBrightness(b, isDark) - toneTextBrightness(a, isDark),
  )

  return (
    <div className="text-color-preview" aria-label="字色档位预览（按亮度排序）">
      {orderedTones.map((tone) => {
        const item = textColorToneMap[tone]

        return (
          <CardPanel className="text-color-preview__panel" key={tone}>
            <div className="text-color-preview__meta">
              <span className="text-color-preview__label">{item.label}</span>
              <code className="text-color-preview__token">
                {getTextColorToken(tone)}:{' '}
                <span className="text-color-preview__token-value--light">{item.value.light}</span>
                <span className="text-color-preview__token-value--dark">{item.value.dark}</span>
              </code>
            </div>
            <p className={`text-color-preview__sample ${getTextColorClassName(tone)}`} aria-hidden="true">
              Aa
            </p>
          </CardPanel>
        )
      })}
    </div>
  )
}

export const textColorDefinition = {
  id: 'text-color',
  status: 'Ready',
  frame: 'plain',
  preview: () => <TextColorPreview />,
} satisfies ComponentDefinition
