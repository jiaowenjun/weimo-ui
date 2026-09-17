import type { CSSProperties, ReactNode } from 'react'
import { ChevronRight, Hash, Pencil, Trash2 } from 'lucide-react'

import { GhostIconButton } from '../ghost-icon-button'
import { ActionMenu, type ActionMenuItem } from '../menu'
import {
  guideSlotsForDepth,
  type AnimatedTagTreeRow,
  type VisibleTagTreeRow,
} from './tag-tree-model'
import type {
  TagTreeMenuAction,
  TagTreeVariant,
} from './tag-tree'

export type TagTreeRowProps = {
  additionalMenuItems?: (
    tag: string,
    node: AnimatedTagTreeRow['node'],
  ) => ActionMenuItem[]
  row: AnimatedTagTreeRow
  defaultIcon?: ReactNode
  rowMenuEnabled: boolean
  variant: TagTreeVariant
  onMenuAction?: (
    action: TagTreeMenuAction,
    tag: string,
    node: AnimatedTagTreeRow['node'],
  ) => void
  onSelect: (row: VisibleTagTreeRow) => void
  onToggle: (row: VisibleTagTreeRow) => void
}

export function TagTreeRow({
  additionalMenuItems,
  defaultIcon,
  onMenuAction,
  onSelect,
  onToggle,
  row,
  rowMenuEnabled,
  variant,
}: TagTreeRowProps) {
  const guideSlots = guideSlotsForDepth(row.depth)
  const icon = row.node.icon ?? defaultIcon ?? <Hash aria-hidden="true" />
  const resolvedAdditionalMenuItems = additionalMenuItems?.(row.tag, row.node) ?? []
  const menuItems: ActionMenuItem[] = [
    ...resolvedAdditionalMenuItems,
    ...(resolvedAdditionalMenuItems.length > 0
      ? [{ key: 'after-additional', type: 'separator' as const }]
      : []),
    {
      key: 'rename',
      icon: <Pencil aria-hidden="true" />,
      label: '重命名',
      onSelect: () => onMenuAction?.('rename', row.tag, row.node),
    },
    { key: 'after-rename', type: 'separator' },
    {
      key: 'delete',
      icon: <Trash2 aria-hidden="true" />,
      label: '删除',
      onSelect: () => onMenuAction?.('delete', row.tag, row.node),
      variant: 'destructive',
    },
  ]
  const style = {
    '--tag-tree-depth': row.depth,
  } as CSSProperties

  return (
    <div
      aria-expanded={row.hasChildren ? row.expanded : undefined}
      aria-level={row.depth + 1}
      aria-selected={row.selected}
      className="tag-tree__row"
      data-depth={row.depth}
      data-entering={row.animationState === 'entering' ? 'true' : undefined}
      data-expanded={row.expanded ? 'true' : undefined}
      data-removing={row.animationState === 'removing' ? 'true' : undefined}
      data-selected={row.selected ? 'true' : undefined}
      role="treeitem"
      style={style}
    >
      <div className="tag-tree__guides" aria-hidden="true">
        {guideSlots.map((slot) => (
          <span className="tag-tree__guide" key={slot} />
        ))}
      </div>

      <div
        className="tag-tree__row-body"
        data-has-menu={rowMenuEnabled ? 'true' : undefined}
        data-variant={variant}
      >
        <button
          className="tag-tree__select"
          onClick={() => onSelect(row)}
          type="button"
        >
          <span className="tag-tree__tag-icon" aria-hidden="true">
            {icon}
          </span>
          <span className="tag-tree__label">{row.label}</span>
        </button>

        {row.hasChildren ? (
          <GhostIconButton
            aria-label={row.expanded ? `收起 ${row.label}` : `展开 ${row.label}`}
            className="tag-tree__toggle"
            data-expanded={row.expanded ? 'true' : undefined}
            onClick={() => onToggle(row)}
            size="sm"
          >
            <ChevronRight aria-hidden="true" />
          </GhostIconButton>
        ) : variant === 'default' ? (
          <span className="tag-tree__toggle-spacer" aria-hidden="true" />
        ) : null}

        {rowMenuEnabled ? (
          <span className="tag-tree__menu-slot">
            <ActionMenu
              ariaLabel={`${row.label} 更多操作`}
              items={menuItems}
              triggerProps={{
                render: (
                  <GhostIconButton
                    aria-label={`${row.label} 更多操作`}
                    className="tag-tree__menu-trigger"
                    size="sm"
                  />
                ),
              }}
            />
          </span>
        ) : null}
      </div>
    </div>
  )
}
