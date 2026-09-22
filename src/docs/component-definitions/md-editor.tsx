import { ComponentPreviewCard } from '../../components/component-preview-card'
import type { ComponentDefinition } from '../component-docs'
import { ControlledMdEditorDemo } from './md-editor-demos'

export const mdEditorDefinition = {
  id: 'md-editor',
  summary: 'Tiptap Markdown 笔记编辑器，支持完整编辑态',
  status: 'Preview',
  frame: 'plain',
  preview: () => (
    <ComponentPreviewCard label="Markdown 编辑器">
      <ControlledMdEditorDemo />
    </ComponentPreviewCard>
  ),
} satisfies ComponentDefinition
