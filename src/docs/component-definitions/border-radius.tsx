import {
  borderRadiusScaleMap,
  borderRadiusScales,
  getBorderRadiusToken,
  getBorderRadiusValue,
} from '../../components/border-radius'
import { CardPanel } from '../../components/coss/card'
import type { ComponentDefinition } from '../component-docs'

export const borderRadiusDefinition = {
  id: 'border-radius',
  status: 'Ready',
  frame: 'plain',
  preview: () => (
    <div className="border-radius-preview" aria-label="边框圆角档位预览">
      {borderRadiusScales.map((scale) => {
        const item = borderRadiusScaleMap[scale]

        return (
          <CardPanel className="border-radius-preview__panel" key={scale}>
            <div className="border-radius-preview__meta">
              <span className="border-radius-preview__label">{item.label}</span>
              <code className="border-radius-preview__token">
                {getBorderRadiusToken(scale)}: {getBorderRadiusValue(scale)}
              </code>
            </div>
            <div
              className="border-radius-preview__sample"
              style={{ borderRadius: `var(${getBorderRadiusToken(scale)})` }}
              aria-hidden="true"
            />
          </CardPanel>
        )
      })}
    </div>
  ),
} satisfies ComponentDefinition
