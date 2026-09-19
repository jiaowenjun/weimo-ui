import { describe, expect, it } from 'vitest'

import { bgColorToneMap, type BgColorTone } from '../src/components/bg-color'
import { borderColorToneMap, borderColorTones } from '../src/components/border-color'
import { textColorToneMap, type TextColorTone } from '../src/components/text-color'
import {
  effectiveColorLightness,
  parseColorLightness,
  sortByThemeLightness,
} from '../src/docs/token-preview-color'

describe('token preview color ordering', () => {
  it('parses the CSS color formats used by token maps', () => {
    expect(parseColorLightness('hsl(0 0% 28% / 0.72)')).toEqual({ lightness: 28, alpha: 0.72 })
    expect(parseColorLightness('rgb(255 255 255 / 26%)')).toEqual({ lightness: 100, alpha: 0.26 })
    expect(parseColorLightness('rgba(202, 84, 33, 0.2)')).toMatchObject({ alpha: 0.2 })
    expect(parseColorLightness('#ffffff')).toEqual({ lightness: 100, alpha: 1 })
    expect(effectiveColorLightness('rgb(0 0 0 / 0.25)', 100)).toBe(75)
  })

  it('orders background colors against the current theme surface', () => {
    const tones: BgColorTone[] = ['page', 'card', 'primary', 'selection', 'chip']
    const colorFor = (tone: BgColorTone) => bgColorToneMap[tone].value

    expect(sortByThemeLightness(tones, colorFor, false, 94)).toEqual([
      'card', 'page', 'chip', 'selection', 'primary',
    ])
    expect(sortByThemeLightness(tones, colorFor, true, 15)).toEqual([
      'primary', 'selection', 'chip', 'card', 'page',
    ])
  })

  it('orders text and border tones independently in light and dark themes', () => {
    const textTones: TextColorTone[] = ['primary', 'secondary', 'placeholder', 'disable', 'danger']
    const textColorFor = (tone: TextColorTone) => textColorToneMap[tone].value

    expect(sortByThemeLightness(textTones, textColorFor, false, 100)).toEqual([
      'placeholder', 'disable', 'danger', 'secondary', 'primary',
    ])
    expect(sortByThemeLightness(textTones, textColorFor, true, 12)).toEqual([
      'primary', 'danger', 'secondary', 'disable', 'placeholder',
    ])

    const borderColorFor = (tone: (typeof borderColorTones)[number]) => borderColorToneMap[tone].value
    expect(sortByThemeLightness(borderColorTones, borderColorFor, false, 100)).toEqual([
      'disable', 'default', 'divider', 'emphasis', 'danger', 'accent',
    ])
    expect(sortByThemeLightness(borderColorTones, borderColorFor, true, 0)).toEqual([
      'accent', 'danger', 'emphasis', 'divider', 'disable', 'default',
    ])
  })
})
