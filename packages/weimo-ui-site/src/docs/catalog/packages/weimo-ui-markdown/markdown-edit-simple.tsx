import { useState } from 'react'
import { useEditorState } from '@tiptap/react'
import type { Editor, JSONContent } from '@tiptap/core'
import { Heading1, List, Quote } from 'lucide-react'

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

// 标题/无序列表/引用互斥切换，语义对齐全量编辑器工具栏（MdEditorToolbar）。
type SimpleParagraphFormat = 'heading' | 'list' | 'quote'

function toggleSimpleParagraphFormat(editor: Editor, target: SimpleParagraphFormat) {
  if (target !== 'heading' && editor.isActive('heading', { level: 1 })) {
    editor.chain().focus().setParagraph().run()
  }

  if (target !== 'list' && editor.isActive('bulletList')) {
    editor.chain().focus().toggleBulletList().run()
  }

  if (target !== 'quote' && editor.isActive('blockquote')) {
    editor.chain().focus().unsetBlockquote().run()
  }

  if (target === 'heading') {
    if (editor.isActive('heading', { level: 1 })) {
      editor.chain().focus().setParagraph().run()
    } else {
      editor.chain().focus().setHeading({ level: 1 }).run()
    }
    return
  }

  if (target === 'list') {
    if (!editor.isActive('bulletList')) {
      editor.chain().focus().toggleBulletList().run()
    }
    return
  }

  if (!editor.isActive('blockquote')) {
    editor.chain().focus().toggleBlockquote().run()
  }
}

// Docs definitions intentionally colocate preview components with exported page metadata.
function MdEditorSimpleDemo() {
  const [content, setContent] = useState<JSONContent>(mdEditorSimpleSample)
  const [editor, setEditor] = useState<Editor | null>(null)
  const formatActive =
    useEditorState({
      editor,
      selector: ({ editor: currentEditor }) => {
        if (!currentEditor) return { heading: false, list: false, quote: false }

        const heading = currentEditor.isActive('heading', { level: 1 })
        const list = !heading && currentEditor.isActive('bulletList')

        return { heading, list, quote: !heading && !list && currentEditor.isActive('blockquote') }
      },
    }) ?? { heading: false, list: false, quote: false }

  return (
    <ComponentPreviewCard
      action={
        <>
          <GhostIconButton
            active={formatActive.heading}
            aria-label="切换标题"
            onClick={() => editor && toggleSimpleParagraphFormat(editor, 'heading')}
            size="sm"
          >
            <Heading1 />
          </GhostIconButton>
          <GhostIconButton
            active={formatActive.list}
            aria-label="切换无序列表"
            onClick={() => editor && toggleSimpleParagraphFormat(editor, 'list')}
            size="sm"
          >
            <List />
          </GhostIconButton>
          <GhostIconButton
            active={formatActive.quote}
            aria-label="切换引用"
            onClick={() => editor && toggleSimpleParagraphFormat(editor, 'quote')}
            size="sm"
          >
            <Quote />
          </GhostIconButton>
        </>
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
  summary: 'MdEditorSimple 简化编辑器，tiptap JSON 内容进出，仅四种格式',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'MdEditorSimple',
    '简化Markdown编辑',
    '简化Markdown编辑器',
  ],
  preview: () => <MarkdownEditSimpleDemo />,
} satisfies ComponentDefinition
