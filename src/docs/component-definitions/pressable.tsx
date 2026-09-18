import {
  pressableToneMap,
  pressableTones,
  getPressableToken,
} from '../../components/pressable'
import { CardPanel } from '../../components/coss/card'
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
    <div className="pressable-preview" aria-label="按压反馈色档位预览">
      {pressableTones.map((tone) => {
        const item = pressableToneMap[tone]

        return (
          <CardPanel className="pressable-preview__panel" key={tone}>
            <div className="pressable-preview__meta">
              <span className="pressable-preview__label">{item.label}</span>
              <code className="pressable-preview__token">
                {getPressableToken(tone)}:{' '}
                <span className="pressable-preview__token-value--light">{item.value.light}</span>
                <span className="pressable-preview__token-value--dark">{item.value.dark}</span>
              </code>
            </div>
            <button type="button" className="pressable-preview__sample">
              悬停 / 按压查看反馈色
            </button>
          </CardPanel>
        )
      })}
    </div>
  ),
} satisfies ComponentDefinition
