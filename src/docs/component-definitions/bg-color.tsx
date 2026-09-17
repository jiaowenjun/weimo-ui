import {
  bgColorToneMap,
  getBgColorClassName,
  getBgColorToken,
  type BgColorTone,
} from '../../components/bg-color'
import type { ComponentDefinition } from '../component-docs'

type BgColorToneGroup = {
  title: string
  description: string
  tones: readonly BgColorTone[]
}

const bgColorToneGroups = [
  {
    title: '基础表面',
    description: '页面、卡片和抬升区域的基础层级。',
    tones: ['page', 'card', 'raised'],
  },
  {
    title: '动作与反馈',
    description: '主动作填充、通用 hover 和 hover 面上的嵌套反馈。',
    tones: ['primary', 'hover', 'hover-on-hover'],
  },
  {
    title: '组件状态',
    description: '组件内部的选中态、标签和筛选 chip 等常驻低强度面色。',
    tones: ['selected', 'chip'],
  },
  {
    title: '内容高亮',
    description: '编辑选区等内容区域的局部高亮背景。',
    tones: ['selection'],
  },
  {
    title: '分享输出',
    description: 'ShareCard 生成图文卡时使用的独立输出背景。',
    tones: ['share-card', 'share-card-tag-mask'],
  },
] satisfies readonly BgColorToneGroup[]

function hasTransparentBgColorValue(tone: { value: { light: string; dark: string } }) {
  const slashAlphaPattern = /\/\s*(?:0?\.\d+|[1-9]\d?%)/

  return [tone.value.light, tone.value.dark].some(
    (value) => value.includes('rgba(') || value.includes('hsla(') || slashAlphaPattern.test(value),
  )
}

export const bgColorDefinition = {
  id: 'bg-color',
  summary: '统一背景色 utility 和 tone map，汇总 weimo-ui 与 biji-react 的背景/填充色档位',
  status: 'Ready',
  preview: () => (
    <div className="bg-color-preview" aria-label="BgColor 背景色档位预览">
      {bgColorToneGroups.map((group) => (
        <section className="bg-color-preview__group" key={group.title}>
          <header className="bg-color-preview__group-header">
            <h3 className="bg-color-preview__group-title">{group.title}</h3>
            <p className="bg-color-preview__group-description">{group.description}</p>
          </header>
          <div className="bg-color-preview__group-list">
            {group.tones.map((tone) => {
              const item = bgColorToneMap[tone]
              const token = getBgColorToken(tone)
              const isTransparent = hasTransparentBgColorValue(item)

              return (
                <div className="bg-color-preview__row" key={tone}>
                  <div className="bg-color-preview__sample-wrap">
                    <div className="bg-color-preview__sample" aria-hidden="true">
                      {isTransparent ? <span className="bg-color-preview__sample-backdrop" /> : null}
                      <span
                        className={[
                          'bg-color-preview__sample-fill',
                          isTransparent ? 'bg-color-preview__sample-fill--framed' : '',
                          getBgColorClassName(tone),
                        ]
                          .filter(Boolean)
                          .join(' ')}
                      />
                    </div>
                  </div>
                  <div className="bg-color-preview__identity">
                    <div className="bg-color-preview__meta">
                      <span className="bg-color-preview__label">{item.label}</span>
                      <span className="bg-color-preview__tone">{tone}</span>
                    </div>
                    <code className="bg-color-preview__token">{token}</code>
                    <code className="bg-color-preview__value">
                      <span>亮: {item.value.light}</span>
                      <span>暗: {item.value.dark}</span>
                    </code>
                  </div>
                  <div className="bg-color-preview__description">
                    <p>{item.description}</p>
                    <span>ui: {item.uiUsage}</span>
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
