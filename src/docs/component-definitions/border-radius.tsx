import {
  borderRadiusScaleMap,
  borderRadiusScales,
  getBorderRadiusToken,
  getBorderRadiusValue,
} from '../../components/border-radius'
import type { ComponentDefinition } from '../component-docs'

export const borderRadiusDefinition = {
  id: 'border-radius',
  summary: '统一圆角 token scale，汇总 weimo-ui 与 biji-react 的圆角档位和使用语义',
  status: 'Ready',
  preview: () => (
    <div className="border-radius-preview" aria-label="BorderRadius 圆角档位预览">
      <p className="border-radius-preview__notes">
        --radius 统一承载基础容器、卡片容器、菜单弹层和登录外壳圆角，当前为 16px。
      </p>
      {borderRadiusScales.map((scale) => {
        const item = borderRadiusScaleMap[scale]
        const token = getBorderRadiusToken(scale)
        const value = getBorderRadiusValue(scale)

        return (
          <div className="border-radius-preview__row" key={scale}>
            <div className="border-radius-preview__sample-wrap">
              <div
                className="border-radius-preview__sample"
                style={{ borderRadius: `var(${token})` }}
                aria-hidden="true"
              />
            </div>
            <div className="border-radius-preview__identity">
              <div className="border-radius-preview__meta">
                <span className="border-radius-preview__label">{item.label}</span>
                <span className="border-radius-preview__scale">{scale}</span>
              </div>
              <code className="border-radius-preview__token">
                {token}
              </code>
              <code className="border-radius-preview__value">
                {value}
              </code>
            </div>
            <div className="border-radius-preview__description">
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
