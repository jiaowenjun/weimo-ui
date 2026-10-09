import { Editor } from '@tiptap/core'
import { act, fireEvent, render, waitFor } from '@testing-library/react'
import { createRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  normalizeCenteredQuoteSyntax,
  WEIMO_CENTERED_QUOTE_MARKER,
} from '../packages/weimo-ui-markdown/src/components/markdown/centered-quote'
import { formatEditorContent } from '../packages/weimo-ui-markdown/src/components/md-editor/md-editor-content-format'
import { createMdEditorExtensions } from '../packages/weimo-ui-markdown/src/components/md-editor/md-editor-extensions'
import { normalizeEditorMarkdown } from '../packages/weimo-ui-markdown/src/components/md-editor/md-editor-markdown'
import type { MdEditorHandle } from '../packages/weimo-ui-markdown/src/components/md-editor/md-editor-types'
import { MdEditor } from '../packages/weimo-ui-markdown/src/components/md-editor'
import { createMdEditorSimpleExtensions } from '../packages/weimo-ui-markdown/src/components/md-editor-simple/md-editor-simple-extensions'
import {
  MdEditorSimple,
  type MdEditorSimpleHandle,
} from '../packages/weimo-ui-markdown/src/components/md-editor-simple/md-editor-simple'

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

  it('keeps only heading, bold, centered quote, blockquote, and bullet lists in the simple preset', () => {
    const editor = new Editor({
      content: '行内 $x^2$ 公式与 `code` 标记',
      contentType: 'markdown',
      extensions: createMdEditorSimpleExtensions({
        getInteraction: () => ({ disabled: false }),
      }),
    })
    editors.push(editor)

    expect(editor.schema.nodes.heading).toBeDefined()
    expect(editor.schema.nodes.blockquote).toBeDefined()
    expect(editor.schema.nodes.bulletList).toBeDefined()
    expect(editor.schema.marks.bold).toBeDefined()

    expect(editor.schema.nodes.inlineMath).toBeUndefined()
    expect(editor.schema.nodes.blockMath).toBeUndefined()
    expect(editor.schema.nodes.table).toBeUndefined()
    expect(editor.schema.nodes.taskList).toBeUndefined()
    expect(editor.schema.nodes.orderedList).toBeUndefined()
    expect(editor.schema.nodes.codeBlock).toBeUndefined()
    expect(editor.schema.nodes.horizontalRule).toBeUndefined()
    expect(editor.schema.nodes.image).toBeUndefined()
    expect(editor.schema.marks.code).toBeUndefined()
    expect(editor.schema.marks.strike).toBeUndefined()
    expect(editor.schema.marks.italic).toBeUndefined()
    expect(editor.schema.marks.link).toBeUndefined()
    expect(editor.schema.marks.underline).toBeUndefined()
    expect(editor.getMarkdown()).toContain('$x^2$')
    expect(editor.getMarkdown()).not.toContain('`')
  })

  it('degrades unsupported syntax to plain or literal text in the simple preset', () => {
    const editor = new Editor({
      content: [
        '*斜体* 与 [链接](https://example.com) 与 ![替代文本](/img.png)',
        '',
        '1. 第一项',
        '2. 第二项',
        '',
        '```ts',
        'const answer = 42',
        '```',
        '',
        '---',
      ].join('\n'),
      contentType: 'markdown',
      extensions: createMdEditorSimpleExtensions({
        getInteraction: () => ({ disabled: false }),
      }),
    })
    editors.push(editor)

    const markdown = editor.getMarkdown()

    expect(markdown).toContain('斜体')
    expect(markdown).not.toContain('*斜体*')
    expect(markdown).toContain('链接')
    expect(markdown).not.toContain('https://example.com')
    expect(markdown).toContain('替代文本')
    expect(markdown).not.toContain('/img.png')
    expect(markdown).toContain('1. 第一项')
    expect(markdown).toContain('2. 第二项')
    expect(markdown).toContain('const answer = 42')
    expect(markdown).not.toContain('```')
    expect(markdown).toContain('---')
  })

  it('round-trips the five supported formats in the simple preset', () => {
    const source = [
      '# 标题',
      '',
      '**加粗** 正文',
      '',
      '> 引用内容',
      '',
      '>= 居中一行',
      '',
      '- 无序一项',
      '- 无序二项',
    ].join('\n')
    const editor = new Editor({
      content: normalizeCenteredQuoteSyntax(source),
      contentType: 'markdown',
      extensions: createMdEditorSimpleExtensions({
        getInteraction: () => ({ disabled: false }),
      }),
    })
    editors.push(editor)

    const markdown = normalizeEditorMarkdown(editor.getMarkdown())
    const reloaded = new Editor({
      content: normalizeCenteredQuoteSyntax(markdown),
      contentType: 'markdown',
      extensions: createMdEditorSimpleExtensions({
        getInteraction: () => ({ disabled: false }),
      }),
    })
    editors.push(reloaded)

    expect(markdown).toContain('# 标题')
    expect(markdown).toContain('**加粗**')
    expect(markdown).toContain('> 引用内容')
    expect(markdown).toContain('>= 居中一行')
    expect(markdown).toContain('- 无序一项')
    expect(JSON.parse(JSON.stringify(reloaded.getJSON()))).toEqual(
      JSON.parse(JSON.stringify(editor.getJSON())),
    )
  })

  it('falls GFM tables and task lists back to literal text in the simple preset', () => {
    const editor = new Editor({
      content: ['| a | b |', '| --- | --- |', '| 1 | 2 |', '', '- [ ] 任务'].join('\n'),
      contentType: 'markdown',
      extensions: createMdEditorSimpleExtensions({
        getInteraction: () => ({ disabled: false }),
      }),
    })
    editors.push(editor)

    expect(editor.state.doc.textContent).toContain('a')
    expect(editor.state.doc.textContent).toContain('任务')
    expect(editor.getMarkdown()).toContain('任务')
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

  it('renders MdEditorSimple without math, table, or inline-code DOM', async () => {
    const ref = createRef<MdEditorSimpleHandle>()
    const onChange = vi.fn()
    render(
      <MdEditorSimple
        defaultValue={'$x^2$ 与 `code`\n\n| a | b |\n| --- | --- |\n| 1 | 2 |'}
        onChange={onChange}
        ref={ref}
      />,
    )

    await waitFor(() => expect(ref.current?.getMarkdown()).toContain('$x^2$'))

    const content = document.querySelector('.md-editor__content')

    expect(content).not.toBeNull()
    expect(content?.querySelector('table')).toBeNull()
    expect(content?.querySelector('code')).toBeNull()
    expect(content?.querySelector('.katex')).toBeNull()
    expect(content?.querySelector('em')).toBeNull()
    expect(content?.querySelector('a')).toBeNull()
    expect(content?.querySelector('img')).toBeNull()
    expect(ref.current?.getMarkdown()).not.toContain('`')
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

  it('avoids stale focus transactions when Safari flushes editor changes synchronously', async () => {
    const originalUserAgent = window.navigator.userAgent
    let activeEditor: Editor | null = null
    let flushedDuringFocus = false

    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15',
    })
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus').mockImplementation(function (
      this: HTMLElement,
    ) {
      if (
        flushedDuringFocus ||
        !activeEditor ||
        !this.classList.contains('md-editor__content')
      ) {
        return
      }

      flushedDuringFocus = true
      activeEditor.commands.insertContent('!')
    })

    try {
      const ref = createRef<MdEditorHandle>()
      const { rerender } = render(
        <MdEditor
          autoFocus={false}
          defaultValue="Draft"
          onEditorChange={(editor) => { activeEditor = editor }}
          ref={ref}
        />,
      )

      await waitFor(() => expect(activeEditor).not.toBeNull())
      rerender(
        <MdEditor
          autoFocus
          defaultValue="Draft"
          onEditorChange={(editor) => { activeEditor = editor }}
          ref={ref}
        />,
      )

      await waitFor(() => expect(ref.current?.getMarkdown()).toBe('Draft!'))
      expect(flushedDuringFocus).toBe(true)
    } finally {
      focusSpy.mockRestore()
      Object.defineProperty(window.navigator, 'userAgent', {
        configurable: true,
        value: originalUserAgent,
      })
    }
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
