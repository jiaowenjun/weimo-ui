import {
  heatColorMap,
  heatColorLevels,
  getHeatColorClassName,
  getHeatColorToken,
} from '../../components/heat-color'
import { TokenPreviewCard } from '../../components/token-preview-card'
import type { ComponentDefinition } from '../component-docs'

function HeatColorPreview() {
  return (
    <>
      {heatColorLevels.map((level) => {
        const item = heatColorMap[level]

        return (
          <TokenPreviewCard
            darkValue={item.value.dark}
            key={level}
            label={item.label}
            token={getHeatColorToken(level)}
            value={item.value.light}
          >
            <div
              aria-hidden="true"
              className={`heat-color-preview__sample ${getHeatColorClassName(level)}`}
            />
          </TokenPreviewCard>
        )
      })}
    </>
  )
}

export const heatColorDefinition = {
  id: 'heat-color',
  status: 'Ready',
  frame: 'plain',
  searchAliases: heatColorLevels.flatMap((level) => {
    const item = heatColorMap[level]

    return ['HeatColor', `level ${level}`, item.label, item.token, item.description]
  }),
  preview: () => <HeatColorPreview />,
} satisfies ComponentDefinition
