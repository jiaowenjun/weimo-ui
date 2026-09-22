import { useLayoutEffect, useRef, useState } from 'react'

import { MdRender } from '../../components/md-render'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import type { ComponentDefinition } from '../component-docs'
import { mdRenderSample } from './markdown-sample'

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

export const mdRenderDefinition = {
  id: 'md-render',
  summary: '用于笔记正文的 Markdown、GFM 与数学公式预览',
  status: 'Ready',
  frame: 'plain',
  preview: () => <MdRenderPreview />,
} satisfies ComponentDefinition
