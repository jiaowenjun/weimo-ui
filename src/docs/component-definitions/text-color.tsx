import {
  textColorToneMap,
  textColorTones,
  getTextColorClassName,
  getTextColorToken,
} from '../../components/text-color'
import type { ComponentDefinition } from '../component-docs'
import { sortByThemeLightness, useIsDarkTheme } from '../token-preview-color'
import { TokenPreviewCard } from '../token-preview-card'

const previewTextColorTones = textColorTones.filter((tone) => tone !== 'inherit')

function TextColorPreview() {
  const isDark = useIsDarkTheme()
  const orderedTones = sortByThemeLightness(
    previewTextColorTones,
    (tone) => textColorToneMap[tone].value,
    isDark,
    isDark ? 12 : 100,
  )

  return (
    <>
      {orderedTones.map((tone) => {
        const item = textColorToneMap[tone]

        return (
          <TokenPreviewCard
            darkValue={item.value.dark}
            key={tone}
            label={item.label}
            token={getTextColorToken(tone)}
            value={item.value.light}
          >
            <p className={`text-color-preview__sample ${getTextColorClassName(tone)}`} aria-hidden="true">
              Aa
            </p>
          </TokenPreviewCard>
        )
      })}
    </>
  )
}

export const textColorDefinition = {
  id: 'text-color',
  status: 'Ready',
  frame: 'plain',
  searchAliases: previewTextColorTones.flatMap((tone) => {
    const item = textColorToneMap[tone]

    return ['TextColor', tone, item.label, item.token, item.description]
  }),
  preview: () => <TextColorPreview />,
} satisfies ComponentDefinition
