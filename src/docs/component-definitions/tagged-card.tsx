import { useState } from 'react'
import type { ReactNode } from 'react'

import { Card } from '../../components/card'
import type { CardDraft, CardProps } from '../../components/card'
import { CardComposer } from '../../components/card-composer'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import type { ComponentDefinition } from '../component-docs'

import { mdRenderSample } from './markdown-sample'

const editableTagOptions = ['笔记', '设计', 'weimo', '灵感', '数学']

const composerTagOptions = ['笔记', '草稿', '灵感', 'weimo']

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

function CardComposerDemo() {
  const [note, setNote] = useState({
    content: '',
    createdAtText: '刚刚',
    tags: [] as string[],
  })

  return (
    <ComponentPreviewCard label="新建草稿壳层">
      <div className="card-composer-docs-preview">
        <CardComposer
          clientId="docs-card-composer"
          initialMode="edit"
          labels={{ placeholder: '写点什么...' }}
          note={note}
          onSave={(draft) => {
            setNote((current) => applyDraftToNote(current, draft))
          }}
          tagOptions={composerTagOptions}
        />
      </div>
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function TaggedCardDemo() {
  return (
    <>
      <CardDemo />
      <CardComposerDemo />
    </>
  )
}

export const taggedCardDefinition = {
  id: 'tagged-card',
  summary: '笔记卡片与新建草稿壳层的带标签卡片总览',
  status: 'Preview',
  frame: 'plain',
  searchAliases: [
    'Card',
    'CardComposer',
    '笔记卡片',
    '新建草稿壳层',
  ],
  preview: () => <TaggedCardDemo />,
} satisfies ComponentDefinition

void (null as unknown as ReactNode)
void (null as unknown as CardProps)
