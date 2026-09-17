import { useState } from 'react'

import { ChipButton } from '../../components/chip-button'
import {
  TagPicker,
  type TagPickerApplyPayload,
  type TagPickerMode,
} from '../../components/tag-picker'
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

function TagPickerDemo({
  initialDraft = '',
  mode = 'insert',
  targetTag = '',
}: {
  initialDraft?: string
  mode?: TagPickerMode
  targetTag?: string
} = {}) {
  const [open, setOpen] = useState(false)
  const [tagSlots, setTagSlots] = useState(['写作/日记', ''])
  const [activeSlotIndex, setActiveSlotIndex] = useState(0)
  const [pickerMode, setPickerMode] = useState<TagPickerMode>(mode)

  const selectedTags = tagSlots.filter(Boolean)
  const activeTag = tagSlots[activeSlotIndex] ?? ''

  function openTagPicker(index: number) {
    const tag = tagSlots[index] ?? ''
    setActiveSlotIndex(index)
    setPickerMode(mode === 'pick' ? 'pick' : tag ? 'update' : 'insert')
    setOpen(true)
  }

  function handleApply(payload: TagPickerApplyPayload) {
    setTagSlots((slots) => {
      const nextSlots = [...slots]
      if (payload.mode === 'insert') {
        nextSlots[activeSlotIndex] = payload.draft
        nextSlots.push('')
        return nextSlots
      }

      const nextTag = payload.selectedTags[activeSlotIndex] ?? ''
      if (nextTag) nextSlots[activeSlotIndex] = nextTag
      else nextSlots.splice(activeSlotIndex, 1)
      if (nextSlots.length === 0 || nextSlots[nextSlots.length - 1]) {
        nextSlots.push('')
      }
      return nextSlots
    })
  }

  return (
    <div className="tag-picker-preview">
      <div className="tag-picker-preview__panel">
        <div className="tag-picker-preview__tags" aria-label="笔记标签">
          {tagSlots.map((tag, index) => (
            tag ? (
              <ChipButton key={`${tag}-${index}`} onClick={() => openTagPicker(index)}>
                {tag}
              </ChipButton>
            ) : (
              <ChipButton key={`new-${index}`} onClick={() => openTagPicker(index)} prefix="+">
                标签
              </ChipButton>
            )
          ))}
        </div>
      </div>
      <TagPicker
        initialDraft={activeTag || initialDraft}
        mode={pickerMode}
        onApply={handleApply}
        onOpenChange={setOpen}
        open={open}
        selectedTags={selectedTags}
        tagOptions={tagOptions}
        targetTag={activeTag || targetTag}
      />
    </div>
  )
}

export const tagPickerDefinition = {
  id: 'tag-picker',
  summary: '复刻 Skyline 标签选择器的 Dialog 组件，支持新增、替换和选择已有标签',
  status: 'Ready',
  preview: () => <TagPickerDemo />,
} satisfies ComponentDefinition
