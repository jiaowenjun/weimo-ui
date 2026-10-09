import { useState } from 'react'

import { MdEditorSimple } from 'weimo-ui-markdown/components/md-editor-simple'
import { ComponentPreviewCard } from 'weimo-ui-card/components/component-preview-card'
import type { ComponentDefinition } from '../../component-docs'

import { mdRenderSimpleSample } from '../../fixtures/markdown-sample'

function ControlledMdEditorSimpleDemo() {
  const [markdown, setMarkdown] = useState(mdRenderSimpleSample)

  return (
    <div className="md-editor-docs-preview">
      <MdEditorSimple
        onChange={setMarkdown}
        placeholder="写点什么..."
        value={markdown}
      />
    </div>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
function MdEditorSimpleDemo() {
  return (
    <ComponentPreviewCard label="简化Markdown编辑器">
      <ControlledMdEditorSimpleDemo />
    </ComponentPreviewCard>
  )
}

function MarkdownEditSimpleDemo() {
  return <MdEditorSimpleDemo />
}

export const markdownEditSimpleDefinition = {
  id: 'markdown-edit-simple',
  summary: 'MdEditorSimple 简化编辑器，无公式、表格与行内代码',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'MdEditorSimple',
    '简化Markdown编辑',
    '简化Markdown编辑器',
  ],
  preview: () => <MarkdownEditSimpleDemo />,
} satisfies ComponentDefinition
