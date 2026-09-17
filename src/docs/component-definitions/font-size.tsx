import {
  fontSizeScaleMap,
  fontSizeScales,
  getFontSizeClassName,
  getFontSizeToken,
  getFontSizeValue,
} from '../../components/font-size'
import type { ComponentDefinition } from '../component-docs'

export const fontSizeDefinition = {
  id: 'font-size',
  summary: '统一字号 token scale，展示 weimo-ui 与 biji-react 当前使用的 font-size 档位',
  status: 'Ready',
  preview: () => (
    <div className="font-size-preview" aria-label="FontSize 字号 token 预览">
      {fontSizeScales.map((scale) => {
        const item = fontSizeScaleMap[scale]
        const className = getFontSizeClassName(scale)
        const token = getFontSizeToken(scale)
        const value = getFontSizeValue(scale)

        return (
          <div className="font-size-preview__row" key={scale}>
            <p className={['font-size-preview__sample', className].join(' ')}>
              字号预览 Aa
            </p>
            <div className="font-size-preview__identity">
              <div className="font-size-preview__meta">
                <span className="font-size-preview__label">{item.label}</span>
                <span className="font-size-preview__scale">{scale}</span>
              </div>
              <code className="font-size-preview__token">{token}</code>
              <code className="font-size-preview__value">{value}</code>
            </div>
            <div className="font-size-preview__description">
              <p>{item.description}</p>
              <span>ui: {item.uiUsage}</span>
              <span>biji-react: {item.bijiUsage}</span>
            </div>
          </div>
        )
      })}
    </div>
  ),
} satisfies ComponentDefinition
