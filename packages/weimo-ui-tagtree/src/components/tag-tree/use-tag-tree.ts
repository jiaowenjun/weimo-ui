import { useEffect, useMemo, useState } from 'react'

import {
  buildVisibleRows,
  collectSelectedAncestorTags,
  expandTagExclusive,
  TAG_TREE_ANIMATION_MS,
  stageTagTreeRows,
  toggleExpandedTag,
  type AnimatedTagTreeRow,
  type VisibleTagTreeRow,
} from './tag-tree-model'
import type { TagTreeProps } from './tag-tree'

export function useTagTree({
  accordion = true,
  defaultExpandedTags = [],
  expandedTags: expandedTagsProp,
  nodes,
  onExpandedTagsChange,
  onSelect,
  selectedTag,
}: Pick<
  TagTreeProps,
  | 'accordion'
  | 'defaultExpandedTags'
  | 'expandedTags'
  | 'nodes'
  | 'onExpandedTagsChange'
  | 'onSelect'
  | 'selectedTag'
>) {
  const [uncontrolledExpandedTags, setUncontrolledExpandedTags] =
    useState(defaultExpandedTags)
  const isControlled = expandedTagsProp !== undefined
  const explicitExpandedTags = isControlled ? expandedTagsProp : uncontrolledExpandedTags
  const selectedAncestorTags = useMemo(
    () => collectSelectedAncestorTags(nodes, selectedTag),
    [nodes, selectedTag],
  )
  const effectiveExpandedTags = useMemo(() => {
    return new Set([...explicitExpandedTags, ...selectedAncestorTags])
  }, [explicitExpandedTags, selectedAncestorTags])
  const rows = useMemo(
    () => buildVisibleRows(nodes, effectiveExpandedTags, selectedTag),
    [effectiveExpandedTags, nodes, selectedTag],
  )
  const [renderedRows, setRenderedRows] = useState<AnimatedTagTreeRow[]>(
    () => rows,
  )

  function buildRowsForExpandedTags(nextTags: string[]) {
    const nextExpandedTags = new Set([...nextTags, ...selectedAncestorTags])

    return buildVisibleRows(nodes, nextExpandedTags, selectedTag)
  }

  useEffect(() => {
    let startEnterFrame = 0
    let clearEnterFrame = 0

    setRenderedRows((currentRows) => stageTagTreeRows(rows, currentRows))

    startEnterFrame = window.requestAnimationFrame(() => {
      clearEnterFrame = window.requestAnimationFrame(() => {
        setRenderedRows((currentRows) => {
          if (!currentRows.some((row) => row.animationState === 'entering')) {
            return currentRows
          }

          return currentRows.map((row) =>
            row.animationState === 'entering'
              ? { ...row, animationState: undefined }
              : row,
          )
        })
      })
    })

    const removalTimeout = window.setTimeout(() => {
      setRenderedRows((currentRows) => {
        if (!currentRows.some((row) => row.animationState === 'removing')) {
          return currentRows
        }

        return currentRows.filter((row) => row.animationState !== 'removing')
      })
    }, TAG_TREE_ANIMATION_MS)

    return () => {
      window.cancelAnimationFrame(startEnterFrame)
      window.cancelAnimationFrame(clearEnterFrame)
      window.clearTimeout(removalTimeout)
    }
  }, [rows])

  function commitExpandedTags(nextTags: string[]) {
    const nextRows = buildRowsForExpandedTags(nextTags)

    setRenderedRows((currentRows) => stageTagTreeRows(nextRows, currentRows))

    if (!isControlled) {
      setUncontrolledExpandedTags(nextTags)
    }

    onExpandedTagsChange?.(nextTags)
  }

  function handleToggle(row: VisibleTagTreeRow) {
    const isExpanding = !effectiveExpandedTags.has(row.tag)

    commitExpandedTags(
      accordion && isExpanding
        ? expandTagExclusive(explicitExpandedTags, row.tag, nodes)
        : toggleExpandedTag(explicitExpandedTags, row.tag),
    )
  }

  function handleSelect(row: VisibleTagTreeRow) {
    if (row.hasChildren) {
      if (row.selected) {
        // 已选中的节点再次点击:切换展开/折叠,语义与箭头按钮一致(含手风琴互斥)
        handleToggle(row)
      } else if (!effectiveExpandedTags.has(row.tag)) {
        commitExpandedTags(
          accordion
            ? expandTagExclusive(explicitExpandedTags, row.tag, nodes)
            : toggleExpandedTag(explicitExpandedTags, row.tag),
        )
      }
    }

    onSelect?.(row.tag, row.node)
  }

  return {
    renderedRows,
    handleSelect,
    handleToggle,
  }
}
