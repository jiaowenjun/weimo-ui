import { useState } from 'react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import {
  MathEditor,
  type MathEditorValue,
} from '../../components/md-editor/math-editor'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

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

export const mathEditorDefinition = {
  id: 'math-editor',
  summary: 'MdEditor 内部公式编辑对话框，支持行内/块级 LaTeX 编辑和错误态',
  status: 'Ready',
  frame: 'plain',
  preview: () => <MathEditorDemo error="请输入 LaTeX 源码。" />,
} satisfies ComponentDefinition
