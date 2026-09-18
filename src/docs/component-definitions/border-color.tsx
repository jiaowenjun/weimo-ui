import {
  borderColorToneMap,
  borderColorTones,
  getBorderColorClassName,
  getBorderColorToken,
  type BorderColorTone,
} from '../../components/border-color'
import type { ComponentDefinition } from '../component-docs'
import { sortByThemeLightness, useIsDarkTheme } from '../token-preview-color'
import { TokenPreviewCard } from '../token-preview-card'

type BorderContextToken = {
  label: string
  token: string
}

const borderContextTokens: Partial<Record<BorderColorTone, readonly BorderContextToken[]>> = {
  disable: [
    {
      label: '亮背景',
      token: '--color-border-disable-on-light',
    },
    {
      label: '暗背景',
      token: '--color-border-disable-on-dark',
    },
  ],
  divider: [
    {
      label: '主题默认',
      token: '--color-border-divider-menu',
    },
    {
      label: '亮背景',
      token: '--color-border-divider-menu-on-light',
    },
    {
      label: '暗背景',
      token: '--color-border-divider-menu-on-dark',
    },
  ],
  default: [
    { label: '主题默认', token: '--glass-surface-border' },
    { label: '亮背景', token: '--glass-surface-light-border' },
    { label: '暗背景', token: '--glass-surface-dark-border' },
  ],
}

const borderColorSearchAliases = borderColorTones.flatMap((tone) => {
  const item = borderColorToneMap[tone]
  const contexts = borderContextTokens[tone] ?? []

  return [
    'BorderColor',
    tone,
    item.label,
    item.token,
    item.description,
    item.uiUsage,
    item.bijiUsage,
    ...contexts.flatMap((context) => [context.label, context.token]),
  ]
})

function BorderColorPreview() {
  const isDark = useIsDarkTheme()
  const orderedTones = sortByThemeLightness(
    borderColorTones,
    (tone) => borderColorToneMap[tone].value,
    isDark,
    isDark ? 0 : 100,
  )

  return (
    <>
      {orderedTones.map((tone) => {
        const item = borderColorToneMap[tone]

        return (
          <TokenPreviewCard
            darkValue={item.value.dark}
            key={tone}
            label={item.label}
            token={getBorderColorToken(tone)}
            value={item.value.light}
          >
            <div
              className={`border-color-preview__sample ${getBorderColorClassName(tone)}`}
              aria-hidden="true"
            />
          </TokenPreviewCard>
        )
      })}
    </>
  )
}

export const borderColorDefinition = {
  id: 'border-color',
  status: 'Ready',
  frame: 'plain',
  searchAliases: borderColorSearchAliases,
  preview: () => <BorderColorPreview />,
} satisfies ComponentDefinition
