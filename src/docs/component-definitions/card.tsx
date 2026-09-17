import { useState } from 'react'

import { Card } from '../../components/card'
import type { CardDraft } from '../../components/card'
import type { ComponentDefinition } from '../component-docs'
import { mdRenderSample } from './markdown-sample'

const editableTagOptions = ['笔记', '设计', 'weimo', '灵感', '数学']

function applyDraftToNote(
  current: { content: string; createdAtText: string; tags: string[] },
  draft: CardDraft,
) {
  return {
    ...current,
    content: draft.content,
    tags: draft.tags,
  }
}

function CardDemo() {
  const [note, setNote] = useState({
    content: mdRenderSample,
    createdAtText: '今天 14:06',
    tags: ['笔记', '设计', 'weimo'],
  })

  return (
    <div className="card-docs-preview">
      <Card
        note={note}
        onSave={(draft) => {
          setNote((current) => applyDraftToNote(current, draft))
        }}
        labels={{ placeholder: '写点什么...' }}
        tagOptions={editableTagOptions}
      />
    </div>
  )
}

export const cardDefinition = {
  id: 'card',
  summary: '内部管理展示态与编辑态的 v2 笔记卡片',
  status: 'Preview',
  props: [
    { name: 'note', type: 'CardNote', defaultValue: '-' },
    { name: 'onCancel', type: '() => void', defaultValue: '-' },
    { name: 'onDraftChange', type: '(draft: CardDraft) => void', defaultValue: '-' },
    { name: 'onDelete', type: '() => void', defaultValue: '-' },
    { name: 'onSave', type: '(draft: CardDraft) => void', defaultValue: '-' },
    { name: 'contentSlot', type: 'ReactNode', defaultValue: '-' },
    { name: 'displayActionSlot', type: 'ReactNode', defaultValue: '-' },
    { name: 'displayActionPrefixSlot', type: 'ReactNode', defaultValue: '-' },
    { name: 'saveDisabled', type: 'boolean', defaultValue: '-' },
    { name: 'editBehavior', type: 'CardEditBehavior', defaultValue: '-' },
    { name: 'tagOptions', type: 'string[]', defaultValue: '[]' },
    { name: 'isTagClickEnabled', type: '(tag: string) => boolean', defaultValue: '() => true' },
    { name: 'labels', type: 'CardLabels', defaultValue: '-' },
    { name: 'editor', type: 'CardEditorOptions', defaultValue: '-' },
    { name: 'initialEditAutoFocus', type: 'boolean', defaultValue: 'true' },
    { name: 'disabled', type: 'boolean', defaultValue: 'false' },
    {
      name: '...articleProps',
      type: 'Omit<ComponentPropsWithoutRef<"article">, "children" | "onChange">',
      defaultValue: '-',
    },
  ],
  preview: () => <CardDemo />,
} satisfies ComponentDefinition
