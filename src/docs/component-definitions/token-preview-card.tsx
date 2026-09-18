import type { ComponentDefinition } from '../component-docs'
import { TokenPreviewCardDemo } from './token-preview-card-demo'

export const tokenPreviewCardDefinition = {
  id: 'token-preview-card',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'token card',
    'token preview',
    '非透明背景色',
    '透明背景色',
    '背景模糊度',
    '边框圆角',
    '边框色',
    '字号',
    '字色',
    '字体',
    '行高',
    '交互',
    '按压反馈',
    'label',
    'token',
    'value',
    'darkValue',
  ],
  preview: () => <TokenPreviewCardDemo />,
} satisfies ComponentDefinition
