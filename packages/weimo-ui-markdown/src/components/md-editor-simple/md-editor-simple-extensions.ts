import { Extension } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { Marked, marked } from 'marked'

import { CenteredQuote } from '../md-editor/md-editor-centered-quote'
import { MdEditorListItem } from '../md-editor/md-editor-ordered-list'
import { SaveKeymap, type MdEditorInteractionContext } from '../md-editor/md-editor-save-keymap'

// marked 走私有实例:@tiptap/markdown 默认共享全局 marked 单例,任何全量
// 编辑器挂载都会把公式等 tokenizer 永久注册进去(无法注销),简化编辑器
// 若共用单例会把 $...$ tokenize 后因无 handler 整段丢弃。
//
// 预设只保留标题/加粗/居中/引用/无序列表五种格式,其余 CommonMark 语法
// (gfm:false 关不掉的)由以下兜底按「丢定界符留内容」或「字面回退」降级:
// 行内 token 无 handler 但带子 tokens 会自动递归保留文本(斜体/链接);
// 无子 tokens 的块级 token(代码块/有序列表/分隔线)必须显式兜底,否则
// parseFallbackToken 会连内容一起丢弃。

const PlainCodeSpanText = Extension.create({
  name: 'plainCodeSpanText',
  markdownTokenName: 'codespan',
  parseMarkdown: (token) => ({
    type: 'text' as const,
    text: typeof token.text === 'string' ? token.text : '',
  }),
})

const PlainCodeBlockText = Extension.create({
  name: 'plainCodeBlockText',
  markdownTokenName: 'code',
  parseMarkdown: (token) =>
    String(token.text ?? '')
      .replace(/\r\n|\r/g, '\n')
      .split('\n')
      .filter((line) => line.trim().length > 0)
      .map((line) => ({
        type: 'paragraph' as const,
        content: [{ type: 'text' as const, text: line }],
      })),
})

const PlainOrderedListText = Extension.create({
  name: 'plainOrderedListText',
  markdownTokenName: 'list',
  parseMarkdown: (token) => {
    if (!token.ordered) return []

    const paragraphs: { type: 'paragraph'; content: { type: 'text'; text: string }[] }[] = []

    for (const item of token.items ?? []) {
      for (const line of String(item.raw ?? '').split('\n')) {
        const text = line.trim()

        if (text.length === 0) continue

        paragraphs.push({
          type: 'paragraph',
          content: [{ type: 'text', text }],
        })
      }
    }

    return paragraphs
  },
})

const PlainHorizontalRuleText = Extension.create({
  name: 'plainHorizontalRuleText',
  markdownTokenName: 'hr',
  parseMarkdown: (token) => {
    const text = String(token.raw ?? '---').trim()

    return [
      {
        type: 'paragraph' as const,
        content: [{ type: 'text' as const, text }],
      },
    ]
  },
})

const PlainImageText = Extension.create({
  name: 'plainImageText',
  markdownTokenName: 'image',
  parseMarkdown: (token) => {
    const alt = typeof token.text === 'string' ? token.text : ''

    return alt.length > 0 ? [{ type: 'text' as const, text: alt }] : []
  },
})

export function createMdEditorSimpleExtensions(options: {
  placeholder?: string
  getInteraction: () => MdEditorInteractionContext
}): Extension[] {
  return [
    StarterKit.configure({
      code: false,
      codeBlock: false,
      horizontalRule: false,
      italic: false,
      link: false,
      listItem: false,
      orderedList: false,
      strike: false,
      underline: false,
    }),
    Markdown.configure({
      // @tiptap/markdown 把 marked 选项声明成全局单例的类型(多出
      // getDefaults),私有实例运行时接口完全够用,这里仅做类型收敛。
      marked: new Marked() as unknown as typeof marked,
      markedOptions: { gfm: false },
    }),
    PlainCodeSpanText,
    PlainCodeBlockText,
    PlainOrderedListText,
    PlainHorizontalRuleText,
    PlainImageText,
    CenteredQuote,
    MdEditorListItem,
    Placeholder.configure({
      placeholder: options.placeholder ?? '',
    }),
    SaveKeymap.configure({
      getInteraction: options.getInteraction,
    }),
  ] as Extension[]
}
