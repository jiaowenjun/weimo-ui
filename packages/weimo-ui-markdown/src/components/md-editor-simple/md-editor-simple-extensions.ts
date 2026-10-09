import { Extension } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { Marked, marked } from 'marked'

import type {
  MarkdownImageRenderer,
  MarkdownImageSrcResolver,
} from '../markdown/image-renderer'
import { CenteredQuote } from '../md-editor/md-editor-centered-quote'
import { AlphabeticOrderedListMarker } from '../md-editor/md-editor-extensions'
import { MarkdownImagePlaceholder } from '../md-editor/md-editor-image'
import { MdEditorListImageLayout } from '../md-editor/md-editor-list-image-layout'
import { MdEditorOptionGrid } from '../md-editor/md-editor-option-grid'
import {
  MdEditorListItem,
  MdEditorOrderedList,
  ParenthesizedOrderedListTokenizer,
} from '../md-editor/md-editor-ordered-list'
import { SaveKeymap, type MdEditorInteractionContext } from '../md-editor/md-editor-save-keymap'

// marked 走私有实例:@tiptap/markdown 默认共享全局 marked 单例,任何全量
// 编辑器挂载都会把公式等 tokenizer 永久注册进去(无法注销),简化编辑器
// 若共用单例会把 $...$ tokenize 后因无 handler 整段丢弃。
const PlainCodeSpanText = Extension.create({
  name: 'plainCodeSpanText',
  markdownTokenName: 'codespan',
  parseMarkdown: (token) => ({
    type: 'text' as const,
    text: typeof token.text === 'string' ? token.text : '',
  }),
})

// 预设对齐 MdRender simple 管线:去公式/表格/行内代码,连带 GFM 专属的
// 删除线与任务列表(strike/code mark 关闭 + marked gfm:false,管道表格与
// ~~删除线~~ 均按字面文本回退,codespan 降级为纯文本)。
export function createMdEditorSimpleExtensions(options: {
  placeholder?: string
  renderImage?: MarkdownImageRenderer
  resolveImageSrc?: MarkdownImageSrcResolver
  getInteraction: () => MdEditorInteractionContext
}): Extension[] {
  return [
    StarterKit.configure({
      code: false,
      strike: false,
      listItem: false,
      orderedList: false,
    }),
    Markdown.configure({
      // @tiptap/markdown 把 marked 选项声明成全局单例的类型(多出
      // getDefaults),私有实例运行时接口完全够用,这里仅做类型收敛。
      marked: new Marked() as unknown as typeof marked,
      markedOptions: { gfm: false },
    }),
    PlainCodeSpanText,
    CenteredQuote,
    AlphabeticOrderedListMarker,
    MdEditorOrderedList,
    MdEditorListItem,
    MdEditorListImageLayout,
    MdEditorOptionGrid,
    ParenthesizedOrderedListTokenizer,
    MarkdownImagePlaceholder.configure({
      renderImage: options.renderImage,
      resolveImageSrc: options.resolveImageSrc,
    }),
    Placeholder.configure({
      placeholder: options.placeholder ?? '',
    }),
    SaveKeymap.configure({
      getInteraction: options.getInteraction,
    }),
  ] as Extension[]
}
