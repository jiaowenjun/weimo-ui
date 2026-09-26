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
