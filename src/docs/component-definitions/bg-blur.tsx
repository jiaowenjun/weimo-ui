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
  summary: '背景模糊档位：--glass-blur 与 --backdrop-blur',
  status: 'Ready',
  frame: 'plain',
  preview: () => (
    <div className="bg-blur-preview" aria-label="BgBlur 背景模糊档位预览">
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
