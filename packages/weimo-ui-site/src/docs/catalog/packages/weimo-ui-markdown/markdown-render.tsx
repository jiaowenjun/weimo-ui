import { MdRender } from 'weimo-ui-markdown/components/md-render'
import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import type { ComponentDefinition } from '../../component-docs'

import {
  MarkdownStylePreview,
  markdownStyleSearchAliases,
} from './markdown-styles'
import { mdRenderSample } from '../../fixtures/markdown-sample'

function MdRenderPreview() {
  return (
    <ComponentPreviewCard label="Markdown 渲染">
      <MdRender aria-label="MdRender 预览" content={mdRenderSample} />
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
function MarkdownRenderDemo() {
  return (
    <>
      <MdRenderPreview />
      <MarkdownStylePreview />
    </>
  )
}

export const markdownRenderDefinition = {
  id: 'markdown-render',
  summary: 'MdRender 渲染效果与全部 Markdown 样式 token 总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'MdRender',
    'Markdown 渲染',
    ...markdownStyleSearchAliases,
  ],
  preview: () => <MarkdownRenderDemo />,
} satisfies ComponentDefinition
