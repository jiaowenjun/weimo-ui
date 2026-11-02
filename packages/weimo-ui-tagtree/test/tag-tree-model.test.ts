import { describe, expect, it } from 'vitest'

import {
  buildVisibleRows,
  collectSelectedAncestorTags,
  expandTagExclusive,
  toggleExpandedTag,
  type TagTreeNode,
} from '../src/components/tag-tree/tag-tree-model'

const nodes: TagTreeNode[] = [
  {
    tag: 'root',
    children: [
      {
        tag: 'root/child',
        children: [{ tag: 'root/child/leaf' }],
      },
    ],
  },
]

describe('tag tree model', () => {
  it('collects selected ancestors and exposes expanded rows', () => {
    expect([...collectSelectedAncestorTags(nodes, 'root/child/leaf')]).toEqual([
      'root/child',
      'root',
    ])

    expect(
      buildVisibleRows(nodes, new Set(['root', 'root/child']), 'root/child/leaf').map(
        ({ tag, depth, selected }) => ({ tag, depth, selected }),
      ),
    ).toEqual([
      { tag: 'root', depth: 0, selected: false },
      { tag: 'root/child', depth: 1, selected: false },
      { tag: 'root/child/leaf', depth: 2, selected: true },
    ])
  })

  it('toggles an expanded tag without mutating the input', () => {
    const expanded = ['root']

    expect(toggleExpandedTag(expanded, 'root')).toEqual([])
    expect(toggleExpandedTag(expanded, 'other')).toEqual(['root', 'other'])
    expect(expanded).toEqual(['root'])
  })
})

describe('accordion expansion', () => {
  const tree: TagTreeNode[] = [
    {
      tag: 'a',
      children: [{ tag: 'a/x', children: [{ tag: 'a/x/1' }] }, { tag: 'a/y' }],
    },
    { tag: 'b', children: [{ tag: 'b/x' }] },
  ]

  it('collapses only the siblings at the same level when expanding', () => {
    expect(expandTagExclusive(['a', 'a/x'], 'a/y', tree)).toEqual(['a', 'a/y'])
    // 深层展开不影响顶层:a、b 均保留,仅 a/x、a/y 互斥
    expect(expandTagExclusive(['a', 'a/y', 'b'], 'a/x', tree)).toEqual([
      'a',
      'b',
      'a/x',
    ])
  })

  it('keeps descendant expansion of collapsed siblings', () => {
    // 折叠 a 时,a/x 的展开状态保留在数组中(父节点重开时恢复)
    expect(expandTagExclusive(['a', 'a/x'], 'b', tree)).toEqual(['a/x', 'b'])
  })

  it('falls back to a plain expand for tags outside the tree', () => {
    expect(expandTagExclusive(['a'], 'missing', tree)).toEqual(['a', 'missing'])
    expect(expandTagExclusive(['a', 'missing'], 'missing', tree)).toEqual([
      'a',
      'missing',
    ])
  })

  it('does not mutate the input', () => {
    const expanded = ['a', 'a/x']

    expandTagExclusive(expanded, 'a/y', tree)

    expect(expanded).toEqual(['a', 'a/x'])
  })
})
