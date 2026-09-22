import { useState } from 'react'
import type { ReactNode } from 'react'

import { CardComposer } from '../../components/card-composer'
import type { CardDraft, CardProps } from '../../components/card'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import type { ComponentDefinition } from '../component-docs'

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

export const cardComposerDefinition = {
  id: 'card-composer',
  summary: '用于新建草稿的 Card 组合壳层，复用 Card 编辑态与高度过渡',
  status: 'Preview',
  frame: 'plain',
  preview: () => <CardComposerDemo />,
} satisfies ComponentDefinition

void (null as unknown as ReactNode)
void (null as unknown as CardProps)
