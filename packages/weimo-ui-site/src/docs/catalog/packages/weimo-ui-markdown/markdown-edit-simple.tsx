import { useState } from 'react'
import type { JSONContent } from '@tiptap/core'

import { MdEditorSimple } from 'weimo-ui-markdown/components/md-editor-simple'
import { ComponentPreviewCard } from 'weimo-ui-card/components/component-preview-card'
import type { ComponentDefinition } from '../../component-docs'

// 内容以 tiptap 原生 JSON 进出,编辑器不做任何 Markdown 解析与序列化。
const mdEditorSimpleSample: JSONContent = {
  type: 'doc',
  content: [
    {
      type: 'heading',
      attrs: { level: 1 },
      content: [{ type: 'text', text: '春夜' }],
    },
    {
      type: 'paragraph',
      content: [
        { type: 'text', text: '正文 ' },
        { type: 'text', marks: [{ type: 'bold' }], text: '粗体' },
        { type: 'text', text: ' 保持卡片阅读节奏。' },
      ],
    },
    {
      type: 'blockquote',
      content: [
        { type: 'paragraph', content: [{ type: 'text', text: '普通引用保持左对齐。' }] },
      ],
    },
    {
      type: 'bulletList',
      content: [
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '第一条' }] }],
        },
        {
          type: 'listItem',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: '第二条' }] }],
        },
      ],
    },
  ],
}

function ControlledMdEditorSimpleDemo() {
  const [content, setContent] = useState<JSONContent>(mdEditorSimpleSample)

  return (
    <div className="md-editor-docs-preview">
      <MdEditorSimple
        onChange={setContent}
        placeholder="写点什么..."
        value={content}
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
  summary: 'MdEditorSimple 简化编辑器，tiptap JSON 内容进出，仅五种格式',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'MdEditorSimple',
    '简化Markdown编辑',
    '简化Markdown编辑器',
  ],
  preview: () => <MarkdownEditSimpleDemo />,
} satisfies ComponentDefinition
