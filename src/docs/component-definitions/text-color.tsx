import {
  textColorToneMap,
  textColorTones,
  getTextColorClassName,
  getTextColorToken,
} from '../../components/text-color'
import { CardPanel } from '../../components/coss/card'
import type { ComponentDefinition } from '../component-docs'
import { sortByThemeLightness, useIsDarkTheme } from '../token-preview-color'

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
  searchAliases: previewTextColorTones.flatMap((tone) => {
    const item = textColorToneMap[tone]

    return ['TextColor', tone, item.label, item.token, item.description]
  }),
  preview: () => <TextColorPreview />,
} satisfies ComponentDefinition
