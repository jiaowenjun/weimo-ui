import type { Editor } from '@tiptap/core'
import type {
  MarkdownImageRenderer,
  MarkdownImageSrcResolver,
} from '../markdown-image-renderer'

export type MdEditorFormatContentOptions = {
  formatMarkdown?: (markdown: string) => string
}

export type MdEditorHandle = {
  focus: () => void
  clear: () => void
  convertSelectionToInlineMath: () => boolean
  formatContent: (options?: MdEditorFormatContentOptions) => string
  getMarkdown: () => string
  getContentHeight: () => number
}

export type MdEditorProps = {
  value?: string
  defaultValue?: string
  onChange?: (markdown: string) => void
  onSave?: (markdown: string) => void
  onCancel?: () => void
  onEditorChange?: (editor: Editor | null) => void
  onContentHeightChange?: (height: number) => void
  renderImage?: MarkdownImageRenderer
  resolveImageSrc?: MarkdownImageSrcResolver
  placeholder?: string
  disabled?: boolean
  autoFocus?: boolean
  autoFocusPosition?: 'start' | 'end'
  className?: string
  editorClassName?: string
}
