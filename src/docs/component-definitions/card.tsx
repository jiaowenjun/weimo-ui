import { useState } from 'react'

import { Card } from '../../components/card'
import type { CardDraft } from '../../components/card'
import { ComponentPreviewCard } from '../../components/component-preview-card'
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
    <ComponentPreviewCard label="笔记卡片">
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
    </ComponentPreviewCard>
  )
}

export const cardDefinition = {
  id: 'card',
  summary: '内部管理展示态与编辑态的 v2 笔记卡片',
  status: 'Preview',
  frame: 'plain',
  preview: () => <CardDemo />,
} satisfies ComponentDefinition
