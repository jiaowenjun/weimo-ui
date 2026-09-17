import {
  borderColorToneMap,
  borderColorTones,
  getBorderColorClassName,
  getBorderColorToken,
} from '../../components/border-color'
import { CardPanel } from '../../components/coss/card'
import type { ComponentDefinition } from '../component-docs'

export const borderColorDefinition = {
  id: 'border-color',
  status: 'Ready',
  frame: 'plain',
  preview: () => (
    <div className="border-color-preview" aria-label="边框色档位预览">
      {borderColorTones.map((tone) => {
        const item = borderColorToneMap[tone]

        return (
          <CardPanel className="border-color-preview__panel" key={tone}>
            <div className="border-color-preview__meta">
              <span className="border-color-preview__label">{item.label}</span>
              <code className="border-color-preview__token">
                {getBorderColorToken(tone)}:{' '}
                <span className="border-color-preview__token-value--light">{item.value.light}</span>
                <span className="border-color-preview__token-value--dark">{item.value.dark}</span>
              </code>
            </div>
            <div
              className={`border-color-preview__sample ${getBorderColorClassName(tone)}`}
              aria-hidden="true"
            />
          </CardPanel>
        )
      })}
    </div>
  ),
} satisfies ComponentDefinition
