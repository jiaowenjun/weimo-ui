import { PureEditorContent } from '@tiptap/react'
import { render, waitFor } from '@testing-library/react'
import { StrictMode, useLayoutEffect, useRef } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { MdView, type MdViewMode, type MdViewProps } from '../src/components/md-view'

afterEach(() => vi.restoreAllMocks())

function mockViewHeight() {
  const getComputedStyle = window.getComputedStyle.bind(window)
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudoElement) => {
    const style = getComputedStyle(element, pseudoElement)
    if (element.matches('.md-view')) {
      // jsdom has no layout. Model the editor's height, including its bottom safe area.
      Object.defineProperty(style, 'height', { value: '635.65625px' })
    }
    return style
  })
}

describe('MdView mode transitions', () => {
  it('releases entry protection when ready without requiring a caller readiness callback', async () => {
    mockViewHeight()
    const props: MdViewProps = { mode: 'view', value: '正文', editorProps: { autoFocus: false } }
    const { container, rerender } = render(<MdView {...props} />)
    const root = container.querySelector<HTMLElement>('.md-view')!

    rerender(<MdView {...props} mode="edit" />)
    expect(root.style.minHeight).toBe('635.65625px')
    await waitFor(() => {
      expect(root.querySelector('.md-editor__content')).not.toBeNull()
      expect(root.style.minHeight).toBe('')
    })
  })

  it('holds height throughout Tiptap teardown and releases it before parent layout measurement', async () => {
    mockViewHeight()
    const parentLayouts: { minHeight: string; hasRender: boolean }[] = []

    function Parent({ mode }: { mode: MdViewMode }) {
      const parentRef = useRef<HTMLDivElement>(null)
      useLayoutEffect(() => {
        if (mode !== 'view') return
        const root = parentRef.current!.querySelector<HTMLElement>('.md-view')!
        parentLayouts.push({
          minHeight: root.style.minHeight,
          hasRender: root.querySelector('.weimo-card-markdown') !== null,
        })
      }, [mode])
      return (
        <div ref={parentRef}>
          <MdView mode={mode} value={'正文 $x^2$\n\n| 字段 |\n| --- |\n| 内容 |'} editorProps={{ autoFocus: false }} />
        </div>
      )
    }

    const { container, rerender } = render(<StrictMode><Parent mode="edit" /></StrictMode>)
    await waitFor(() => expect(container.querySelector('.tiptap')).not.toBeNull())
    const root = container.querySelector<HTMLElement>('.md-view')!
    const displayLayouts: { minHeight: string; hasRender: boolean }[] = []
    vi.spyOn(root, 'getBoundingClientRect').mockImplementation(() => {
      displayLayouts.push({
        minHeight: root.style.minHeight,
        hasRender: root.querySelector('.weimo-card-markdown') !== null,
      })
      return new DOMRect(0, 0, 600, 635.65625)
    })
    const originalUnmount = PureEditorContent.prototype.componentWillUnmount
    const teardownHeights: string[] = []
    vi.spyOn(PureEditorContent.prototype, 'componentWillUnmount').mockImplementation(function (this: PureEditorContent) {
      teardownHeights.push(root.style.minHeight)
      originalUnmount.call(this)
      // Tiptap has moved the editable DOM out of the document at this point.
      expect(root.querySelector('.tiptap')).toBeNull()
      teardownHeights.push(root.style.minHeight)
    })

    rerender(<StrictMode><Parent mode="view" /></StrictMode>)

    expect(teardownHeights).toEqual(['635.65625px', '635.65625px'])
    expect(displayLayouts).toEqual([{ minHeight: '635.65625px', hasRender: true }])
    expect(parentLayouts).toEqual([{ minHeight: '', hasRender: true }])
    expect(root.style.minHeight).toBe('')
    expect(container.querySelector('.md-view')).toBe(root)
  })

  it('supports repeated toggles and preloading without leaving a height lock or changing the editor callbacks', async () => {
    mockViewHeight()
    const onEditorChange = vi.fn()
    const editorProps = { autoFocus: false, onEditorChange }
    const props: MdViewProps = { mode: 'view', preloadEditor: true, value: '正文', editorProps }
    const { container, rerender } = render(<MdView {...props} />)
    await waitFor(() => expect(container.querySelector('.tiptap')).not.toBeNull())
    const root = container.querySelector<HTMLElement>('.md-view')!
    const editor = container.querySelector('.tiptap')
    const instance = onEditorChange.mock.calls.at(-1)?.[0]
    expect(instance).toBeTruthy()

    for (let index = 0; index < 2; index += 1) {
      rerender(<MdView {...props} mode="edit" />)
      expect(root.style.minHeight).toBe('')
      expect(container.querySelector('.tiptap')).toBe(editor)
      expect(container.querySelector('.md-view__editor-layer')).not.toHaveAttribute('hidden')
      rerender(<MdView {...props} mode="view" />)
      expect(container.querySelector('.md-view__editor-layer')).toHaveAttribute('hidden')
      expect(root.style.minHeight).toBe('')
      expect(onEditorChange.mock.calls.at(-1)?.[0]).toBe(instance)
    }

    rerender(<MdView {...props} preloadEditor={false} />)
    expect(container.querySelector('.tiptap')).toBeNull()
    expect(onEditorChange.mock.calls.at(-1)?.[0]).toBeNull()
    expect(root.style.minHeight).toBe('')
  })
})
