import { useState } from 'react'

import { TagBar } from '../../components/tag-bar'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

const tagOptions = [
  '工作/项目',
  '写作/日记',
  '研究/论文',
  '生活/灵感',
  '阅读/摘录',
  '学习/笔记',
  '旅行/见闻',
  '健康/运动',
  '美食/烹饪',
  '音乐/收藏',
  '电影/影评',
  '摄影/作品',
  '设计/草图',
  '编程/开发',
  '投资/理财',
  '育儿/家庭',
  '人际/社交',
  '情绪/反思',
  '目标/计划',
  '杂项/待整理',
]

function TagBarDemo() {
  const [editable, setEditable] = useState(false)
  const [tags, setTags] = useState(['写作/日记', '研究/论文'])

  return (
    <div className="tag-bar-preview">
      <div className="tag-bar-preview__panel">
        <TagBar
          editable={editable}
          onTagsChange={setTags}
          tagOptions={tagOptions}
          tags={tags}
        />
        <div className="tag-bar-preview__controls">
          <TextButton
            onClick={() => setEditable((currentEditable) => !currentEditable)}
          >
            {editable ? '切换到展示态' : '切换到编辑态'}
          </TextButton>
        </div>
      </div>
    </div>
  )
}

export const tagBarDefinition = {
  id: 'tag-bar',
  summary: '内部共享标签栏，可在展示态和编辑态之间切换',
  status: 'Preview',
  preview: () => <TagBarDemo />,
} satisfies ComponentDefinition
