import {
  borderColorToneMap,
  borderColorTones,
  getBorderColorClassName,
  getBorderColorToken,
} from '../../components/border-color'
import type { ComponentDefinition } from '../component-docs'

const borderColorDisableContextTokens = [
  {
    label: '亮背景:',
    token: '--color-border-disable-on-light',
    value: borderColorToneMap.disable.value.light,
  },
  {
    label: '暗背景:',
    token: '--color-border-disable-on-dark',
    value: borderColorToneMap.disable.value.dark,
  },
] as const

const borderColorGlassSurfaceTokens = [
  {
    label: '主题默认:',
    token: '--glass-surface-border',
    value: `${borderColorToneMap.default.value.light} / ${borderColorToneMap.default.value.dark}`,
  },
  {
    label: '亮背景:',
    token: '--glass-surface-light-border',
    value: borderColorToneMap.default.value.light,
  },
  {
    label: '暗背景:',
    token: '--glass-surface-dark-border',
    value: borderColorToneMap.default.value.dark,
  },
] as const

const borderColorMenuSeparatorTokens = [
  {
    label: '主题默认 / Menu:',
    token: '--color-border-divider-menu',
    value: `${borderColorToneMap.divider.value.light} / ${borderColorToneMap.divider.value.dark}`,
  },
  {
    label: '亮背景 / Menu:',
    token: '--color-border-divider-menu-on-light',
    value: borderColorToneMap.divider.value.light,
  },
  {
    label: '暗背景 / Menu:',
    token: '--color-border-divider-menu-on-dark',
    value: borderColorToneMap.divider.value.dark,
  },
] as const

export const borderColorDefinition = {
  id: 'border-color',
  summary: '统一边框色 utility 和 tone map，汇总 weimo-ui 与 biji-react 的边框/轮廓色档位',
  status: 'Ready',
  props: [
    {
      name: 'borderColorTones',
      type: 'BorderColorTone[]',
      defaultValue: "['disable', 'divider', 'default', 'emphasis', 'accent', ...]",
    },
    {
      name: 'borderColorToneMap',
      type: 'Record<BorderColorTone, { label; token; value: { light; dark }; className; description; uiUsage; bijiUsage }>',
      defaultValue: '-',
    },
    {
      name: 'getBorderColorClassName(tone)',
      type: '(tone: BorderColorTone) => string',
      defaultValue: '-',
    },
    {
      name: 'getBorderColorToken(tone)',
      type: '(tone: BorderColorTone) => string',
      defaultValue: '-',
    },
  ],
  preview: () => (
    <div className="border-color-preview" aria-label="BorderColor 边框色档位预览">
      {borderColorTones.map((tone) => {
        const item = borderColorToneMap[tone]
        const token = getBorderColorToken(tone)

        return (
          <div className="border-color-preview__row" key={tone}>
            <div className="border-color-preview__sample-wrap">
              <div
                className={`border-color-preview__sample ${getBorderColorClassName(tone)}`}
                aria-hidden="true"
              />
            </div>
            <div className="border-color-preview__identity">
              <div className="border-color-preview__meta">
                <span className="border-color-preview__label">{item.label}</span>
                <span className="border-color-preview__tone">{tone}</span>
              </div>
              <code className="border-color-preview__token">{token}</code>
              <code className="border-color-preview__value">
                <span>亮: {item.value.light}</span>
                <span>暗: {item.value.dark}</span>
              </code>
              {tone === 'disable' ? (
                <div className="border-color-preview__context-tokens" aria-label="禁用边框背景感知 token">
                  {borderColorDisableContextTokens.map((contextToken) => (
                    <code className="border-color-preview__context-token" key={contextToken.token}>
                      <span>{contextToken.label} {contextToken.value}</span>
                      <span>{contextToken.token}</span>
                    </code>
                  ))}
                </div>
              ) : null}
              {tone === 'divider' ? (
                <div className="border-color-preview__context-tokens" aria-label="Menu separator 背景感知 divider token">
                  {borderColorMenuSeparatorTokens.map((contextToken) => (
                    <code className="border-color-preview__context-token" key={`${contextToken.label}-${contextToken.token}`}>
                      <span>{contextToken.label} {contextToken.value}</span>
                      <span>{contextToken.token}</span>
                    </code>
                  ))}
                </div>
              ) : null}
              {tone === 'default' ? (
                <div className="border-color-preview__context-tokens" aria-label="GlassSurface 背景感知边框 token">
                  {borderColorGlassSurfaceTokens.map((contextToken) => (
                    <code className="border-color-preview__context-token" key={`${contextToken.label}-${contextToken.token}`}>
                      <span>{contextToken.label} {contextToken.value}</span>
                      <span>{contextToken.token}</span>
                    </code>
                  ))}
                </div>
              ) : null}
            </div>
            <div className="border-color-preview__description">
              <p>{item.description}</p>
              <span>ui: {item.uiUsage}</span>
              <span>biji-react: {item.bijiUsage}</span>
            </div>
          </div>
        )
      })}
    </div>
  ),
} satisfies ComponentDefinition
