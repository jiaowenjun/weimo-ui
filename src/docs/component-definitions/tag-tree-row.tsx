import { CalendarDays, Folder } from 'lucide-react'

import type { AnimatedTagTreeRow } from '../../components/tag-tree/tag-tree-model'
import { TagTreeRow } from '../../components/tag-tree/tag-tree-row'
import type { ComponentDefinition } from '../component-docs'

import '../../components/tag-tree/tag-tree.css'

const rootRow: AnimatedTagTreeRow = {
  node: { tag: 'writing', label: '写作', icon: <Folder aria-hidden="true" /> },
  tag: 'writing',
  label: '写作',
  depth: 0,
  hasChildren: true,
  expanded: true,
  selected: false,
}

const childRow: AnimatedTagTreeRow = {
  node: { tag: 'writing/daily', label: '日记', icon: <CalendarDays aria-hidden="true" /> },
  tag: 'writing/daily',
  label: '日记',
  depth: 1,
  hasChildren: false,
  expanded: false,
  selected: true,
}

function TagTreeRowDemo() {
  return (
    <div className="internal-tag-tree-row-preview tag-tree" role="tree" aria-label="TagTreeRow preview">
      <TagTreeRow
        onMenuAction={() => {}}
        onSelect={() => {}}
        onToggle={() => {}}
        row={rootRow}
        rowMenuEnabled
        variant="default"
      />
      <TagTreeRow
        onMenuAction={() => {}}
        onSelect={() => {}}
        onToggle={() => {}}
        row={childRow}
        rowMenuEnabled
        variant="default"
      />
      <TagTreeRow
        onSelect={() => {}}
        onToggle={() => {}}
        row={{ ...childRow, tag: 'writing/ideas', label: '灵感', selected: false }}
        rowMenuEnabled={false}
        variant="no-action"
      />
    </div>
  )
}

export const tagTreeRowDefinition = {
  id: 'tag-tree-row',
  summary: 'TagTree 的内部行组件，负责缩进引导线、选择态、展开按钮和行操作菜单',
  status: 'Ready',
  preview: () => <TagTreeRowDemo />,
} satisfies ComponentDefinition
