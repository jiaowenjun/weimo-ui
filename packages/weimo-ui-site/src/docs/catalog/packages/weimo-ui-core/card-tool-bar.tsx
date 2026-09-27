import { useState } from 'react'
import { Heading1, List, Quote } from 'lucide-react'

import { CardTopBar } from 'weimo-ui-core/components/card-top-bar'
import { CardToolBar } from 'weimo-ui-core/components/card-tool-bar'
import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { Button } from 'weimo-ui-core/components/coss/button'
import { Toolbar, ToolbarButton, ToolbarGroup } from 'weimo-ui-core/components/coss/toolbar'
import { TextButton } from 'weimo-ui-core/components/text-button'
import type { ComponentDefinition } from '../../component-docs'

function CardToolBarDemo() {
  const [saveDisabled, setSaveDisabled] = useState(false)

  return (
    <ComponentPreviewCard label="卡片工具栏">
      <div
        aria-label="CardToolBar preview"
        className="internal-card-tool-bar-preview"
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
      <div aria-label="CardTopBar preview" className="internal-card-top-bar-preview">
        <div className="internal-card-top-bar-preview__surface">
          {editing ? (
            <CardTopBar
              editTitle="编辑笔记"
              mode="edit"
              onCancel={exitEdit}
            />
          ) : (
            <CardTopBar
              createdAtText="今天 14:06"
              mode="display"
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

function CardBarDemo() {
  return (
    <>
      <CardToolBarDemo />
      <CardTopBarDemo />
    </>
  )
}

export const cardToolBarDefinition = {
  id: 'card-tool-bar',
  summary: '卡片编辑流程的底部工具栏与展示/编辑顶部栏',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'CardToolBar',
    'CardTopBar',
    '卡片工具栏',
    '卡片顶部栏',
  ],
  preview: () => <CardBarDemo />,
} satisfies ComponentDefinition
