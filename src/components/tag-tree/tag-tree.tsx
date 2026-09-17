import type { HTMLAttributes, ReactNode } from 'react'

import { cn } from '../lib/utils'
import type { ActionMenuItem } from '../menu'
import { TagTreeRow } from './tag-tree-row'
import { useTagTree } from './use-tag-tree'
import type { TagTreeNode } from './tag-tree-model'

import './tag-tree.css'

export type { TagTreeNode } from './tag-tree-model'

export type TagTreeMenuAction = 'rename' | 'delete'
export type TagTreeVariant = 'default' | 'no-action'

export type TagTreeProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  'onSelect'
> & {
  nodes: TagTreeNode[]
  variant?: TagTreeVariant
  defaultIcon?: ReactNode
  selectedTag?: string
  expandedTags?: string[]
  defaultExpandedTags?: string[]
  emptyLabel?: ReactNode
  additionalMenuItems?: (
    tag: string,
    node: TagTreeNode,
  ) => ActionMenuItem[]
  onExpandedTagsChange?: (tags: string[]) => void
  onSelect?: (tag: string, node: TagTreeNode) => void
  onMenuAction?: (
    action: TagTreeMenuAction,
    tag: string,
    node: TagTreeNode,
  ) => void
}

export function TagTree({
  additionalMenuItems,
  className,
  defaultExpandedTags = [],
  defaultIcon,
  emptyLabel = '暂无标签',
  expandedTags,
  nodes,
  onExpandedTagsChange,
  onMenuAction,
  onSelect,
  role,
  selectedTag,
  variant = 'default',
  ...props
}: TagTreeProps) {
  const { handleSelect, handleToggle, renderedRows } = useTagTree({
    defaultExpandedTags,
    expandedTags,
    nodes,
    onExpandedTagsChange,
    onSelect,
    selectedTag,
  })
  const showMenu = variant === 'default' && typeof onMenuAction === 'function'
  const ariaLabel = props['aria-label'] ?? '标签'

  return (
    <div
      {...props}
      aria-label={ariaLabel}
      className={cn('tag-tree', className)}
      role={role ?? 'tree'}
    >
      {renderedRows.length === 0 ? (
        <div className="tag-tree__empty" role="note">
          {emptyLabel}
        </div>
      ) : (
        <div className="tag-tree__list">
          {renderedRows.map((row) => (
            <TagTreeRow
              additionalMenuItems={additionalMenuItems}
              defaultIcon={defaultIcon}
              key={row.tag}
              onMenuAction={onMenuAction}
              onSelect={handleSelect}
              onToggle={handleToggle}
              row={row}
              rowMenuEnabled={showMenu && row.node.menuEnabled !== false}
              variant={variant}
            />
          ))}
        </div>
      )}
    </div>
  )
}
