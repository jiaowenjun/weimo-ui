import type { ReactNode } from 'react'

export const MAX_GUIDE_DEPTH = 6
export const TAG_TREE_ANIMATION_MS = 200

export type TagTreeNode = {
  tag: string
  label?: string
  icon?: ReactNode
  children?: TagTreeNode[]
  itemCount?: number
  menuEnabled?: boolean
}

export type VisibleTagTreeRow = {
  node: TagTreeNode
  tag: string
  label: string
  depth: number
  hasChildren: boolean
  expanded: boolean
  selected: boolean
}

export type AnimatedTagTreeRow = VisibleTagTreeRow & {
  animationState?: 'entering' | 'removing'
}

export function resolveTagLabel(node: TagTreeNode) {
  const parts = node.tag.split('/')

  return node.label || parts[parts.length - 1] || node.tag || '未命名'
}

export function collectSelectedAncestorTags(
  nodes: TagTreeNode[],
  selectedTag: string | undefined,
): Set<string> {
  const ancestors = new Set<string>()

  if (!selectedTag) {
    return ancestors
  }

  function visit(node: TagTreeNode): boolean {
    const children = node.children ?? []
    const containsSelectedChild = children.some((child) => visit(child))

    if (containsSelectedChild) {
      ancestors.add(node.tag)
    }

    return node.tag === selectedTag || containsSelectedChild
  }

  nodes.forEach((node) => visit(node))

  return ancestors
}

export function buildVisibleRows(
  nodes: TagTreeNode[],
  expandedTags: Set<string>,
  selectedTag: string | undefined,
  depth = 0,
): VisibleTagTreeRow[] {
  const rows: VisibleTagTreeRow[] = []

  for (const node of nodes) {
    const children = node.children ?? []
    const hasChildren = children.length > 0
    const expanded = hasChildren && expandedTags.has(node.tag)

    rows.push({
      node,
      tag: node.tag,
      label: resolveTagLabel(node),
      depth,
      hasChildren,
      expanded,
      selected: node.tag === selectedTag,
    })

    if (expanded) {
      rows.push(...buildVisibleRows(children, expandedTags, selectedTag, depth + 1))
    }
  }

  return rows
}

export function toggleExpandedTag(tags: string[], tag: string): string[] {
  return tags.includes(tag)
    ? tags.filter((item) => item !== tag)
    : [...tags, tag]
}

/** 收集 tag 所在层级的全部兄弟 tag(含自身);tag 不在树中时返回空集 */
export function findSiblingTags(nodes: TagTreeNode[], tag: string): Set<string> {
  const siblings = new Set<string>()

  function visit(level: TagTreeNode[]): boolean {
    const levelTags = level.map((node) => node.tag)

    if (levelTags.includes(tag)) {
      levelTags.forEach((sibling) => siblings.add(sibling))
      return true
    }

    return level.some((node) => visit(node.children ?? []))
  }

  visit(nodes)
  return siblings
}

/** 手风琴展开:展开 tag 的同时折叠其同级兄弟(后代展开状态保留,重开父节点时恢复) */
export function expandTagExclusive(
  tags: string[],
  tag: string,
  nodes: TagTreeNode[],
): string[] {
  const siblings = findSiblingTags(nodes, tag)

  if (siblings.size === 0) {
    return tags.includes(tag) ? tags : [...tags, tag]
  }

  return [...tags.filter((item) => !siblings.has(item)), tag]
}

export function guideSlotsForDepth(depth: number) {
  return Array.from({ length: Math.min(depth, MAX_GUIDE_DEPTH) }, (_, index) => index)
}

export function stageTagTreeRows(
  nextRows: VisibleTagTreeRow[],
  previousRows: AnimatedTagTreeRow[],
): AnimatedTagTreeRow[] {
  const previousByTag = new Map(previousRows.map((row) => [row.tag, row]))
  const nextTags = new Set(nextRows.map((row) => row.tag))

  const stagedRows: AnimatedTagTreeRow[] = nextRows.map((row) => {
    const previous = previousByTag.get(row.tag)
    const alreadyVisible =
      previous &&
      previous.animationState !== 'entering' &&
      previous.animationState !== 'removing'

    return {
      ...row,
      animationState: alreadyVisible ? undefined : 'entering',
    }
  })

  const survivorIndex = new Map(stagedRows.map((row, index) => [row.tag, index]))
  const inserts: Array<{ at: number; row: AnimatedTagTreeRow }> = []
  let lastSurvivorIndex = -1

  for (const previousRow of previousRows) {
    if (nextTags.has(previousRow.tag)) {
      lastSurvivorIndex = survivorIndex.get(previousRow.tag) ?? lastSurvivorIndex
      continue
    }

    inserts.push({
      at: lastSurvivorIndex + 1,
      row: { ...previousRow, animationState: 'removing' },
    })
  }

  if (inserts.length === 0) {
    return stagedRows
  }

  inserts.sort((a, b) => a.at - b.at)

  const rowsWithRemovals: AnimatedTagTreeRow[] = []
  let insertIndex = 0

  for (let rowIndex = 0; rowIndex <= stagedRows.length; rowIndex++) {
    while (insertIndex < inserts.length && inserts[insertIndex].at === rowIndex) {
      rowsWithRemovals.push(inserts[insertIndex].row)
      insertIndex++
    }

    if (rowIndex < stagedRows.length) {
      rowsWithRemovals.push(stagedRows[rowIndex])
    }
  }

  return rowsWithRemovals
}
