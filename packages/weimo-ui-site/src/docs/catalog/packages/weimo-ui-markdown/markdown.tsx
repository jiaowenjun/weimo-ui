import { useState } from 'react'

import {
  MathEditor,
  type MathEditorValue,
} from 'weimo-ui-markdown/components/math-editor'
import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { TextButton } from 'weimo-ui-core/components/text-button'
import type { ComponentDefinition } from '../../component-docs'

import { ControlledMdEditorDemo } from './md-editor-demos'

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

// Docs definitions intentionally colocate preview components with exported page metadata.
function MarkdownDemo() {
  return (
    <>
      <MathEditorDemo error="请输入 LaTeX 源码。" />
      <MdEditorDemo />
    </>
  )
}

export const markdownDefinition = {
  id: 'markdown',
  summary: '公式编辑器与 Markdown 编辑器总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'MathEditor',
    'MdEditor',
    '公式编辑器',
    'Markdown 编辑器',
  ],
  preview: () => <MarkdownDemo />,
} satisfies ComponentDefinition
