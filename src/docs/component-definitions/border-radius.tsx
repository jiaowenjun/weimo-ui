import {
  borderRadiusScaleMap,
  borderRadiusScales,
  getBorderRadiusToken,
  getBorderRadiusValue,
} from '../../components/border-radius'
import { TokenPreviewCard } from '../../components/token-preview-card'
import type { ComponentDefinition } from '../component-docs'

export const borderRadiusDefinition = {
  id: 'border-radius',
  status: 'Ready',
  frame: 'plain',
  searchAliases: borderRadiusScales.flatMap((scale) => {
    const item = borderRadiusScaleMap[scale]

    return ['BorderRadius', scale, item.label, item.token, item.description, item.uiUsage, item.bijiUsage]
  }),
  preview: () => (
    <>
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
    </>
  ),
} satisfies ComponentDefinition
