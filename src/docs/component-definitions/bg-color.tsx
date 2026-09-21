import { Fragment } from 'react'

import {
  bgBlurToneMap,
  bgBlurTones,
  getBgBlurBlurToken,
  getBgBlurBlurValue,
  getBgBlurClassName,
} from '../../components/bg-blur'
import {
  bgColorToneMap,
  getBgColorClassName,
  getBgColorToken,
  type BgColorTone,
} from '../../components/bg-color'
import {
  getHeatColorClassName,
  getHeatColorToken,
  heatColorLevels,
  heatColorMap,
} from '../../components/heat-color'
import { pressableToneMap, pressableTones } from '../../components/pressable'
import { TokenPreviewCard } from '../../components/token-preview-card'
import type { ComponentDefinition } from '../component-docs'
import { sortByThemeLightness, useIsDarkTheme } from '../token-preview-color'

const bgColorPreviewGroups = [
  {
    label: '基础表面',
    tones: ['page', 'card', 'raised'],
  },
  {
    label: '动作与反馈',
    tones: ['primary', 'hover', 'hover-on-hover'],
  },
  {
    label: '组件状态',
    tones: ['selected', 'chip'],
  },
] as const satisfies readonly {
  label: string
  tones: readonly BgColorTone[]
}[]

const bgColorPreviewTones = bgColorPreviewGroups.flatMap(({ tones }) => tones)

function hasTransparentBgColorValue(tone: { value: { light: string; dark: string } }) {
  const slashAlphaPattern = /\/\s*(?:0?\.\d+|[1-9]\d?%)/

  return [tone.value.light, tone.value.dark].some(
    (value) => value.includes('rgba(') || value.includes('hsla(') || slashAlphaPattern.test(value),
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function BgColorPreview() {
  const isDark = useIsDarkTheme()
  const pressableFeedback = pressableToneMap.feedback

  return (
    <>
      {bgColorPreviewGroups.map((group) => {
        const orderedTones = sortByThemeLightness(
          group.tones,
          (tone) => bgColorToneMap[tone].value,
          isDark,
          isDark ? 15 : 94,
        )

        return (
          <Fragment key={group.label}>
            <h2 className="token-preview-card-demo__category">{group.label}</h2>

            {orderedTones.map((tone) => {
              const item = bgColorToneMap[tone]
              const isTransparent = hasTransparentBgColorValue(item)

              return (
                <TokenPreviewCard
                  darkValue={item.value.dark}
                  key={tone}
                  label={
                    tone === pressableFeedback.bgColorTone
                      ? `${item.label} / ${pressableFeedback.label}`
                      : item.label
                  }
                  token={getBgColorToken(tone)}
                  value={item.value.light}
                >
                  {tone === pressableFeedback.bgColorTone ? (
                    <button type="button" className="pressable-preview__sample">
                      悬停 / 按压查看反馈色
                    </button>
                  ) : isTransparent ? (
                    <div
                      className="token-preview-card__surface-preview"
                      aria-hidden="true"
                    >
                      <span className="token-preview-card__surface-backdrop" />
                      <span
                        className={`token-preview-card__surface ${getBgColorClassName(tone)}`}
                      />
                    </div>
                  ) : (
                    <div className="bg-color-preview__sample" aria-hidden="true">
                      <span
                        className={`bg-color-preview__sample-fill ${getBgColorClassName(tone)}`}
                      />
                    </div>
                  )}
                </TokenPreviewCard>
              )
            })}
          </Fragment>
        )
      })}

      <h2 className="token-preview-card-demo__category">背景模糊度</h2>

      {bgBlurTones.map((tone) => {
        const item = bgBlurToneMap[tone]

        return (
          <TokenPreviewCard
            key={tone}
            label={item.label}
            token={getBgBlurBlurToken(tone)}
            value={getBgBlurBlurValue(tone)}
          >
            <div className="token-preview-card__surface-preview" aria-hidden="true">
              <span className="token-preview-card__surface-backdrop" />
              <span className={`token-preview-card__surface ${getBgBlurClassName(tone)}`} />
            </div>
          </TokenPreviewCard>
        )
      })}

      <TokenPreviewCard
        items={heatColorLevels.map((level) => {
          const item = heatColorMap[level]

          return {
            darkValue: item.value.dark,
            token: getHeatColorToken(level),
            value: item.value.light,
          }
        })}
        label="热力图"
      >
        <div aria-hidden="true" className="heat-color-preview__group">
          {heatColorLevels.map((level) => (
            <span
              className={`heat-color-preview__swatch ${getHeatColorClassName(level)}`}
              key={level}
            />
          ))}
        </div>
      </TokenPreviewCard>
    </>
  )
}

export const bgColorDefinition = {
  id: 'bg-color',
  status: 'Ready',
  frame: 'plain',
  searchAliases: bgColorPreviewTones.flatMap((tone) => {
    const item = bgColorToneMap[tone]

    return ['BgColor', '背景', '背景色', tone, item.label, item.token, item.description, item.uiUsage, item.bijiUsage]
  }).concat(
    pressableTones.flatMap((tone) => {
      const item = pressableToneMap[tone]

      return ['Pressable', tone, item.label, item.description, item.uiUsage, item.bijiUsage]
    }),
    heatColorLevels.flatMap((level) => {
      const item = heatColorMap[level]

      return ['HeatColor', `level ${level}`, '热力图', item.label, item.token, item.description]
    }),
    bgBlurTones.flatMap((tone) => {
      const item = bgBlurToneMap[tone]

      return [
        'BgBlur',
        '背景模糊度',
        tone,
        item.label,
        item.backgroundToken,
        item.blurToken,
        item.description,
        item.uiUsage,
        item.bijiUsage,
      ]
    }),
  ),
  preview: () => <BgColorPreview />,
} satisfies ComponentDefinition
