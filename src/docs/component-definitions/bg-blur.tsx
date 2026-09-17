import {
  bgBlurToneMap,
  bgBlurTones,
  getBgBlurBlurToken,
  getBgBlurBlurValue,
  getBgBlurClassName,
} from '../../components/bg-blur'
import type { ComponentDefinition } from '../component-docs'

export const bgBlurDefinition = {
  id: 'bg-blur',
  summary: '背景模糊档位：--glass-blur 与 --backdrop-blur',
  status: 'Ready',
  preview: () => (
    <div className="bg-blur-preview" aria-label="BgBlur 背景模糊档位预览">
      {bgBlurTones.map((tone) => {
        const item = bgBlurToneMap[tone]

        return (
          <section className="bg-blur-preview__group" key={tone}>
            <div className="bg-blur-preview__meta">
              <span className="bg-blur-preview__label">{item.label}</span>
              <code className="bg-blur-preview__value">
                {getBgBlurBlurToken(tone)}: {getBgBlurBlurValue(tone)}
              </code>
            </div>
            <div className="bg-blur-preview__stage">
              <div className="bg-blur-preview__sample" aria-hidden="true">
                <span className="bg-blur-preview__backdrop" />
                <span className={`bg-blur-preview__overlay ${getBgBlurClassName(tone)}`} />
              </div>
            </div>
          </section>
        )
      })}
    </div>
  ),
} satisfies ComponentDefinition
