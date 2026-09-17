import {
  bgBlurToneMap,
  getBgBlurBackgroundToken,
  getBgBlurBlurToken,
  getBgBlurBlurValue,
  getBgBlurClassName,
  getBgBlurFilter,
  type BgBlurTone,
} from '../../components/bg-blur'
import type { ComponentDefinition } from '../component-docs'

type BgBlurToneGroup = {
  title: string
  description: string
  tones: readonly BgBlurTone[]
}

const bgBlurToneGroups = [
  {
    title: '玻璃材质',
    description: '玻璃 chip 和同类浮动材质使用的半透明背景与柔和背景模糊组合。',
    tones: ['glass'],
  },
  {
    title: '背景遮罩',
    description: '弹层、命令面板和移动端抽屉共用的背景遮罩与背景模糊组合。',
    tones: ['backdrop'],
  },
] satisfies readonly BgBlurToneGroup[]

export const bgBlurDefinition = {
  id: 'bg-blur',
  summary: '统一透明背景 + blur utility 和 tone map，汇总 weimo-ui 与 biji-react 的稳定搭配场景',
  status: 'Ready',
  preview: () => (
    <div className="bg-blur-preview" aria-label="BgBlur 透明背景与背景模糊档位预览">
      {bgBlurToneGroups.map((group) => (
        <section className="bg-blur-preview__group" key={group.title}>
          <header className="bg-blur-preview__group-header">
            <h3 className="bg-blur-preview__group-title">{group.title}</h3>
            <p className="bg-blur-preview__group-description">{group.description}</p>
          </header>
          <div className="bg-blur-preview__group-list">
            {group.tones.map((tone) => {
              const item = bgBlurToneMap[tone]

              return (
                <div className="bg-blur-preview__row" key={tone}>
                  <div className="bg-blur-preview__sample-wrap">
                    <div className="bg-blur-preview__sample" aria-hidden="true">
                      <span className="bg-blur-preview__backdrop" />
                      <span className={`bg-blur-preview__overlay ${getBgBlurClassName(tone)}`} />
                    </div>
                  </div>
                  <div className="bg-blur-preview__identity">
                    <div className="bg-blur-preview__meta">
                      <span className="bg-blur-preview__label">{item.label}</span>
                      <span className="bg-blur-preview__tone">{tone}</span>
                    </div>
                    <code className="bg-blur-preview__token">
                      <span>背景: {getBgBlurBackgroundToken(tone)}</span>
                      <span>blur: {getBgBlurBlurToken(tone)}</span>
                    </code>
                    <code className="bg-blur-preview__value">
                      <span>亮: {item.backgroundValue.light}</span>
                      <span>暗: {item.backgroundValue.dark}</span>
                      <span>blur 值: {getBgBlurBlurValue(tone)}</span>
                      <span>filter: {getBgBlurFilter(tone)}</span>
                    </code>
                  </div>
                  <div className="bg-blur-preview__description">
                    <p>{item.description}</p>
                    <span>weimo-ui: {item.uiUsage}</span>
                    <span>biji-react: {item.bijiUsage}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      ))}
    </div>
  ),
} satisfies ComponentDefinition
