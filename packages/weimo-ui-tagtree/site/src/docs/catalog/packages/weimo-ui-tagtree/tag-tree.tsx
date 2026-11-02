import { useState } from 'react'
import { CalendarDays, Folder, Hash } from 'lucide-react'

import { TagBread } from 'weimo-ui-tagtree/components/tag-bread'
import { TagTree, type TagTreeNode } from 'weimo-ui-tagtree/components/tag-tree'
import type { ComponentDefinition } from '../../component-docs'

/* 演示数据用中文路径(tag 即层级路径),面包屑分段与树节点标签同源,
 * 选中态才能在两个组件间双向同步;每个一级标签都带子级,
 * 手风琴的同级互斥才有展开的对手 */
const tagTreeDemoNodes: TagTreeNode[] = [
  {
    tag: '写作',
    label: '写作',
    icon: <Folder aria-hidden="true" />,
    itemCount: 42,
    children: [
      {
        tag: '写作/日记',
        label: '日记',
        icon: <CalendarDays aria-hidden="true" />,
        itemCount: 30,
        children: [
          { tag: '写作/日记/晨间', label: '晨间', itemCount: 18 },
          { tag: '写作/日记/夜读', label: '夜读', itemCount: 12 },
        ],
      },
      {
        tag: '写作/灵感',
        label: '灵感',
        itemCount: 12,
        children: [{ tag: '写作/灵感/碎片', label: '碎片', itemCount: 12 }],
      },
    ],
  },
  {
    tag: '研究',
    label: '研究',
    itemCount: 7,
    children: [
      {
        tag: '研究/论文',
        label: '论文',
        itemCount: 5,
        children: [
          { tag: '研究/论文/已发表', label: '已发表', itemCount: 2 },
          { tag: '研究/论文/草稿', label: '草稿', itemCount: 3 },
        ],
      },
      { tag: '研究/摘录', label: '摘录', itemCount: 2 },
    ],
  },
  {
    tag: '归档',
    label: '归档',
    children: [
      { tag: '归档/2025', label: '2025' },
      { tag: '归档/2024', label: '2024' },
    ],
  },
]

function TagTreeDemo() {
  // 初始选中一级标签:深路径选中会把祖先链强制展开,手风琴就折叠不下来
  const [selectedTag, setSelectedTag] = useState('写作')

  return (
    <div className="tag-page__canvas">
      <TagBread tag={selectedTag} onSelect={setSelectedTag} />
      <div className="tag-page__tree-panel">
        <TagTree
          defaultExpandedTags={['写作']}
          defaultIcon={<Hash aria-hidden="true" />}
          nodes={tagTreeDemoNodes}
          onMenuAction={() => {}}
          onSelect={setSelectedTag}
          selectedTag={selectedTag}
        />
      </div>
    </div>
  )
}

export const tagTreeDefinition = {
  id: 'tag-tree',
  summary: '支持展开、选中和节点操作菜单的层级标签导航,手风琴模式下同级子树互斥展开',
  status: 'Ready',
  frame: 'plain',
  preview: () => <TagTreeDemo />,
} satisfies ComponentDefinition
