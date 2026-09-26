import { useEffect, useMemo, useState } from 'react'

import {
  buildVisibleRows,
  collectSelectedAncestorTags,
  TAG_TREE_ANIMATION_MS,
  stageTagTreeRows,
  toggleExpandedTag,
  type AnimatedTagTreeRow,
  type VisibleTagTreeRow,
} from './tag-tree-model'
import type { TagTreeProps } from './tag-tree'

export function useTagTree({
  defaultExpandedTags = [],
  expandedTags: expandedTagsProp,
  nodes,
  onExpandedTagsChange,
  onSelect,
  selectedTag,
}: Pick<
  TagTreeProps,
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
    commitExpandedTags(toggleExpandedTag(explicitExpandedTags, row.tag))
  }

  function handleSelect(row: VisibleTagTreeRow) {
    if (row.hasChildren && !effectiveExpandedTags.has(row.tag)) {
      commitExpandedTags(toggleExpandedTag(explicitExpandedTags, row.tag))
    }

    onSelect?.(row.tag, row.node)
  }

  return {
    renderedRows,
    handleSelect,
    handleToggle,
  }
}
