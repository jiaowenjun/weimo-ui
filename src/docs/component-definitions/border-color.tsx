import { useEffect, useState } from 'react'

import {
  borderColorToneMap,
  borderColorTones,
  getBorderColorClassName,
  getBorderColorToken,
  type BorderColorTone,
} from '../../components/border-color'
import { CardPanel } from '../../components/coss/card'
import type { ComponentDefinition } from '../component-docs'

function parseColorLightness(value: string): number | null {
  const hsl = value.match(/^hsl\(\s*[\d.]+\s+[\d.]+%\s+([\d.]+)%\s*\)/)

  if (hsl) {
    return Number(hsl[1])
  }

  const hex = value.match(/^#([0-9a-f]{6})$/i)

  if (hex) {
    const [r, g, b] = [0, 2, 4].map((offset) => parseInt(hex[1].slice(offset, offset + 2), 16))

    return (Math.max(r, g, b) + Math.min(r, g, b)) / 2 / 2.55
  }

  return null
}

function toneBrightness(tone: BorderColorTone, isDark: boolean): number {
  const value = isDark
    ? borderColorToneMap[tone].value.dark
    : borderColorToneMap[tone].value.light

  return parseColorLightness(value) ?? 0
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

function BorderColorPreview() {
  const isDark = useIsDarkTheme()
  const orderedTones = [...borderColorTones].sort(
    (a, b) => toneBrightness(b, isDark) - toneBrightness(a, isDark),
  )

  return (
    <div className="border-color-preview" aria-label="边框色档位预览（按亮度排序）">
      {orderedTones.map((tone) => {
        const item = borderColorToneMap[tone]

        return (
          <CardPanel className="border-color-preview__panel" key={tone}>
            <div className="border-color-preview__meta">
              <span className="border-color-preview__label">{item.label}</span>
              <code className="border-color-preview__token">
                {getBorderColorToken(tone)}:{' '}
                <span className="border-color-preview__token-value--light">{item.value.light}</span>
                <span className="border-color-preview__token-value--dark">{item.value.dark}</span>
              </code>
            </div>
            <div
              className={`border-color-preview__sample ${getBorderColorClassName(tone)}`}
              aria-hidden="true"
            />
          </CardPanel>
        )
      })}
    </div>
  )
}

export const borderColorDefinition = {
  id: 'border-color',
  status: 'Ready',
  frame: 'plain',
  preview: () => <BorderColorPreview />,
} satisfies ComponentDefinition
