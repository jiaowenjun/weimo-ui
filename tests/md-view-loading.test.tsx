import { PureEditorContent } from '@tiptap/react'
import { act, render, waitFor } from '@testing-library/react'
import { StrictMode } from 'react'
import { afterEach, expect, it, vi } from 'vitest'

import { MdView, type MdViewMode } from '../src/components/md-view'

const moduleGate = vi.hoisted(() => {
  let resolve!: () => void
  const ready = new Promise<void>((done) => { resolve = done })
  return { ready, resolve }
})

vi.mock('../src/components/md-editor', async (importOriginal) => {
  await moduleGate.ready
  return importOriginal()
})

afterEach(() => vi.restoreAllMocks())

it('holds the display height through delayed loading and StrictMode initialization, including cancelled entry', async () => {
  const getComputedStyle = window.getComputedStyle.bind(window)
  vi.spyOn(window, 'getComputedStyle').mockImplementation((element, pseudoElement) => {
    const style = getComputedStyle(element, pseudoElement)
    if (element.matches('.md-view')) {
      Object.defineProperty(style, 'height', { value: '494.0625px' })
    }
    return style
  })

  const onEditorChange = vi.fn()
  const view = (mode: MdViewMode) => (
    <StrictMode>
      <MdView mode={mode} value="正文 $x^2$" editorProps={{ autoFocus: false, onEditorChange }} />
    </StrictMode>
  )
  const { container, rerender, unmount } = render(view('view'))
  const root = container.querySelector<HTMLElement>('.md-view')!
  root.style.minHeight = '80px'

  rerender(view('edit'))
  await act(async () => { await Promise.resolve() })
  expect(root.style.minHeight).toBe('494.0625px')
  expect(container.querySelector('.md-editor')).toBeNull()
  expect(container.querySelector('.weimo-card-markdown')).toBeNull()

  // Cancelling while the import is pending must release the original lock.
  rerender(view('view'))
  expect(root.style.minHeight).toBe('80px')
  expect(container.querySelector('.weimo-card-markdown')).not.toBeNull()
  rerender(view('edit'))
  expect(root.style.minHeight).toBe('494.0625px')

  const mount = PureEditorContent.prototype.componentDidMount
  const destroy = PureEditorContent.prototype.componentWillUnmount
  const initializationHeights: string[] = []
  vi.spyOn(PureEditorContent.prototype, 'componentDidMount').mockImplementation(function (this: PureEditorContent) {
    initializationHeights.push(root.style.minHeight)
    mount.call(this)
  })
  const teardown = vi.spyOn(PureEditorContent.prototype, 'componentWillUnmount').mockImplementation(function (this: PureEditorContent) {
    initializationHeights.push(root.style.minHeight)
    destroy.call(this)
  })

  await act(async () => { moduleGate.resolve() })
  await waitFor(() => {
    expect(root.querySelector('.md-editor__content')).not.toBeNull()
    expect(root.style.minHeight).toBe('80px')
  })
  expect(initializationHeights.length).toBeGreaterThan(1)
  expect(teardown).toHaveBeenCalled()
  expect(initializationHeights.every((height) => height === '494.0625px')).toBe(true)
  expect(onEditorChange.mock.calls.some(([editor]) => editor !== null)).toBe(true)
  expect(container.querySelector('.md-view')).toBe(root)

  unmount()
  await act(async () => { await Promise.resolve() })
  expect(onEditorChange.mock.calls.at(-1)?.[0]).toBeNull()
  expect(container).toBeEmptyDOMElement()
})
