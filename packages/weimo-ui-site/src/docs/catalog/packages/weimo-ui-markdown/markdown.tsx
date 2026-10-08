import { useState } from 'react'

import {
  MathEditor,
  type MathEditorValue,
} from 'weimo-ui-markdown/components/math-editor'
import { ComponentPreviewCard } from 'weimo-ui-card/components/component-preview-card'
import { LabeledSwitch } from 'weimo-ui-core/components/labeled-switch'
import { MdView, type MdViewMode } from 'weimo-ui-markdown/components/md-view'
import { TextButton } from 'weimo-ui-core/components/text-button'
import type { ComponentDefinition } from '../../component-docs'

import { ControlledMdEditorDemo } from './md-editor-demos'
import { mdRenderSample } from '../../fixtures/markdown-sample'

function MathEditorDemo({
  error,
  initialDialog = { kind: 'block', latex: '\\\\int_0^1 x^2 dx' },
}: {
  error?: string
  initialDialog?: MathEditorValue
}) {
  const [dialog, setDialog] = useState<MathEditorValue | null>(null)

  return (
    <ComponentPreviewCard label="公式编辑器">
      <div className="internal-dialog-preview">
        <TextButton onClick={() => setDialog(initialDialog)} type="button">
          打开公式对话框
        </TextButton>
        <MathEditor
          dialog={dialog}
          error={error}
          onOpenChange={(open) => {
            if (!open) setDialog(null)
          }}
          onSave={() => setDialog(null)}
        />
      </div>
    </ComponentPreviewCard>
  )
}

function MdEditorDemo() {
  return (
    <ComponentPreviewCard label="Markdown 编辑器">
      <ControlledMdEditorDemo />
    </ComponentPreviewCard>
  )
}

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
          value={markdown}
        />
      </div>
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
function MarkdownDemo() {
  return (
    <>
      <MathEditorDemo error="请输入 LaTeX 源码。" />
      <MdEditorDemo />
      <MdViewDemo />
    </>
  )
}

export const markdownDefinition = {
  id: 'markdown',
  summary: '公式编辑器、Markdown 编辑器与视图的 Markdown 总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'MathEditor',
    'MdEditor',
    'MdView',
    '公式编辑器',
    'Markdown 编辑器',
    'Markdown 视图',
  ],
  preview: () => <MarkdownDemo />,
} satisfies ComponentDefinition
