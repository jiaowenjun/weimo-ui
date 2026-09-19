import {
  fontSizeScaleMap,
  fontSizeScales,
  getFontSizeClassName,
  getFontSizeToken,
  getFontSizeValue,
} from '../../components/font-size'
import {
  getTextColorClassName,
  getTextColorToken,
  textColorToneMap,
  textColorTones,
} from '../../components/text-color'
import { TokenPreviewCard } from '../../components/token-preview-card'
import type { ComponentDefinition } from '../component-docs'
import { sortByThemeLightness, useIsDarkTheme } from '../token-preview-color'

const previewTextColorTones = textColorTones.filter((tone) => tone !== 'inherit')

const fontFamilyTokens = [
  {
    label: '无衬线字体',
    token: '--font-sans',
    value: '"Segoe UI"',
    className: 'typography-preview__sample--font-sans',
  },
  {
    label: '等宽字体',
    token: '--font-mono',
    value: '"SFMono-Regular"',
    className: 'typography-preview__sample--font-mono',
  },
] as const

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function FontPreview() {
  const isDark = useIsDarkTheme()
  const orderedTextColorTones = sortByThemeLightness(
    previewTextColorTones,
    (tone) => textColorToneMap[tone].value,
    isDark,
    isDark ? 12 : 100,
  )

  return (
    <>
      <h2 className="token-preview-card-demo__category">字色</h2>

      {orderedTextColorTones.map((tone) => {
        const item = textColorToneMap[tone]

        return (
          <TokenPreviewCard
            darkValue={item.value.dark}
            key={tone}
            label={item.label}
            token={getTextColorToken(tone)}
            value={item.value.light}
          >
            <p
              className={`text-color-preview__sample ${getTextColorClassName(tone)}`}
              aria-hidden="true"
            >
              Aa
            </p>
          </TokenPreviewCard>
        )
      })}

      <h2 className="token-preview-card-demo__category">字号</h2>

      {fontSizeScales.map((scale) => {
        const item = fontSizeScaleMap[scale]

        return (
          <TokenPreviewCard
            key={scale}
            label={item.label}
            token={getFontSizeToken(scale)}
            value={getFontSizeValue(scale)}
          >
            <p
              className={`font-size-preview__sample ${getFontSizeClassName(scale)}`}
              aria-hidden="true"
            >
              Aa
            </p>
          </TokenPreviewCard>
        )
      })}

      <h2 className="token-preview-card-demo__category">字体</h2>

      {fontFamilyTokens.map((font) => (
        <TokenPreviewCard
          key={font.token}
          label={font.label}
          token={font.token}
          value={font.value}
        >
          <div
            className={`typography-preview__sample ${font.className}`}
            aria-hidden="true"
          >
            Aa 0123 汉字
          </div>
        </TokenPreviewCard>
      ))}
    </>
  )
}

export const fontSizeDefinition = {
  id: 'font-size',
  status: 'Ready',
  frame: 'plain',
  searchAliases: fontSizeScales.flatMap((scale) => {
    const item = fontSizeScaleMap[scale]

    return ['FontSize', '文字', '字体', '字号', scale, item.label, item.token, item.description, item.uiUsage, item.bijiUsage]
  }).concat(
    previewTextColorTones.flatMap((tone) => {
      const item = textColorToneMap[tone]

      return ['TextColor', '字色', tone, item.label, item.token, item.description]
    }),
  ).concat(
    fontFamilyTokens.flatMap((font) => ['FontFamily', '字体', '字型', font.token, font.label]),
  ),
  preview: () => <FontPreview />,
} satisfies ComponentDefinition
