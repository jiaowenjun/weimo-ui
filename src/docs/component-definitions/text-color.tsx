import {
  textColorToneMap,
  textColorTones,
  getTextColorClassName,
} from '../../components/text-color'
import type { ComponentDefinition } from '../component-docs'

const previewTextColorTones = textColorTones.filter((tone) => tone !== 'inherit')

export const textColorDefinition = {
  id: 'text-color',
  summary: '统一文字颜色 utility 和 tone map，提供语义化字色档位、CSS class 与 token 对照',
  status: 'Ready',
  props: [
    {
      name: 'textColorTones',
      type: 'TextColorTone[]',
      defaultValue: "['primary', 'secondary', 'subtle', 'placeholder', 'disable', ...]",
    },
    {
      name: 'textColorToneMap',
      type: 'Record<TextColorTone, { label; token; value: { light; dark }; className; description }>',
      defaultValue: '-',
    },
    {
      name: 'getTextColorClassName(tone)',
      type: '(tone: TextColorTone) => string',
      defaultValue: '-',
    },
    {
      name: 'getTextColorToken(tone)',
      type: '(tone: TextColorTone) => string',
      defaultValue: '-',
    },
  ],
  preview: () => (
    <div className="text-color-preview" aria-label="TextColor 字色档位预览">
      {previewTextColorTones.map((tone) => {
        const item = textColorToneMap[tone]

        return (
          <div className="text-color-preview__row" key={tone}>
            <div className="text-color-preview__identity">
              <div className="text-color-preview__meta">
                <span className="text-color-preview__label">{item.label}</span>
                <span className="text-color-preview__tone">{tone}</span>
              </div>
              <code className="text-color-preview__token">{item.token}</code>
              <code className="text-color-preview__value">
                <span>亮: {item.value.light}</span>
                <span>暗: {item.value.dark}</span>
              </code>
            </div>
            <p className={getTextColorClassName(tone)}>
              统一字色档位用于笔记正文、控件状态和辅助说明。
            </p>
            <span className="text-color-preview__description">{item.description}</span>
          </div>
        )
      })}
    </div>
  ),
} satisfies ComponentDefinition
