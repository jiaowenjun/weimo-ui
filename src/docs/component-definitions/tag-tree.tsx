import { useState } from 'react'
import { CalendarDays, Folder, Hash } from 'lucide-react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import {
  TagTree,
  type TagTreeNode,
  type TagTreeVariant,
} from '../../components/tag-tree'
import type { ComponentDefinition } from '../component-docs'

const tagTreeDemoNodes: TagTreeNode[] = [
  {
    tag: 'writing',
    label: '写作',
    icon: <Folder aria-hidden="true" />,
    children: [
      { tag: 'writing/daily', label: '日记', icon: <CalendarDays aria-hidden="true" /> },
      { tag: 'writing/ideas', label: '灵感' },
    ],
  },
  {
    tag: 'research',
    label: '研究',
    children: [
      { tag: 'research/papers', label: '论文' },
      { tag: 'research/quotes', label: '摘录' },
    ],
  },
  { tag: 'archive', label: '归档' },
]

function TagTreeDemo({
  defaultExpandedTags = ['writing', 'research'],
  nodes = tagTreeDemoNodes,
  selectedTag: initialSelectedTag = 'writing/daily',
  variant = 'default',
}: {
  defaultExpandedTags?: string[]
  nodes?: TagTreeNode[]
  selectedTag?: string
  variant?: TagTreeVariant
} = {}) {
  const [selectedTag, setSelectedTag] = useState(initialSelectedTag)

  return (
    <ComponentPreviewCard label="标签树">
      <div className="tag-tree-preview">
        <div className="tag-tree-preview__panel">
          <TagTree
            className="tag-tree-preview__tree"
            defaultExpandedTags={defaultExpandedTags}
            defaultIcon={<Hash aria-hidden="true" />}
            nodes={nodes}
            onMenuAction={variant === "default" ? () => {} : undefined}
            onSelect={setSelectedTag}
            selectedTag={selectedTag}
            variant={variant}
          />
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

export const tagTreeDefinition = {
  id: 'tag-tree',
  summary: '只服务于侧边栏标签导航的树组件',
  status: 'Ready',
  frame: 'plain',
  preview: () => <TagTreeDemo />,
} satisfies ComponentDefinition
