import {
  heatColorMap,
  heatColorLevels,
  getHeatColorClassName,
  getHeatColorToken,
} from '../../components/heat-color'
import type { ComponentDefinition } from '../component-docs'

function HeatColorDemo() {
  return (
    <div className="heat-color-preview" aria-label="HeatColor 热力色阶预览">
      {heatColorLevels.map((level) => {
        const item = heatColorMap[level]

        return (
          <div className="heat-color-preview__row" key={level}>
            <div className="heat-color-preview__sample-wrap">
              <div
                aria-hidden="true"
                className={`heat-color-preview__sample ${getHeatColorClassName(level)}`}
              />
            </div>
            <div className="heat-color-preview__identity">
              <div className="heat-color-preview__meta">
                <span className="heat-color-preview__label">{item.label}</span>
                <span className="heat-color-preview__level">level {level}</span>
              </div>
              <code className="heat-color-preview__token">{getHeatColorToken(level)}</code>
              <code className="heat-color-preview__value">
                <span>亮: {item.value.light}</span>
                <span>暗: {item.value.dark}</span>
              </code>
            </div>
            <div className="heat-color-preview__description">
              <p>{item.description}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export const heatColorDefinition = {
  id: 'heat-color',
  summary: 'Heatmap 共享颜色色阶，独立展示 0-4 级热力颜色',
  status: 'Ready',
  props: [
    { name: 'levels', type: 'HeatColorLevel[]', defaultValue: '[0, 1, 2, 3, 4]' },
    {
      name: 'heatColorMap',
      type: 'Record<HeatColorLevel, { label; token; value: { light; dark }; className; description }>',
      defaultValue: '-',
    },
    {
      name: 'getHeatColorClassName(level)',
      type: '(level: HeatColorLevel) => string',
      defaultValue: '-',
    },
    {
      name: 'getHeatColorToken(level)',
      type: '(level: HeatColorLevel) => string',
      defaultValue: '-',
    },
    { name: 'ariaLabel', type: 'string', defaultValue: '热力图颜色色阶' },
    { name: 'getLevelLabel', type: '(level: HeatColorLevel) => string', defaultValue: '-' },
    {
      name: '...divProps',
      type: 'Omit<HTMLAttributes<HTMLDivElement>, "aria-label">',
      defaultValue: '-',
    },
  ],
  preview: () => <HeatColorDemo />,
} satisfies ComponentDefinition
