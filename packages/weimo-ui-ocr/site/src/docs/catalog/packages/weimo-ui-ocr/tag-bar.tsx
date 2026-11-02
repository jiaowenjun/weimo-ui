import { useState } from 'react'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { TagBar } from 'weimo-ui-ocr/components/tag-bar'

import type { ComponentDefinition } from '../../component-docs'
import { ocrTagOptions } from './samples'

function TagBarDemo() {
  const [tags, setTags] = useState<string[]>(['OCR', '票据'])

  return (
    <ComponentPreviewCard label="标签栏(可编辑 / 只读可点)">
      <div className="tag-bar-docs-preview">
        <div className="tag-bar-docs-preview__row">
          <span className="tag-bar-docs-preview__label">可编辑</span>
          <TagBar
            editable
            onTagsChange={setTags}
            tagOptions={ocrTagOptions}
            tags={tags}
          />
        </div>
        <div className="tag-bar-docs-preview__row">
          <span className="tag-bar-docs-preview__label">只读可点</span>
          <TagBar
            isTagClickEnabled={(tag) => tag !== '待校对'}
            onTagClick={(tag) => {
              window.alert(`点击标签: ${tag}`)
            }}
            tags={tags}
          />
        </div>
        <div className="tag-bar-docs-preview__row">
          <span className="tag-bar-docs-preview__label">禁用</span>
          <TagBar disabled editable tags={tags} />
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

export const tagBarDefinition = {
  id: 'tag-bar',
  summary: '标签栏:胶囊展示 + 就地增删改,内置 TagPicker 弹层选标签;随 weimo-ui-ocr 自 card 包迁入。',
  status: 'Ready',
  frame: 'plain',
  preview: () => <TagBarDemo />,
} satisfies ComponentDefinition
