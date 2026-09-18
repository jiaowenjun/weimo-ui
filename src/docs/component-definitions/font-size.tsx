import {
  fontSizeScaleMap,
  fontSizeScales,
  getFontSizeClassName,
  getFontSizeToken,
  getFontSizeValue,
} from '../../components/font-size'
import { TokenPreviewCard } from '../../components/token-preview-card'
import type { ComponentDefinition } from '../component-docs'

export const fontSizeDefinition = {
  id: 'font-size',
  status: 'Ready',
  frame: 'plain',
  searchAliases: fontSizeScales.flatMap((scale) => {
    const item = fontSizeScaleMap[scale]

    return ['FontSize', scale, item.label, item.token, item.description, item.uiUsage, item.bijiUsage]
  }),
  preview: () => (
    <>
      {fontSizeScales.map((scale) => {
        const item = fontSizeScaleMap[scale]

        return (
          <TokenPreviewCard
            key={scale}
            label={item.label}
            token={getFontSizeToken(scale)}
            value={getFontSizeValue(scale)}
          >
            <p className={`font-size-preview__sample ${getFontSizeClassName(scale)}`} aria-hidden="true">
              Aa
            </p>
          </TokenPreviewCard>
        )
      })}
    </>
  ),
} satisfies ComponentDefinition
