import { TagTreePage } from 'weimo-ui-tagtree/page'
import type { ComponentDefinition } from '../../component-docs'

export const tagDefinition = {
  id: 'tag',
  summary: '标签栏、标签面包屑、标签选择器与标签树的标签总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'TagBar',
    'TagBread',
    'TagPicker',
    'TagTree',
    'TagTreeRow',
    '标签栏',
    '标签面包屑',
    '标签选择器',
    '标签树',
    '标签树行',
  ],
  preview: () => <TagTreePage embedded />,
} satisfies ComponentDefinition
