import { useState } from 'react'
import { Heading1, List, Quote } from 'lucide-react'

import { CardToolBar } from '../../components/card-tool-bar'
import { Button } from '../../components/coss/button'
import { Toolbar, ToolbarButton, ToolbarGroup } from '../../components/coss/toolbar'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

function CardToolBarDemo() {
  const [saveDisabled, setSaveDisabled] = useState(false)

  return (
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
  )
}

export const cardToolBarDefinition = {
  id: 'card-tool-bar',
  summary: '内部卡片工具栏，统一编辑工具栏与保存动作',
  status: 'Ready',
  preview: () => <CardToolBarDemo />,
} satisfies ComponentDefinition
