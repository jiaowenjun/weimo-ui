import {
  pressableToneMap,
  pressableTones,
  getPressableToken,
} from '../../components/pressable'
import { TokenPreviewCard } from '../../components/token-preview-card'
import type { ComponentDefinition } from '../component-docs'

export const pressableDefinition = {
  id: 'pressable',
  status: 'Ready',
  frame: 'plain',
  searchAliases: pressableTones.flatMap((tone) => {
    const item = pressableToneMap[tone]

    return ['Pressable', tone, item.label, item.token, item.description, item.uiUsage, item.bijiUsage]
  }),
  preview: () => (
    <>
      {pressableTones.map((tone) => {
        const item = pressableToneMap[tone]

        return (
          <TokenPreviewCard
            darkValue={item.value.dark}
            key={tone}
            label={item.label}
            token={getPressableToken(tone)}
            value={item.value.light}
          >
            <button type="button" className="pressable-preview__sample">
              悬停 / 按压查看反馈色
            </button>
          </TokenPreviewCard>
        )
      })}
    </>
  ),
} satisfies ComponentDefinition
