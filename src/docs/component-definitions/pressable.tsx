import type { ComponentDefinition } from '../component-docs'
import { PressableDemo } from './pressable-demo'

export const pressableDefinition = {
  id: 'pressable',
  summary: '集中展示代表性可按压反馈 token 值，用真实控件场景辅助观察 hover 背景变量',
  status: 'Ready',
  preview: () => <PressableDemo />,
} satisfies ComponentDefinition
