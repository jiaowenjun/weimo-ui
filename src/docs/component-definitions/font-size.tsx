import {
  bgColorToneMap,
  getBgColorClassName,
  getBgColorToken,
} from '../../components/bg-color'
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

const previewTextColorTones = textColorTones.filter((tone) => tone !== 'inherit')

const textColorToneOrder = [
  'primary',
  'secondary',
  'subtle',
  'disable',
  'placeholder',
  'danger',
] as const

const fontFamilyTokens = [
  {
    label: '无衬线字体',
    token: '--font-sans',
    value: 'Segoe UI',
    className: 'typography-preview__sample--font-sans',
  },
  {
    label: '等宽字体',
    token: '--font-mono',
    value: 'SFMono-Regular',
    className: 'typography-preview__sample--font-mono',
  },
] as const

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function FontPreview() {
  const orderedTextColorTones = textColorToneOrder.filter((tone) =>
    previewTextColorTones.includes(tone),
  )

  return (
    <>
      <TokenPreviewCard
        items={orderedTextColorTones.map((tone) => ({
          darkValue: textColorToneMap[tone].value.dark,
          token: getTextColorToken(tone),
          value: textColorToneMap[tone].value.light,
        }))}
        label="字色"
      >
        <div aria-hidden="true" className="text-color-preview__samples">
          {orderedTextColorTones.map((tone) => (
            <p className={`text-color-preview__sample ${getTextColorClassName(tone)}`} key={tone}>
              Aa
            </p>
          ))}
        </div>
      </TokenPreviewCard>

      <TokenPreviewCard
        darkValue={bgColorToneMap.selection.value.dark}
        label={bgColorToneMap.selection.label}
        token={getBgColorToken('selection')}
        value={bgColorToneMap.selection.value.light}
      >
        <p className="bg-color-preview__selection-sample">
          <span className="bg-color-preview__selection-copy">
            在编辑器里
            <span
              className={`bg-color-preview__selection-highlight ${getBgColorClassName('selection')}`}
            >
              选中一段文字
            </span>
            时，会铺上这层柔和的强调底色；也可以直接拖选这段话试试。
          </span>
        </p>
      </TokenPreviewCard>

      <TokenPreviewCard
        items={fontSizeScales.map((scale) => ({
          token: getFontSizeToken(scale),
          value: getFontSizeValue(scale),
        }))}
        label="字号"
      >
        <div aria-hidden="true" className="font-size-preview__samples">
          {fontSizeScales.map((scale) => (
            <p
              className={`font-size-preview__sample ${getFontSizeClassName(scale)}${
                getFontSizeToken(scale) === '--font-size-base'
                  ? ' font-size-preview__sample--base'
                  : ''
              }`}
              key={scale}
            >
              Aa
            </p>
          ))}
        </div>
      </TokenPreviewCard>

      <TokenPreviewCard
        items={fontFamilyTokens.map((font) => ({
          token: font.token,
          value: font.value,
        }))}
        label="字体"
      >
        <div aria-hidden="true" className="typography-preview__samples">
          {fontFamilyTokens.map((font) => (
            <div className={`typography-preview__sample ${font.className}`} key={font.token}>
              Aa 0123 汉字
            </div>
          ))}
        </div>
      </TokenPreviewCard>
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
    [
      'BgColor',
      '背景色',
      'selection',
      bgColorToneMap.selection.label,
      bgColorToneMap.selection.token,
      bgColorToneMap.selection.description,
      bgColorToneMap.selection.uiUsage,
      bgColorToneMap.selection.bijiUsage,
    ],
  ).concat(
    fontFamilyTokens.flatMap((font) => ['FontFamily', '字体', '字型', font.token, font.label]),
  ),
  preview: () => <FontPreview />,
} satisfies ComponentDefinition
