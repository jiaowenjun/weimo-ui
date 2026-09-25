import { useState } from 'react'

import { MdRender } from '../../components/md-render'
import {
  MathEditor,
  type MathEditorValue,
} from '../../components/md-editor/math-editor'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import { MdView, type MdViewMode } from '../../components/md-view'
import { TextButton } from '../../components/text-button'
import { PreviewToggle } from '../preview-toggle'
import type { ComponentDefinition } from '../component-docs'

import { ControlledMdEditorDemo } from './md-editor-demos'
import { mdRenderSample } from './markdown-sample'

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

// eslint-disable-next-line react-refresh/only-export-components
function MdEditorDemo() {
  return (
    <ComponentPreviewCard label="Markdown 编辑器">
      <ControlledMdEditorDemo />
    </ComponentPreviewCard>
  )
}

function MdRenderPreview() {
  return (
    <ComponentPreviewCard label="Markdown 渲染">
      <MdRender aria-label="MdRender 预览" content={mdRenderSample} />
    </ComponentPreviewCard>
  )
}

function MdViewDemo() {
  const [mode, setMode] = useState<MdViewMode>('view')
  const [markdown, setMarkdown] = useState(mdRenderSample)

  return (
    <ComponentPreviewCard
      action={
        <PreviewToggle
          ariaLabel="MdView 编辑模式"
          checked={mode === 'edit'}
          label={mode === 'edit' ? '编辑' : '展示'}
          onCheckedChange={(checked) => setMode(checked ? 'edit' : 'view')}
        />
      }
      label="Markdown 视图"
    >
      <div className="md-view-docs-preview">
        <div className="md-view-docs-preview__frame">
          <div className="md-view-docs-preview__surface">
            <MdView
              editorBottomSafeArea={100}
              editorProps={{ placeholder: '写点什么...' }}
              mode={mode}
              onChange={setMarkdown}
              value={markdown}
            />
          </div>
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function MarkdownDemo() {
  return (
    <>
      <MathEditorDemo error="请输入 LaTeX 源码。" />
      <MdEditorDemo />
      <MdRenderPreview />
      <MdViewDemo />
    </>
  )
}

export const markdownDefinition = {
  id: 'markdown',
  summary: '公式编辑器、Markdown 编辑器、渲染与视图的 Markdown 总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'MathEditor',
    'MdEditor',
    'MdRender',
    'MdView',
    '公式编辑器',
    'Markdown 编辑器',
    'Markdown 渲染',
    'Markdown 视图',
  ],
  preview: () => <MarkdownDemo />,
} satisfies ComponentDefinition
