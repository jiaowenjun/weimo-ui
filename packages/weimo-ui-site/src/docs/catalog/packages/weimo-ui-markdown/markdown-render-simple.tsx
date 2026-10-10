import { MdRenderSimple } from 'weimo-ui-markdown/components/md-render-simple'
import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import type { ComponentDefinition } from '../../component-docs'

import {
  MarkdownSimpleStylePreview,
  markdownSimpleStyleSearchAliases,
} from './markdown-styles'
import { mdRenderSimpleSample } from '../../fixtures/markdown-sample'

function MdRenderSimplePreview() {
  return (
    <ComponentPreviewCard label="简化Markdown渲染">
      <MdRenderSimple aria-label="MdRenderSimple 预览" content={mdRenderSimpleSample} />
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
function MarkdownRenderSimpleDemo() {
  return (
    <>
      <MdRenderSimplePreview />
      <MarkdownSimpleStylePreview />
    </>
  )
}

export const markdownRenderSimpleDefinition = {
  id: 'markdown-render-simple',
  summary: 'MdRenderSimple 简化渲染效果与常用 Markdown 样式 token 总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'MdRenderSimple',
    '简化Markdown渲染',
    ...markdownSimpleStyleSearchAliases,
  ],
  preview: () => <MarkdownRenderSimpleDemo />,
} satisfies ComponentDefinition
