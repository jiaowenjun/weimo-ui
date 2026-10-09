import { Extension } from '@tiptap/core'
import Placeholder from '@tiptap/extension-placeholder'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import TaskItem from '@tiptap/extension-task-item'
import TaskList from '@tiptap/extension-task-list'
import { Markdown } from '@tiptap/markdown'
import StarterKit from '@tiptap/starter-kit'
import { Marked, marked } from 'marked'

import type {
  MarkdownImageRenderer,
  MarkdownImageSrcResolver,
} from '../markdown/image-renderer'
import type { MdEditorVariant } from './md-editor-types'
import { CenteredQuote } from './md-editor-centered-quote'
import { MdEditorBlockMath } from './md-editor-block-math'
import { MarkdownImagePlaceholder } from './md-editor-image'
import { MdEditorInlineMath } from './md-editor-inline-math'
import { MdEditorListImageLayout } from './md-editor-list-image-layout'
import { MdEditorOptionGrid } from './md-editor-option-grid'
import { MdEditorTable } from './md-editor-table'
import {
  MdEditorListItem,
  MdEditorOrderedList,
  ParenthesizedOrderedListTokenizer,
} from './md-editor-ordered-list'
import { SaveKeymap, type MdEditorInteractionContext } from './md-editor-save-keymap'

const AlphabeticOrderedListMarker = Extension.create({
  name: 'alphabeticOrderedListMarker',

  addGlobalAttributes() {
    return [
      {
        types: ['orderedList'],
        attributes: {
          alphabeticMarker: {
            default: null,
            parseHTML: () => null,
            renderHTML: (attributes) => {
              const markerType = attributes.type

              return markerType === 'A' || markerType === 'a'
                ? { 'data-marker-type': markerType }
                : {}
            },
          },
        },
      },
    ]
  },
})

export type MdEditorMathClickPayload = {
  kind: 'inline' | 'block'
  latex: string
  pos: number
}

// simple 预设里 marked 走私有实例:@tiptap/markdown 默认共享全局 marked 单例,
// 任何全量编辑器挂载都会把公式等 tokenizer 永久注册进去(无法注销),简化
// 编辑器若共用单例会把 $...$ tokenize 后因无 handler 整段丢弃。
const PlainCodeSpanText = Extension.create({
  name: 'plainCodeSpanText',
  markdownTokenName: 'codespan',
  parseMarkdown: (token) => ({
    type: 'text' as const,
    text: typeof token.text === 'string' ? token.text : '',
  }),
})

export function createMdEditorExtensions(options: {
  placeholder?: string
  renderImage?: MarkdownImageRenderer
  resolveImageSrc?: MarkdownImageSrcResolver
  getInteraction: () => MdEditorInteractionContext
  onMathClick?: (payload: MdEditorMathClickPayload) => void
  variant?: MdEditorVariant
}): Extension[] {
  // simple 预设对齐 MdRender simple 管线:去公式/表格/行内代码,连带
  // GFM 专属的删除线与任务列表(strike/code mark 关闭 + marked gfm:false,
  // 管道表格与 ~~删除线~~ 均按字面文本回退,codespan 降级为纯文本)。
  const isSimple = options.variant === 'simple'

  return [
    StarterKit.configure({
      ...(isSimple ? { code: false, strike: false } : {}),
      listItem: false,
      orderedList: false,
    }),
    ...(isSimple
      ? [
          Markdown.configure({
            // @tiptap/markdown 把 marked 选项声明成全局单例的类型(多出
            // getDefaults),私有实例运行时接口完全够用,这里仅做类型收敛。
            marked: new Marked() as unknown as typeof marked,
            markedOptions: { gfm: false },
          }),
          PlainCodeSpanText,
        ]
      : [
          Markdown.configure({
            markedOptions: { gfm: true },
          }),
        ]),
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
    ...(isSimple
      ? []
      : [
          MdEditorInlineMath.configure({
            katexOptions: { displayMode: false, throwOnError: false },
            onClick: (node, pos) => {
              options.onMathClick?.({
                kind: 'inline',
                latex: String(node.attrs.latex ?? ''),
                pos,
              })
            },
          }),
          MdEditorBlockMath.configure({
            katexOptions: { displayMode: true, throwOnError: false },
            onClick: (node, pos) => {
              options.onMathClick?.({
                kind: 'block',
                latex: String(node.attrs.latex ?? ''),
                pos,
              })
            },
          }),
          MdEditorTable.configure({
            resizable: false,
          }),
          TableRow,
          TableHeader,
          TableCell,
          TaskList,
          TaskItem.configure({
            nested: true,
          }),
        ]),
    Placeholder.configure({
      placeholder: options.placeholder ?? '',
    }),
    SaveKeymap.configure({
      getInteraction: options.getInteraction,
    }),
  ] as Extension[]
}
