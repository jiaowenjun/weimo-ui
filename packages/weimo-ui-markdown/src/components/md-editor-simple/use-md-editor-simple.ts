import { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor } from '@tiptap/react'
import type { Editor, JSONContent } from '@tiptap/core'

import type { MdEditorFocusPosition } from '../md-editor/md-editor-types'
import { focusEditor } from '../md-editor/use-md-editor'
import { createMdEditorSimpleExtensions } from './md-editor-simple-extensions'

export type MdEditorSimpleContent = JSONContent

export type UseMdEditorSimpleProps = {
  autoFocus?: boolean
  autoFocusPosition?: MdEditorFocusPosition
  defaultValue?: MdEditorSimpleContent
  disabled?: boolean
  onCancel?: () => void
  onChange?: (content: MdEditorSimpleContent) => void
  onEditorChange?: (editor: Editor | null) => void
  onSave?: (content: MdEditorSimpleContent) => void
  placeholder?: string
  value?: MdEditorSimpleContent
}

const EMPTY_SIMPLE_DOCUMENT: MdEditorSimpleContent = {
  type: 'doc',
  content: [{ type: 'paragraph' }],
}

function serializeContent(content: MdEditorSimpleContent) {
  return JSON.stringify(content)
}

export function useMdEditorSimple({
  autoFocus = false,
  autoFocusPosition = 'end',
  defaultValue,
  disabled = false,
  onCancel,
  onChange,
  onEditorChange,
  onSave,
  placeholder,
  value,
}: UseMdEditorSimpleProps) {
  const isControlled = value !== undefined
  const [initialValue] = useState(() => value ?? defaultValue)
  const [isEmpty, setIsEmpty] = useState(initialValue === undefined)
  const [internalValue, setInternalValue] = useState(initialValue)
  const onChangeRef = useRef(onChange)
  const onEditorChangeRef = useRef(onEditorChange)
  const onSaveRef = useRef(onSave)
  const onCancelRef = useRef(onCancel)
  const disabledRef = useRef(disabled)
  const lastContentRef = useRef(initialValue === undefined ? '' : serializeContent(initialValue))
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

  const emitContent = useCallback(
    (nextContent: MdEditorSimpleContent, nextIsEmpty: boolean) => {
      lastContentRef.current = serializeContent(nextContent)
      setIsEmpty(nextIsEmpty)

      if (!isControlled) {
        setInternalValue(nextContent)
      }

      onChangeRef.current?.(nextContent)
    },
    [isControlled],
  )

  const editor = useEditor({
    extensions: createMdEditorSimpleExtensions({
      placeholder,
      getInteraction: interactionStore.get,
    }),
    content: initialValue,
    editable: !disabled,
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'md-editor__content weimo-markdown-content tiptap',
      },
    },
    onCreate: ({ editor: currentEditor }) => {
      lastContentRef.current = serializeContent(currentEditor.getJSON())
      setIsEmpty(currentEditor.isEmpty)
    },
    onUpdate: ({ editor: currentEditor }) => {
      emitContent(currentEditor.getJSON(), currentEditor.isEmpty)
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

    const nextContent = value ?? EMPTY_SIMPLE_DOCUMENT
    const serialized = serializeContent(nextContent)

    if (serialized === lastContentRef.current) return

    editor.commands.setContent(nextContent, {
      emitUpdate: false,
    })

    lastContentRef.current = serialized
    setIsEmpty(editor.isEmpty)
  }, [editor, isControlled, value])

  const getContent = useCallback(() => {
    if (!editor) return internalValue ?? EMPTY_SIMPLE_DOCUMENT

    return editor.getJSON()
  }, [editor, internalValue])

  const clear = useCallback(() => {
    if (!editor || disabled) return

    editor.commands.clearContent()
    emitContent(editor.getJSON(), editor.isEmpty)
  }, [disabled, editor, emitContent])

  const focus = useCallback((position?: MdEditorFocusPosition) => {
    if (disabled) return

    if (editor) focusEditor(editor, position)
  }, [disabled, editor])

  return {
    editor,
    clear,
    focus,
    getContent,
    isEmpty,
  }
}
