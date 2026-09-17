import { useLayoutEffect, useRef, useState } from 'react'

import { MdView, type MdViewHandle, type MdViewMode } from '../../components/md-view'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'
import { mdRenderSample } from './markdown-sample'

function MdViewDemo({
  initialMarkdown = mdRenderSample,
}: {
  initialMarkdown?: string
} = {}) {
  const [mode, setMode] = useState<MdViewMode>('view')
  const [markdown, setMarkdown] = useState(initialMarkdown)
  const mdViewRef = useRef<MdViewHandle | null>(null)
  const previewSurfaceRef = useRef<HTMLDivElement | null>(null)
  const [measuredContentHeight, setMeasuredContentHeight] = useState<number | null>(null)

  useLayoutEffect(() => {
    function updateMeasuredContentHeight() {
      const nextHeight = mdViewRef.current?.getContentHeight()
      setMeasuredContentHeight(
        typeof nextHeight === 'number' && Number.isFinite(nextHeight)
          ? Math.round(nextHeight)
          : null,
      )
    }

    updateMeasuredContentHeight()

    const previewSurface = previewSurfaceRef.current
    if (!previewSurface || typeof ResizeObserver === 'undefined') return

    const observer = new ResizeObserver(updateMeasuredContentHeight)
    observer.observe(previewSurface)

    return () => observer.disconnect()
  }, [markdown, mode])

  return (
    <div className="md-view-docs-preview">
      <div className="md-view-docs-preview__toolbar">
        <TextButton
          aria-label={mode === 'view' ? '切换到 MdView 编辑态' : '切换到 MdView 展示态'}
          onClick={() => setMode((current) => (current === 'view' ? 'edit' : 'view'))}
        >
          {mode === 'view' ? '切到编辑' : '切到展示'}
        </TextButton>
      </div>
      <div className="md-view-docs-preview__frame">
        <div className="md-view-docs-preview__measure" aria-live="polite">
          <span className="md-view-docs-preview__measure-label">内容高度</span>
          <output className="md-view-docs-preview__measure-value">
            {measuredContentHeight === null ? '--' : `${measuredContentHeight}px`}
          </output>
        </div>
        <div className="md-view-docs-preview__surface" ref={previewSurfaceRef}>
          <MdView
            ref={mdViewRef}
            editorBottomSafeArea={100}
            editorProps={{ placeholder: '写点什么...' }}
            mode={mode}
            onChange={setMarkdown}
            value={markdown}
          />
        </div>
        <div className="md-view-docs-preview__raw">
          <span className="md-view-docs-preview__raw-label">Markdown 原始内容</span>
          <pre className="md-view-docs-preview__raw-content">{markdown}</pre>
        </div>
      </div>
    </div>
  )
}

export const mdViewDefinition = {
  id: 'md-view',
  summary: '受控切换 Markdown 展示态和编辑态的内部组合组件',
  status: 'Preview',
  props: [
    { name: 'mode', type: "'view' | 'edit'", defaultValue: '-' },
    { name: 'value', type: 'string', defaultValue: '-' },
    { name: 'onChange', type: '(markdown: string) => void', defaultValue: '-' },
    { name: 'className', type: 'string', defaultValue: '-' },
    { name: 'editorBottomSafeArea', type: 'number | string', defaultValue: '100' },
    { name: 'renderProps', type: 'Omit<MdRenderProps, "content" | "className">', defaultValue: '-' },
    { name: 'editorProps', type: 'Omit<MdEditorProps, "value" | "onChange" | "className">', defaultValue: '-' },
  ],
  preview: () => <MdViewDemo />,
} satisfies ComponentDefinition
