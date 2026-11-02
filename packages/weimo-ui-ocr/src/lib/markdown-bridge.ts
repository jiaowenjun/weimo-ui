import { fromMarkdown, toMarkdown } from 'weimo-wdf/markdown'
import { WDF_SCHEMA, WDF_VERSION, WdfDocument, WdfText } from 'weimo-wdf'
import type { WdfBlock } from 'weimo-wdf'

/**
 * markdown 桥:OCR 组件对外说 markdown 字符串,对内交给 WdfCard 的
 * 是 WdfDocument。双向经 weimo-wdf/markdown 适配器。
 *
 * fromMarkdown 只接受 WDF v0.1 可表达的子集(标题/段落/引用/顶层列表/
 * 加粗);表格、链接、行内代码、嵌套列表等以诊断拒绝而非静默丢弃。
 * OCR 引擎输出不受控,解析失败时降级为逐行纯文本段落——内容不丢,
 * 富文本结构丢。toMarkdown 的输出恒在子集内,回程无此问题。
 */

export function markdownToDocument(markdown: string | undefined): WdfDocument {
  const text = markdown?.trim()
  if (!text) return WdfDocument.empty()

  const result = fromMarkdown(text)
  if (result.ok) return result.value

  return plainTextToDocument(text)
}

export function documentToMarkdown(document: WdfDocument): string {
  return toMarkdown(document)
}

function plainTextToDocument(text: string): WdfDocument {
  const lines = text.split(/\r?\n/)
  const content: WdfBlock[] = lines.map((line) => ({
    type: 'paragraph' as const,
    content: line.trim() ? [WdfText.plain(line)] : [],
  }))

  return {
    schema: WDF_SCHEMA,
    version: WDF_VERSION,
    root: { type: 'doc', content },
  }
}
