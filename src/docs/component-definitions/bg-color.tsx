import {
  bgColorToneMap,
  getBgColorClassName,
  getBgColorToken,
  type BgColorTone,
} from '../../components/bg-color'
import type { ComponentDefinition } from '../component-docs'
import { sortByThemeLightness, useIsDarkTheme } from '../token-preview-color'
import { TokenPreviewCard } from '../token-preview-card'

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

function BgColorPreview() {
  const isDark = useIsDarkTheme()
  const orderedTones = sortByThemeLightness(
    bgColorPreviewTones,
    (tone) => bgColorToneMap[tone].value,
    isDark,
    isDark ? 15 : 94,
  )

  return (
    <>
      {orderedTones.map((tone) => {
        const item = bgColorToneMap[tone]
        const isTransparent = hasTransparentBgColorValue(item)

        return (
          <TokenPreviewCard
            darkValue={item.value.dark}
            key={tone}
            label={item.label}
            token={getBgColorToken(tone)}
            value={item.value.light}
          >
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
          </TokenPreviewCard>
        )
      })}
    </>
  )
}

export const bgColorDefinition = {
  id: 'bg-color',
  status: 'Ready',
  frame: 'plain',
  searchAliases: bgColorPreviewTones.flatMap((tone) => {
    const item = bgColorToneMap[tone]

    return ['BgColor', tone, item.label, item.token, item.description, item.uiUsage, item.bijiUsage]
  }),
  preview: () => <BgColorPreview />,
} satisfies ComponentDefinition
