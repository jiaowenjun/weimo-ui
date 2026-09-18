import {
  bgBlurToneMap,
  bgBlurTones,
  getBgBlurBlurToken,
  getBgBlurBlurValue,
  getBgBlurClassName,
} from '../../components/bg-blur'
import { TokenPreviewCard } from '../../components/token-preview-card'
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
            <div className="token-preview-card__surface-preview" aria-hidden="true">
              <span className="token-preview-card__surface-backdrop" />
              <span className={`token-preview-card__surface ${getBgBlurClassName(tone)}`} />
            </div>
          </TokenPreviewCard>
        )
      })}
    </>
  ),
} satisfies ComponentDefinition
