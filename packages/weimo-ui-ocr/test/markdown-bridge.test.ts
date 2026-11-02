import { describe, expect, it } from 'vitest'

import { documentToMarkdown, markdownToDocument } from '../src/lib/markdown-bridge'

describe('markdownToDocument', () => {
  it('空输入得到空文档', () => {
    const doc = markdownToDocument(undefined)

    expect(doc.root.content).toHaveLength(1)
    expect(doc.root.content[0]?.type).toBe('paragraph')
  })

  it('子集 markdown 解析为结构化块', () => {
    const markdown = ['## 标题', '', '- 甲', '- 乙', '', '**加粗** 段落'].join('\n')
    const doc = markdownToDocument(markdown)

    expect(doc.root.content.map((block) => block.type)).toEqual([
      'heading',
      'bullet_list',
      'paragraph',
    ])
  })

  it('越界子集(表格)降级为纯文本段落,不丢内容', () => {
    const markdown = ['| 甲 | 乙 |', '| --- | --- |', '| 1 | 2 |'].join('\n')
    const doc = markdownToDocument(markdown)

    expect(doc.root.content.every((block) => block.type === 'paragraph')).toBe(true)
    expect(documentToMarkdown(doc)).toContain('甲')
    expect(documentToMarkdown(doc)).toContain('2')
  })
})

describe('documentToMarkdown', () => {
  it('子集内 round-trip 无损(toMarkdown 输出带尾随换行)', () => {
    const markdown = ['# 标题', '', '- 甲', '- 乙', '', '**加粗** 段落'].join('\n')

    expect(documentToMarkdown(markdownToDocument(markdown))).toBe(`${markdown}\n`)
  })

  it('空文档序列化为单个换行', () => {
    const doc = markdownToDocument('')

    expect(documentToMarkdown(doc)).toBe('\n')
  })
})
