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
import { ComponentPreviewCard } from '../../components/component-preview-card'
import { GlassPreviewCard } from '../glass-preview-card'
import { glassBackgroundGrayMidpoint } from '../glass-preview'
import type { ComponentDefinition } from '../component-docs'
import { useIsDarkTheme } from '../token-preview-color'

// 合并 swatch 卡固定语义顺序,不做亮度排序;唯一例外:亮主题下 card 与 page 互换,
// 让色块亮度序列在两主题下都单调(亮 card 100%→page 96%→…,暗 page 7%→card 12%→…)。
const bgColorSwatchTones = [
  'page',
  'card',
  'selected',
  'raised',
  'chip',
  'hover',
  'hover-on-hover',
  'primary',
] as const satisfies readonly BgColorTone[]

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function BgColorPreview() {
  const isDark = useIsDarkTheme()
  const swatchTones = isDark
    ? bgColorSwatchTones
    : [bgColorSwatchTones[1], bgColorSwatchTones[0], ...bgColorSwatchTones.slice(2)]

  return (
    <>
      <ComponentPreviewCard
        items={swatchTones.map((tone) => {
          const item = bgColorToneMap[tone]

          return {
            darkValue: item.value.dark,
            token: getBgColorToken(tone),
            value: item.value.light,
          }
        })}
        label="背景色"
      >
        <div className="bg-color-preview__swatch-canvas">
          <div aria-hidden="true" className="bg-color-preview__swatch-group">
            {swatchTones.map((tone) => (
              <span
                className={`bg-color-preview__swatch ${getBgColorClassName(tone)}`}
                key={tone}
              />
            ))}
          </div>
        </div>
      </ComponentPreviewCard>

      <ComponentPreviewCard
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
      </ComponentPreviewCard>

      <GlassPreviewCard
        initialGray={glassBackgroundGrayMidpoint}
        items={bgBlurTones.map((tone) => ({
          token: getBgBlurBlurToken(tone),
          value: getBgBlurBlurValue(tone),
        }))}
        label="背景模糊度"
      >
        <div className="bg-blur-pair">
          {bgBlurTones.map((tone) => (
            <span
              aria-hidden="true"
              className={`bg-blur-pair__surface ${getBgBlurClassName(tone)}`}
              key={tone}
            />
          ))}
        </div>
      </GlassPreviewCard>
    </>
  )
}

export const backgroundTokensDefinition = {
  id: 'background-tokens',
  status: 'Ready',
  frame: 'plain',
  searchAliases: bgColorSwatchTones.flatMap((tone) => {
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
