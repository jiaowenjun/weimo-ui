import {
  borderColorToneMap,
  borderColorTones,
  getBorderColorClassName,
  getBorderColorToken,
  type BorderColorTone,
} from '../../components/border-color'
import {
  borderRadiusScaleMap,
  borderRadiusScales,
  getBorderRadiusToken,
  getBorderRadiusValue,
} from '../../components/border-radius'
import { TokenPreviewCard } from '../../components/token-preview-card'
import type { ComponentDefinition } from '../component-docs'

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

const borderColorToneOrder = [
  'default',
  'disable',
  'divider',
  'emphasis',
  'accent',
  'danger',
] as const

const borderColorSearchAliases = borderColorTones.flatMap((tone) => {
  const item = borderColorToneMap[tone]
  const contexts = borderContextTokens[tone] ?? []

  return [
    'BorderColor',
    '边框色',
    tone,
    item.label,
    item.token,
    item.description,
    item.uiUsage,
    item.bijiUsage,
    ...contexts.flatMap((context) => [context.label, context.token]),
  ]
})

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function BorderColorPreview() {
  return (
    <>
      <h2 className="token-preview-card-demo__category">圆角</h2>

      {borderRadiusScales.map((scale) => {
        const item = borderRadiusScaleMap[scale]

        return (
          <TokenPreviewCard
            key={scale}
            label={item.label}
            token={getBorderRadiusToken(scale)}
            value={getBorderRadiusValue(scale)}
          >
            <div
              className="border-radius-preview__sample"
              style={{ borderRadius: `var(${getBorderRadiusToken(scale)})` }}
              aria-hidden="true"
            />
          </TokenPreviewCard>
        )
      })}

      <h2 className="token-preview-card-demo__category">边框色</h2>

      <TokenPreviewCard
        items={borderColorToneOrder.map((tone) => ({
          darkValue: borderColorToneMap[tone].value.dark,
          token: getBorderColorToken(tone),
          value: borderColorToneMap[tone].value.light,
        }))}
        label="边框色"
      >
        <div aria-hidden="true" className="border-color-preview__samples">
          {borderColorToneOrder.map((tone) => (
            <div
              className={`border-color-preview__sample ${getBorderColorClassName(tone)}`}
              key={tone}
            />
          ))}
        </div>
      </TokenPreviewCard>
    </>
  )
}

export const borderColorDefinition = {
  id: 'border-color',
  status: 'Ready',
  frame: 'plain',
  searchAliases: borderColorSearchAliases.concat(
    borderRadiusScales.flatMap((scale) => {
      const item = borderRadiusScaleMap[scale]

      return ['BorderRadius', '边框圆角', '圆角', scale, item.label, item.token, item.description, item.uiUsage, item.bijiUsage]
    }),
  ),
  preview: () => <BorderColorPreview />,
} satisfies ComponentDefinition
