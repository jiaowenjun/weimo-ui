import { TagTreePage } from 'weimo-ui-tagtree/page'
import type { ComponentDefinition } from '../../component-docs'

export const tagDefinition = {
  id: 'tag',
  summary: '标签面包屑与标签树的树形导航总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'TagBread',
    'TagTree',
    'TagTreeRow',
    '标签面包屑',
    '标签树',
    '标签树行',
  ],
  preview: () => <TagTreePage embedded />,
} satisfies ComponentDefinition
