import { useState } from 'react'
import { Plus } from 'lucide-react'

import { TagBar } from 'weimo-ui-card/components/tag-bar'
import { TagPicker, type TagPickerApplyPayload, type TagPickerMode } from 'weimo-ui-card/components/tag-picker'
import { EditableCapsule } from 'weimo-ui-card/components/editable-capsule'
import { CapsuleButton } from 'weimo-ui-core/components/capsule-button'
import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import type { ComponentDefinition } from '../../component-docs'
import { PreviewToggle } from '../../../components/preview-toggle'

const tagOptions = [
  '工作/项目', '写作/日记', '研究/论文', '生活/灵感', '阅读/摘录',
  '学习/笔记', '旅行/见闻', '健康/运动', '美食/烹饪', '音乐/收藏',
  '电影/影评', '摄影/作品', '设计/草图', '编程/开发', '投资/理财',
  '育儿/家庭', '人际/社交', '情绪/反思', '目标/计划', '杂项/待整理',
]

function TagPickerDemo() {
  const [open, setOpen] = useState(false)
  const [tagSlots, setTagSlots] = useState(['写作/日记', ''])
  const [activeSlotIndex, setActiveSlotIndex] = useState(0)
  const [pickerMode, setPickerMode] = useState<TagPickerMode>('insert')
  const selectedTags = tagSlots.filter(Boolean)
  const activeTag = tagSlots[activeSlotIndex] ?? ''

  function openTagPicker(index: number) {
    const tag = tagSlots[index] ?? ''
    setActiveSlotIndex(index)
    setPickerMode(tag ? 'update' : 'insert')
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
      if (nextSlots.length === 0 || nextSlots[nextSlots.length - 1]) nextSlots.push('')
      return nextSlots
    })
  }

  return (
    <ComponentPreviewCard label="标签选择器">
      <div aria-label="TagPicker preview" className="tag-picker-preview">
        <div className="tag-picker-preview__panel">
          <div className="tag-picker-preview__tags" aria-label="笔记标签">
            {tagSlots.map((tag, index) => tag ? (
              <CapsuleButton key={`${tag}-${index}`} onClick={() => openTagPicker(index)} state="frosted">{tag}</CapsuleButton>
            ) : (
              <CapsuleButton key={`new-${index}`} onClick={() => openTagPicker(index)} prefix={<Plus aria-hidden="true" />} state="frosted">标签</CapsuleButton>
            ))}
          </div>
          <p className="tag-picker-preview__result">
            {selectedTags.length > 0 ? `已选：${selectedTags.join('、')}` : '尚未选择标签'}
          </p>
        </div>
        <TagPicker
          initialDraft={activeTag}
          mode={pickerMode}
          onApply={handleApply}
          onOpenChange={setOpen}
          open={open}
          selectedTags={selectedTags}
          tagOptions={tagOptions}
          targetTag={activeTag}
        />
      </div>
    </ComponentPreviewCard>
  )
}

function TagBarDemo() {
  const [editable, setEditable] = useState(false)
  const [tags, setTags] = useState(['写作/日记', '研究/论文'])

  return (
    <ComponentPreviewCard
      action={
        <PreviewToggle
          ariaLabel="切换编辑态"
          checked={editable}
          label={editable ? '编辑态' : '展示态'}
          onCheckedChange={setEditable}
        />
      }
     
      label="标签栏"
    >
      <div aria-label="TagBar preview" className="tag-bar-preview">
        <div className="tag-bar-preview__panel">
          <TagBar editable={editable} onTagsChange={setTags} tagOptions={tagOptions} tags={tags} />
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

function EditableCapsuleDemo() {
  const [editable, setEditable] = useState(false)

  return (
    <ComponentPreviewCard
      action={
        <PreviewToggle
          ariaLabel="切换编辑态"
          checked={editable}
          label={editable ? '编辑态' : '展示态'}
          onCheckedChange={setEditable}
        />
      }
      align="center"
      label="可编辑胶囊"
    >
      <div aria-label="EditableCapsule preview">
        <EditableCapsule editable={editable}>写作/日记</EditableCapsule>
      </div>
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
function TagBarPageDemo() {
  return (
    <>
      <TagPickerDemo />
      <TagBarDemo />
      <EditableCapsuleDemo />
    </>
  )
}

export const tagBarDefinition = {
  id: 'tag-bar',
  summary: '卡片标签栏与插入/编辑/拣选三态的标签选择器',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'TagBar',
    'TagPicker',
    'EditableCapsule',
    '标签栏',
    '标签选择器',
    '可编辑胶囊',
  ],
  preview: () => <TagBarPageDemo />,
} satisfies ComponentDefinition
