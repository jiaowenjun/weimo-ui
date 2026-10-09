import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor } from '@tiptap/react'

import { normalizeCenteredQuoteSyntax } from '../markdown/centered-quote'
import { normalizeEditorMarkdown } from '../md-editor/md-editor-markdown'
import type { MdEditorFocusPosition, MdEditorProps } from '../md-editor/md-editor-types'
import {
  focusEditor,
  normalizeMarkdown,
  resolveInitialContent,
} from '../md-editor/use-md-editor'
import { createMdEditorSimpleExtensions } from './md-editor-simple-extensions'

export function useMdEditorSimple({
  autoFocus = false,
  autoFocusPosition = 'end',
  defaultValue = '',
  disabled = false,
  onCancel,
  onChange,
  onEditorChange,
  onSave,
  placeholder,
  value,
}: Pick<
  MdEditorProps,
  | 'autoFocus'
  | 'autoFocusPosition'
  | 'defaultValue'
  | 'disabled'
  | 'onCancel'
  | 'onChange'
  | 'onEditorChange'
  | 'onSave'
  | 'placeholder'
  | 'value'
>) {
  const isControlled = value !== undefined
  const [initialValue] = useState(() => value ?? defaultValue)
  const { hasInitialContent, initialContent } = resolveInitialContent(initialValue)
  const [isEmpty, setIsEmpty] = useState(!hasInitialContent)
  const [internalValue, setInternalValue] = useState(initialValue)
  const onChangeRef = useRef(onChange)
  const onEditorChangeRef = useRef(onEditorChange)
  const onSaveRef = useRef(onSave)
  const onCancelRef = useRef(onCancel)
  const disabledRef = useRef(disabled)
  const lastMarkdownRef = useRef(normalizeEditorMarkdown(initialValue))
  const [interactionStore] = useState(() => ({
    get: () => ({
      disabled: disabledRef.current,
      onSave: onSaveRef.current,
      onCancel: onCancelRef.current,
    }),
  }))

  useEffect(() => {
    onChangeRef.current = onChange
    onEditorChangeRef.current = onEditorChange
    onSaveRef.current = onSave
    onCancelRef.current = onCancel
    disabledRef.current = disabled
  }, [disabled, onCancel, onChange, onEditorChange, onSave])

  const emitMarkdown = useCallback(
    (nextMarkdown: string) => {
      const normalized = normalizeEditorMarkdown(nextMarkdown)

      lastMarkdownRef.current = normalized
      setIsEmpty(normalized.length === 0)

      if (!isControlled) {
        setInternalValue(normalized)
      }

      onChangeRef.current?.(normalized)
    },
    [isControlled],
  )

  const editor = useEditor({
    extensions: createMdEditorSimpleExtensions({
      placeholder,
      getInteraction: interactionStore.get,
    }),
    content: initialContent,
    contentType: hasInitialContent ? 'markdown' : undefined,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'md-editor__content weimo-markdown-content tiptap',
      },
    },
    onCreate: ({ editor: currentEditor }) => {
      const nextMarkdown = currentEditor.isEmpty ? '' : currentEditor.getMarkdown()

      lastMarkdownRef.current = normalizeEditorMarkdown(nextMarkdown)
      setIsEmpty(currentEditor.isEmpty)
    },
    onUpdate: ({ editor: currentEditor }) => {
      emitMarkdown(currentEditor.isEmpty ? '' : currentEditor.getMarkdown())
    },
  })

  useEffect(() => {
    onEditorChangeRef.current?.(editor)

    return () => onEditorChangeRef.current?.(null)
  }, [editor])

  useEffect(() => {
    if (!editor) return

    editor.setEditable(!disabled, false)
  }, [disabled, editor])

  useEffect(() => {
    if (!autoFocus || !editor) return

    focusEditor(editor, autoFocusPosition)
  }, [autoFocus, autoFocusPosition, editor])

  useEffect(() => {
    if (!editor || !isControlled) return

    const nextValue = normalizeMarkdown(value ?? '')

    if (nextValue === lastMarkdownRef.current) return

    if (nextValue.length === 0) {
      editor.commands.clearContent(false)
    } else {
      editor.commands.setContent(normalizeCenteredQuoteSyntax(nextValue), {
        contentType: 'markdown',
        emitUpdate: false,
      })
    }

    lastMarkdownRef.current = nextValue
    setIsEmpty(nextValue.length === 0)
  }, [editor, isControlled, value])

  const getMarkdown = useCallback(() => {
    if (!editor) return normalizeMarkdown(isControlled ? value ?? '' : internalValue)

    return editor.isEmpty ? '' : normalizeEditorMarkdown(editor.getMarkdown())
  }, [editor, internalValue, isControlled, value])

  const clear = useCallback(() => {
    if (!editor || disabled) return

    editor.commands.clearContent()
    emitMarkdown('')
  }, [disabled, editor, emitMarkdown])

  const focus = useCallback((position?: MdEditorFocusPosition) => {
    if (disabled) return

    if (editor) focusEditor(editor, position)
  }, [disabled, editor])

  return {
    editor,
    clear,
    focus,
    getMarkdown,
    isEmpty,
  }
}
