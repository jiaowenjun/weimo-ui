import {
  bgBlurToneMap,
  bgBlurTones,
  getBgBlurBlurToken,
  getBgBlurBlurValue,
  getBgBlurClassName,
} from '../../components/bg-blur'
import { CardPanel } from '../../components/coss/card'
import type { ComponentDefinition } from '../component-docs'

export const bgBlurDefinition = {
  id: 'bg-blur',
  status: 'Ready',
  frame: 'plain',
  searchAliases: bgBlurTones.flatMap((tone) => {
    const item = bgBlurToneMap[tone]

    return [
      'BgBlur',
      tone,
      item.label,
      item.backgroundToken,
      item.blurToken,
      item.description,
      item.uiUsage,
      item.bijiUsage,
    ]
  }),
  preview: () => (
    <div className="bg-blur-preview" aria-label="背景模糊度档位预览">
      {bgBlurTones.map((tone) => {
        const item = bgBlurToneMap[tone]

        return (
          <CardPanel className="bg-blur-preview__panel" key={tone}>
            <div className="bg-blur-preview__meta">
              <span className="bg-blur-preview__label">{item.label}</span>
              <code className="bg-blur-preview__value">
                {getBgBlurBlurToken(tone)}: {getBgBlurBlurValue(tone)}
              </code>
            </div>
            <div className="bg-blur-preview__sample" aria-hidden="true">
              <span className="bg-blur-preview__backdrop" />
              <span className={`bg-blur-preview__overlay ${getBgBlurClassName(tone)}`} />
            </div>
          </CardPanel>
        )
      })}
    </div>
  ),
} satisfies ComponentDefinition
