import type { Editor } from '@tiptap/core'
import type { ComponentDefinition } from '../component-docs'
import { ControlledMdEditorDemo } from './md-editor-demos'

export const mdEditorDefinition = {
  id: 'md-editor',
  summary: 'Tiptap Markdown 笔记编辑器，支持完整编辑态',
  status: 'Preview',
  props: [
    { name: 'value', type: 'string', defaultValue: '-' },
    { name: 'defaultValue', type: 'string', defaultValue: "''" },
    { name: 'onChange', type: '(markdown: string) => void', defaultValue: '-' },
    { name: 'onSave', type: '(markdown: string) => void', defaultValue: '-' },
    { name: 'onCancel', type: '() => void', defaultValue: '-' },
    { name: 'onEditorChange', type: '(editor: Editor | null) => void', defaultValue: '-' } satisfies {
      name: string
      type: string
      defaultValue: string
      readonly __editor?: Editor | null
    },
    { name: 'placeholder', type: 'string', defaultValue: "''" },
    { name: 'disabled', type: 'boolean', defaultValue: 'false' },
    { name: 'autoFocus', type: 'boolean', defaultValue: 'false' },
    { name: 'ref', type: 'MdEditorHandle', defaultValue: '-' },
  ],
  preview: () => <ControlledMdEditorDemo />,
} satisfies ComponentDefinition
