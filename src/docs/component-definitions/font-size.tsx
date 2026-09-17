import {
  fontSizeScaleMap,
  fontSizeScales,
  getFontSizeClassName,
  getFontSizeToken,
  getFontSizeValue,
} from '../../components/font-size'
import { CardPanel } from '../../components/coss/card'
import type { ComponentDefinition } from '../component-docs'

export const fontSizeDefinition = {
  id: 'font-size',
  status: 'Ready',
  frame: 'plain',
  preview: () => (
    <div className="font-size-preview" aria-label="字号档位预览">
      {fontSizeScales.map((scale) => {
        const item = fontSizeScaleMap[scale]

        return (
          <CardPanel className="font-size-preview__panel" key={scale}>
            <div className="font-size-preview__meta">
              <span className="font-size-preview__label">{item.label}</span>
              <code className="font-size-preview__token">
                {getFontSizeToken(scale)}: {getFontSizeValue(scale)}
              </code>
            </div>
            <p className={`font-size-preview__sample ${getFontSizeClassName(scale)}`} aria-hidden="true">
              Aa
            </p>
          </CardPanel>
        )
      })}
    </div>
  ),
} satisfies ComponentDefinition
