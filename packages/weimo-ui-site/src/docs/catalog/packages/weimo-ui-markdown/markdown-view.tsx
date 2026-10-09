import { useState } from 'react'

import { LabeledSwitch } from 'weimo-ui-core/components/labeled-switch'
import { MdView, type MdViewMode } from 'weimo-ui-markdown/components/md-view'
import { ComponentPreviewCard } from 'weimo-ui-card/components/component-preview-card'
import type { ComponentDefinition } from '../../component-docs'

import { mdRenderSample } from '../../fixtures/markdown-sample'

function MdViewDemo() {
  const [mode, setMode] = useState<MdViewMode>('view')
  const [markdown, setMarkdown] = useState(mdRenderSample)

  return (
    <ComponentPreviewCard
      action={
        <LabeledSwitch
          ariaLabel="MdView 编辑模式"
          checked={mode === 'edit'}
          labelOff="展示"
          labelOn="编辑"
          onCheckedChange={(checked) => setMode(checked ? 'edit' : 'view')}
        />
      }
      label="Markdown 视图"
    >
      <div className="md-view-docs-preview">
        <MdView
          editorBottomSafeArea={100}
          editorProps={{ placeholder: '写点什么...' }}
          mode={mode}
          onChange={setMarkdown}
          preloadEditor
          value={markdown}
        />
      </div>
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
function MarkdownViewDemo() {
  return <MdViewDemo />
}

export const markdownViewDefinition = {
  id: 'markdown-view',
  summary: '展示与编辑双模式切换的 Markdown 视图',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'MdView',
    'Markdown 视图',
  ],
  preview: () => <MarkdownViewDemo />,
} satisfies ComponentDefinition
