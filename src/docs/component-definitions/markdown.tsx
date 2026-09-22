import { useLayoutEffect, useRef, useState } from 'react'

import { MdRender } from '../../components/md-render'
import {
  MathEditor,
  type MathEditorValue,
} from '../../components/md-editor/math-editor'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import { MdView, type MdViewHandle, type MdViewMode } from '../../components/md-view'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

import { ControlledMdEditorDemo } from './md-editor-demos'
import { mdRenderSample } from './markdown-sample'

function MathEditorDemo({
  error,
  initialDialog = { kind: 'block', latex: '\\\\int_0^1 x^2 dx' },
}: {
  error?: string
  initialDialog?: MathEditorValue
}) {
  const [dialog, setDialog] = useState<MathEditorValue | null>(null)

  return (
    <ComponentPreviewCard label="公式编辑器">
      <div className="internal-dialog-preview">
        <TextButton onClick={() => setDialog(initialDialog)} type="button">
          打开公式对话框
        </TextButton>
        <MathEditor
          dialog={dialog}
          error={error}
          onOpenChange={(open) => {
            if (!open) setDialog(null)
          }}
          onSave={() => setDialog(null)}
        />
      </div>
    </ComponentPreviewCard>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
function MdEditorDemo() {
  return (
    <ComponentPreviewCard label="Markdown 编辑器">
      <ControlledMdEditorDemo />
    </ComponentPreviewCard>
  )
}

function resizeSourceTextarea(textarea: HTMLTextAreaElement | null) {
  if (!textarea) return

  textarea.style.height = 'auto'
  textarea.style.height = `${textarea.scrollHeight}px`
}

function MdRenderPreview() {
  const [markdown, setMarkdown] = useState(mdRenderSample)
  const sourceTextareaRef = useRef<HTMLTextAreaElement | null>(null)

  useLayoutEffect(() => {
    resizeSourceTextarea(sourceTextareaRef.current)
  }, [markdown])

  return (
    <ComponentPreviewCard label="Markdown 渲染">
      <div className="md-render-docs-preview">
        <section className="md-render-docs-preview__source" aria-labelledby="md-render-source-label">
          <label className="md-render-docs-preview__pane-label" htmlFor="md-render-source">
            Markdown 原文
          </label>
          <div className="md-render-docs-preview__pane">
            <textarea
              aria-label="编辑 MdRender Markdown 原文"
              className="md-render-docs-preview__textarea"
              id="md-render-source"
              onChange={(event) => {
                setMarkdown(event.target.value)
                resizeSourceTextarea(event.currentTarget)
              }}
              ref={sourceTextareaRef}
              spellCheck={false}
              value={markdown}
            />
          </div>
        </section>
        <section className="md-render-docs-preview__result" aria-labelledby="md-render-result-label">
          <span className="md-render-docs-preview__pane-label" id="md-render-result-label">
            实时渲染结果
          </span>
          <div className="md-render-docs-preview__pane">
            <MdRender
              aria-label="MdRender 预览"
              className="md-render-docs-preview__rendered"
              content={markdown}
            />
          </div>
        </section>
      </div>
    </ComponentPreviewCard>
  )
}

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
    <ComponentPreviewCard label="Markdown 视图">
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
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function MarkdownDemo() {
  return (
    <>
      <MathEditorDemo error="请输入 LaTeX 源码。" />
      <MdEditorDemo />
      <MdRenderPreview />
      <MdViewDemo />
    </>
  )
}

export const markdownDefinition = {
  id: 'markdown',
  summary: '公式编辑器、Markdown 编辑器、渲染与视图的 Markdown 总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'MathEditor',
    'MdEditor',
    'MdRender',
    'MdView',
    '公式编辑器',
    'Markdown 编辑器',
    'Markdown 渲染',
    'Markdown 视图',
  ],
  preview: () => <MarkdownDemo />,
} satisfies ComponentDefinition
