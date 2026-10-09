import { useState } from 'react'
import { useEditorState } from '@tiptap/react'
import type { Editor, JSONContent } from '@tiptap/core'
import { List } from 'lucide-react'

import { GhostIconButton } from 'weimo-ui-core/components/ghost-icon-button'
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

// Docs definitions intentionally colocate preview components with exported page metadata.
function MdEditorSimpleDemo() {
  const [content, setContent] = useState<JSONContent>(mdEditorSimpleSample)
  const [editor, setEditor] = useState<Editor | null>(null)
  const bulletListActive =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) =>
        currentEditor?.isActive('bulletList') ?? false,
    }) ?? false

  return (
    <ComponentPreviewCard
      action={
        <GhostIconButton
          active={bulletListActive}
          aria-label="切换无序列表"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          size="sm"
        >
          <List />
        </GhostIconButton>
      }
      label="简化Markdown编辑器"
    >
      <div className="md-editor-docs-preview">
        <MdEditorSimple
          onChange={setContent}
          onEditorChange={setEditor}
          placeholder="写点什么..."
          value={content}
        />
      </div>
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
