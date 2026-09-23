import { useState } from 'react'
import type { ReactNode } from 'react'
import { Heading1, List, Quote } from 'lucide-react'

import { Card } from '../../components/card'
import type { CardDraft, CardProps } from '../../components/card'
import { CardComposer } from '../../components/card-composer'
import { CardTopBar } from '../../components/card-top-bar'
import { CardToolBar } from '../../components/card-tool-bar'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import { Button } from '../../components/coss/button'
import { Toolbar, ToolbarButton, ToolbarGroup } from '../../components/coss/toolbar'
import { TextButton } from '../../components/text-button'
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

function CardToolBarDemo() {
  const [saveDisabled, setSaveDisabled] = useState(false)

  return (
    <ComponentPreviewCard label="卡片工具栏">
      <div
        className="internal-card-tool-bar-preview"
        aria-label="CardToolBar preview"
      >
        <div className="internal-card-tool-bar-preview__surface">
          <TextButton
            className="internal-card-tool-bar-preview__toggle"
            onClick={() => setSaveDisabled((current) => !current)}
          >
            {saveDisabled ? '启用保存' : '禁用保存'}
          </TextButton>
          <CardToolBar
            aria-label="卡片底部操作栏预览"
            saveDisabled={saveDisabled}
            saveLabel="保存"
            toolbarSlot={
              <Toolbar aria-label="Markdown 格式工具栏" className="md-editor__toolbar">
                <ToolbarGroup className="md-editor__toolbar-group">
                  <ToolbarButton
                    aria-label="标题"
                    className="md-editor__toolbar-button"
                    disabled
                    render={<Button variant="ghost" />}
                  >
                    <Heading1 />
                  </ToolbarButton>
                  <ToolbarButton
                    aria-label="列表"
                    className="md-editor__toolbar-button"
                    disabled
                    render={<Button variant="ghost" />}
                  >
                    <List />
                  </ToolbarButton>
                  <ToolbarButton
                    aria-label="引用"
                    className="md-editor__toolbar-button"
                    disabled
                    render={<Button variant="ghost" />}
                  >
                    <Quote />
                  </ToolbarButton>
                </ToolbarGroup>
              </Toolbar>
            }
          />
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

function CardTopBarDemo() {
  const [mode, setMode] = useState<'display' | 'edit'>('display')
  const editing = mode === 'edit'

  function enterEdit() {
    setMode('edit')
  }

  function exitEdit() {
    setMode('display')
  }

  return (
    <ComponentPreviewCard label="卡片顶部栏">
      <div className="internal-card-top-bar-preview" aria-label="CardTopBar preview">
        <div className="internal-card-top-bar-preview__surface">
          {editing ? (
            <CardTopBar
              mode="edit"
              editTitle="编辑笔记"
              onCancel={exitEdit}
            />
          ) : (
            <CardTopBar
              mode="display"
              createdAtText="今天 14:06"
              onAction={enterEdit}
            />
          )}
          <TextButton
            className="internal-card-top-bar-preview__toggle"
            onClick={() => {
              setMode((current) => (current === 'display' ? 'edit' : 'display'))
            }}
          >
            {editing ? '切换到展示态' : '切换到编辑态'}
          </TextButton>
        </div>
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
      <CardToolBarDemo />
      <CardTopBarDemo />
    </>
  )
}

export const taggedCardDefinition = {
  id: 'tagged-card',
  summary: '笔记卡片、新建草稿壳层、卡片工具栏与卡片顶部栏总览',
  status: 'Preview',
  frame: 'plain',
  searchAliases: [
    'Card',
    'CardComposer',
    'CardToolBar',
    'CardTopBar',
    '笔记卡片',
    '新建草稿壳层',
    '卡片工具栏',
    '卡片顶部栏',
  ],
  preview: () => <TaggedCardDemo />,
} satisfies ComponentDefinition

void (null as unknown as ReactNode)
void (null as unknown as CardProps)
