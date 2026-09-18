import {
  bgBlurToneMap,
  bgBlurTones,
  getBgBlurBlurToken,
  getBgBlurBlurValue,
  getBgBlurClassName,
} from '../../components/bg-blur'
import type { ComponentDefinition } from '../component-docs'
import { TokenPreviewCard } from '../token-preview-card'

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
    <>
      {bgBlurTones.map((tone) => {
        const item = bgBlurToneMap[tone]

        return (
          <TokenPreviewCard
            key={tone}
            label={item.label}
            token={getBgBlurBlurToken(tone)}
            value={getBgBlurBlurValue(tone)}
          >
            <div className="bg-blur-preview__sample" aria-hidden="true">
              <span className="bg-blur-preview__backdrop" />
              <span className={`bg-blur-preview__overlay ${getBgBlurClassName(tone)}`} />
            </div>
          </TokenPreviewCard>
        )
      })}
    </>
  ),
} satisfies ComponentDefinition
