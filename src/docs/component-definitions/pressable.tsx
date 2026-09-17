import type { ComponentDefinition } from '../component-docs'
import { PressableDemo } from './pressable-demo'

export const pressableDefinition = {
  id: 'pressable',
  summary: '集中展示代表性可按压反馈 token 值，用真实控件场景辅助观察 hover 背景变量',
  status: 'Ready',
  props: [
    {
      name: 'pressableTones',
      type: 'PressableTone[]',
      defaultValue: "['feedback']",
    },
    {
      name: 'pressableToneMap',
      type: 'Record<PressableTone, { label; bgColorTone; token; value; className; description; uiUsage; bijiUsage }>',
      defaultValue: '-',
    },
    {
      name: 'getPressableClassName(tone)',
      type: '(tone: PressableTone) => string',
      defaultValue: '-',
    },
    {
      name: 'getPressableToken(tone)',
      type: '(tone: PressableTone) => string',
      defaultValue: '-',
    },
    {
      name: 'getPressableBgColorTone(tone)',
      type: '(tone: PressableTone) => BgColorTone',
      defaultValue: '-',
    },
  ],
  preview: () => <PressableDemo />,
} satisfies ComponentDefinition
