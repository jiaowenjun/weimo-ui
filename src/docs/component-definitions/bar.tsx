import { useState } from 'react'
import { Check, Heading1, List, Plus, Quote, Search, X } from 'lucide-react'

import { BottomBar } from '../../components/bottom-bar'
import { CardToolBar } from '../../components/card-tool-bar'
import { CardTopBar } from '../../components/card-top-bar'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import { FloatBar } from '../../components/float-bar'
import { GlassIconButton } from '../../components/glass-icon-button'
import { GhostIconButton } from '../../components/ghost-icon-button'
import { Button } from '../../components/coss/button'
import { Toolbar, ToolbarButton, ToolbarGroup } from '../../components/coss/toolbar'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

function BottomBarDemo() {
  return (
    <ComponentPreviewCard label="底部操作栏">
      <div className="internal-bottom-preview" aria-label="BottomBar preview">
        <div className="internal-bottom-preview__surface">
          <p>正文区域</p>
          <BottomBar
            aria-label="底部操作栏预览"
            leftSlot={<span className="internal-preview__text">2 个标签待保存</span>}
            rightSlot={
              <span className="internal-preview__actions">
                <GhostIconButton aria-label="新增" size="sm">
                  <Plus />
                </GhostIconButton>
                <GlassIconButton aria-label="保存" size="sm">
                  <Check />
                </GlassIconButton>
              </span>
            }
          />
        </div>
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

function FloatBarDemo() {
  return (
    <ComponentPreviewCard label="浮动工具栏">
      <div className="internal-float-preview" aria-label="FloatBar preview">
        <FloatBar
          aria-label="浮动工具栏预览"
          leftSlot={<span className="internal-preview__text"># 写作</span>}
          centerSlot={<span className="internal-preview__title">编辑标签</span>}
          rightSlot={
            <span className="internal-preview__actions">
              <GhostIconButton aria-label="搜索" size="sm">
                <Search />
              </GhostIconButton>
              <GlassIconButton aria-label="确认" size="sm">
                <Check />
              </GlassIconButton>
              <GhostIconButton aria-label="关闭" size="sm">
                <X />
              </GhostIconButton>
            </span>
          }
        />
      </div>
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function BarDemo() {
  return (
    <>
      <FloatBarDemo />
      <BottomBarDemo />
      <CardToolBarDemo />
      <CardTopBarDemo />
    </>
  )
}

export const barDefinition = {
  id: 'bar',
  summary: '底部操作栏、卡片工具栏、卡片顶部栏与浮动工具栏总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'BottomBar',
    'CardToolBar',
    'CardTopBar',
    'FloatBar',
    '底部操作栏',
    '卡片工具栏',
    '卡片顶部栏',
    '浮动工具栏',
  ],
  preview: () => <BarDemo />,
} satisfies ComponentDefinition
