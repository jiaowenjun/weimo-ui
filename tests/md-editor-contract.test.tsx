import { Editor } from '@tiptap/core'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  normalizeCenteredQuoteSyntax,
  WEIMO_CENTERED_QUOTE_MARKER,
} from '../src/components/markdown-centered-quote'
import { formatEditorContent } from '../src/components/md-editor/md-editor-content-format'
import { createMdEditorExtensions } from '../src/components/md-editor/md-editor-extensions'
import { normalizeEditorMarkdown } from '../src/components/md-editor/md-editor-markdown'
import type { MdEditorHandle } from '../src/components/md-editor/md-editor-types'
import { MdEditor } from '../src/components/md-editor'

const editors: Editor[] = []

function createEditor(content: string) {
  const editor = new Editor({
    content,
    contentType: 'markdown',
    extensions: createMdEditorExtensions({
      getInteraction: () => ({ disabled: false }),
    }),
  })
  editors.push(editor)
  return editor
}

afterEach(() => {
  for (const editor of editors.splice(0)) editor.destroy()
})

describe('MdEditor markdown model', () => {
  it('normalizes empty placeholders, centered quotes, and parenthesized lists', () => {
    expect(normalizeEditorMarkdown('&nbsp;\n\n正文')).toBe('正文')

    const internalCenteredQuote = [
      `> ${WEIMO_CENTERED_QUOTE_MARKER}居中引用`,
      '> 适合署名、短诗和提醒',
    ].join('\n')
    expect(normalizeEditorMarkdown(internalCenteredQuote)).toBe(
      '>= 居中引用\n>= 适合署名、短诗和提醒',
    )

    expect(normalizeEditorMarkdown('（Ⅰ）第一项\n\n（Ⅱ）第二项')).toBe(
      '(I) 第一项\n\n(II) 第二项',
    )
  })

  it('round-trips structured lists, math, and standalone images through TipTap', () => {
    const source = [
      '（Ⅰ）若 $a=0$，求切线；',
      '',
      '（Ⅱ）若 $f(x)>0$ 恒成立。',
      '',
      '![Image](/ocr/images/example/assets/formula.jpg)',
    ].join('\n')
    const editor = createEditor(source)
    const document = editor.getJSON()
    const markdown = normalizeEditorMarkdown(editor.getMarkdown())

    expect(document.content?.[0]).toMatchObject({
      type: 'orderedList',
      attrs: { markerStyle: 'paren-upper-roman' },
    })
    expect(markdown).toContain('(I) 若 $a=0$，求切线；')
    expect(markdown).toContain('(II) 若 $f(x)>0$ 恒成立。')
    expect(markdown.match(/!\[/gu)).toHaveLength(1)

    const reloaded = createEditor(markdown)
    expect(JSON.parse(JSON.stringify(reloaded.getJSON()))).toEqual(
      JSON.parse(JSON.stringify(document)),
    )
  })

  it('preserves canonical LaTeX inside Markdown tables', () => {
    const source = [
      '| 行内公式 | 下标 |',
      '| :-: | :-: |',
      String.raw`| $\alpha$ | $x_{\alpha}$ |`,
    ].join('\n')
    const markdown = normalizeEditorMarkdown(createEditor(source).getMarkdown())

    expect(markdown).toContain(String.raw`$\alpha$`)
    expect(markdown).toContain(String.raw`$x_{\alpha}$`)
    expect(markdown).not.toContain(String.raw`$\\alpha$`)
    expect(markdown).toMatch(/\|\s*:-+:\s*\|\s*:-+:\s*\|/u)
  })

  it('formats through the editor transaction and keeps the change undoable', () => {
    const editor = createEditor('abc$f(x)$def')
    const before = editor.getJSON()
    const formatMarkdown = vi.fn((markdown: string) =>
      markdown.replace('abc$f(x)$def', 'abc $f(x)$ def'),
    )

    expect(formatEditorContent(editor, { focus: false, formatMarkdown })).toBe(true)
    expect(formatMarkdown).toHaveBeenCalledOnce()
    expect(editor.getMarkdown()).toBe('abc $f(x)$ def')
    expect(editor.commands.undo()).toBe(true)
    expect(editor.getJSON()).toEqual(before)
  })

  it('uses the shared centered-quote representation only inside the editor', () => {
    const authored = '>= 居中引用\n>= 第二行'
    const normalized = normalizeCenteredQuoteSyntax(authored)

    expect(normalized).toBe(`> ${WEIMO_CENTERED_QUOTE_MARKER}居中引用\n> 第二行`)
    expect(normalizeEditorMarkdown(normalized)).toBe(authored)
  })
})

describe('MdEditor public component', () => {
  it('exposes normalized Markdown through its handle and supports clear', async () => {
    const ref = createRef<MdEditorHandle>()
    const onChange = vi.fn()
    render(
      <MdEditor
        defaultValue={'>= 居中引用\n>= 第二行'}
        onChange={onChange}
        ref={ref}
      />,
    )

    await waitFor(() =>
      expect(ref.current?.getMarkdown().trimEnd()).toBe('>= 居中引用\n>= 第二行'),
    )
    await act(async () => ref.current?.clear())

    await waitFor(() => expect(ref.current?.getMarkdown()).toBe(''))
    expect(onChange).toHaveBeenCalledWith('')
  })

  it('tracks controlled values without emitting a synthetic change', async () => {
    const ref = createRef<MdEditorHandle>()
    const onChange = vi.fn()
    const { rerender } = render(<MdEditor onChange={onChange} ref={ref} value="First" />)

    await waitFor(() => expect(ref.current?.getMarkdown()).toBe('First'))
    rerender(<MdEditor onChange={onChange} ref={ref} value="Second" />)

    await waitFor(() => expect(ref.current?.getMarkdown()).toBe('Second'))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('routes Mod-S and Escape through the editor interaction contract', async () => {
    const onCancel = vi.fn()
    const onSave = vi.fn()
    render(
      <MdEditor
        defaultValue="Draft"
        onCancel={onCancel}
        onSave={onSave}
      />,
    )

    const editor = await waitFor(() => {
      const element = document.querySelector<HTMLElement>('.md-editor__content')
      expect(element).not.toBeNull()
      return element as HTMLElement
    })
    fireEvent.keyDown(editor, { ctrlKey: true, key: 's' })
    fireEvent.keyDown(editor, { key: 'Escape' })

    expect(onSave).toHaveBeenCalledWith('Draft')
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('keeps disabled state observable and blocks imperative mutations', async () => {
    const ref = createRef<MdEditorHandle>()
    const onChange = vi.fn()
    const { container } = render(
      <MdEditor defaultValue="Locked" disabled onChange={onChange} ref={ref} />,
    )

    await waitFor(() => expect(ref.current?.getMarkdown()).toBe('Locked'))
    expect(container.firstElementChild).toHaveAttribute('data-disabled', 'true')
    expect(container.querySelector('.md-editor__content')).toHaveAttribute(
      'contenteditable',
      'false',
    )

    await act(async () => ref.current?.clear())
    expect(ref.current?.getMarkdown()).toBe('Locked')
    expect(onChange).not.toHaveBeenCalled()
  })
})
