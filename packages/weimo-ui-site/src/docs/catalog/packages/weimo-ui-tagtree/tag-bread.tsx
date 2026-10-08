import { TagBreadPage } from 'weimo-ui-tagtree/page/tag-bread'
import type { ComponentDefinition } from '../../component-docs'

export const tagBreadDefinition = {
  id: 'tag-bread',
  summary: '标签路径字符串驱动的磨砂面包屑导航胶囊',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'TagBread',
    'Breadcrumb',
    '标签面包屑',
    '面包屑',
  ],
  preview: () => <TagBreadPage embedded />,
} satisfies ComponentDefinition
