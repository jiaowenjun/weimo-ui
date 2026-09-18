import {
  heatColorMap,
  heatColorLevels,
  getHeatColorClassName,
  getHeatColorToken,
} from '../../components/heat-color'
import { CardPanel } from '../../components/coss/card'
import type { ComponentDefinition } from '../component-docs'

function HeatColorPreview() {
  return (
    <div className="heat-color-preview" aria-label="热力图色档位预览">
      {heatColorLevels.map((level) => {
        const item = heatColorMap[level]

        return (
          <CardPanel className="heat-color-preview__panel" key={level}>
            <div className="heat-color-preview__meta">
              <span className="heat-color-preview__label">{item.label}</span>
              <code className="heat-color-preview__token">
                {getHeatColorToken(level)}:{' '}
                <span className="heat-color-preview__token-value--light">{item.value.light}</span>
                <span className="heat-color-preview__token-value--dark">{item.value.dark}</span>
              </code>
            </div>
            <div
              aria-hidden="true"
              className={`heat-color-preview__sample ${getHeatColorClassName(level)}`}
            />
          </CardPanel>
        )
      })}
    </div>
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
