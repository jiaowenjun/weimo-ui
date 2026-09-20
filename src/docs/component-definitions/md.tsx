import { Fragment } from 'react'
import { CardPanel } from '../../components/coss/card'
import { Md } from '../../components/md'
import { TokenPreviewCard } from '../../components/token-preview-card'
import type { ComponentDefinition } from '../component-docs'
import { mdRenderSample } from './markdown-sample'

type MarkdownTokenPreview =
  | 'text-color'
  | 'accent-color'
  | 'border-color'
  | 'background-color'
  | 'font-size'
  | 'line-height'
  | 'font-family'
  | 'border-radius'
  | 'padding-inline'
  | 'padding'
  | 'gap'

type MarkdownStyleToken = {
  token: string
  role: string
  value: string | { light: string; dark: string }
  preview: MarkdownTokenPreview
}

const markdownStyleTokens = [
  {
    token: '--markdown-content-color',
    role: '内容默认文字颜色',
    value: { light: 'hsl(0 0% 9%)', dark: 'hsl(0 0% 98%)' },
    preview: 'text-color',
  },
  {
    token: '--markdown-content-font-size',
    role: '内容默认字号',
    value: '16px',
    preview: 'font-size',
  },
  {
    token: '--markdown-content-line-height',
    role: '内容默认行高',
    value: '1.6',
    preview: 'line-height',
  },
  {
    token: '--markdown-paragraph-color',
    role: '正文文字颜色',
    value: { light: 'hsl(0 0% 9%)', dark: 'hsl(0 0% 98%)' },
    preview: 'text-color',
  },
  {
    token: '--markdown-heading-1-color',
    role: '一级标题文字颜色',
    value: { light: 'hsl(0 0% 9%)', dark: 'hsl(0 0% 98%)' },
    preview: 'text-color',
  },
  {
    token: '--markdown-heading-1-font-size',
    role: '一级标题字号',
    value: '16px',
    preview: 'font-size',
  },
  {
    token: '--markdown-heading-1-line-height',
    role: '一级标题行高',
    value: '1.6',
    preview: 'line-height',
  },
  {
    token: '--markdown-heading-2-color',
    role: '二级标题文字颜色',
    value: { light: 'hsl(0 0% 9%)', dark: 'hsl(0 0% 98%)' },
    preview: 'text-color',
  },
  {
    token: '--markdown-heading-2-font-size',
    role: '二级标题字号',
    value: '16px',
    preview: 'font-size',
  },
  {
    token: '--markdown-heading-2-line-height',
    role: '二级标题行高',
    value: '1.6',
    preview: 'line-height',
  },
  {
    token: '--markdown-blockquote-color',
    role: '引用块文字颜色',
    value: { light: 'hsl(0 0% 28%)', dark: 'hsl(0 0% 64%)' },
    preview: 'text-color',
  },
  {
    token: '--markdown-blockquote-padding-inline',
    role: '引用块横向内边距',
    value: '20px',
    preview: 'padding-inline',
  },
  {
    token: '--markdown-strong-color',
    role: '加粗文字颜色',
    value: { light: 'hsl(0 0% 9%)', dark: 'hsl(0 0% 98%)' },
    preview: 'text-color',
  },
  {
    token: '--markdown-strikethrough-color',
    role: '删除线文字颜色',
    value: { light: 'hsl(0 0% 28%)', dark: 'hsl(0 0% 64%)' },
    preview: 'text-color',
  },
  {
    token: '--markdown-list-padding-left',
    role: '列表左内边距',
    value: '1.35em',
    preview: 'padding-inline',
  },
  {
    token: '--markdown-ordered-list-wide-marker-padding-left',
    role: '宽序号有序列表左内边距',
    value: '2em',
    preview: 'padding-inline',
  },
  {
    token: '--markdown-task-checkbox-accent-color',
    role: '任务复选框强调色',
    value: { light: 'hsl(0 0% 15%)', dark: 'hsl(0 0% 96%)' },
    preview: 'accent-color',
  },
  {
    token: '--markdown-inline-code-font-family',
    role: '行内代码字体',
    value: '"SFMono-Regular", "Cascadia Code", "Liberation Mono", Menlo, Consolas, monospace',
    preview: 'font-family',
  },
  {
    token: '--markdown-inline-code-font-size',
    role: '行内代码字号',
    value: '14px',
    preview: 'font-size',
  },
  {
    token: '--markdown-inline-code-border-color',
    role: '行内代码边框颜色',
    value: { light: 'hsl(0 0% 88%)', dark: 'hsl(0 0% 28%)' },
    preview: 'border-color',
  },
  {
    token: '--markdown-inline-code-border-radius',
    role: '行内代码圆角',
    value: '8px',
    preview: 'border-radius',
  },
  {
    token: '--markdown-code-block-color',
    role: '代码块文字颜色',
    value: { light: 'hsl(0 0% 9%)', dark: 'hsl(0 0% 98%)' },
    preview: 'text-color',
  },
  {
    token: '--markdown-code-block-font-family',
    role: '代码块字体',
    value: '"SFMono-Regular", "Cascadia Code", "Liberation Mono", Menlo, Consolas, monospace',
    preview: 'font-family',
  },
  {
    token: '--markdown-code-block-font-size',
    role: '代码块字号',
    value: '13px',
    preview: 'font-size',
  },
  {
    token: '--markdown-code-block-padding',
    role: '代码块内边距',
    value: '1em',
    preview: 'padding',
  },
  {
    token: '--markdown-code-block-border-color',
    role: '代码块边框颜色',
    value: { light: 'hsl(0 0% 90%)', dark: 'hsl(0 0% 20%)' },
    preview: 'border-color',
  },
  {
    token: '--markdown-code-block-border-radius',
    role: '代码块圆角',
    value: '8px',
    preview: 'border-radius',
  },
  {
    token: '--markdown-link-color',
    role: '链接文字颜色',
    value: { light: 'hsl(0 0% 15%)', dark: 'hsl(0 0% 96%)' },
    preview: 'text-color',
  },
  {
    token: '--markdown-divider-color',
    role: '分隔线颜色',
    value: { light: 'hsl(0 0% 88%)', dark: 'hsl(0 0% 28%)' },
    preview: 'border-color',
  },
  {
    token: '--markdown-image-placeholder-color',
    role: '图片占位文字颜色',
    value: { light: 'hsl(0 0% 74%)', dark: 'hsl(0 0% 35%)' },
    preview: 'text-color',
  },
  {
    token: '--markdown-image-placeholder-font-size',
    role: '图片占位文字字号',
    value: '14px',
    preview: 'font-size',
  },
  {
    token: '--markdown-image-placeholder-border-radius',
    role: '图片占位圆角',
    value: '8px',
    preview: 'border-radius',
  },
  {
    token: '--markdown-image-border-radius',
    role: '图片圆角',
    value: '8px',
    preview: 'border-radius',
  },
  {
    token: '--markdown-list-image-gap',
    role: '列表与图片间距',
    value: '1em',
    preview: 'gap',
  },
  {
    token: '--markdown-table-frame-border-color',
    role: '表格外框颜色',
    value: { light: 'hsl(0 0% 88%)', dark: 'hsl(0 0% 28%)' },
    preview: 'border-color',
  },
  {
    token: '--markdown-table-cell-border-color',
    role: '表格单元格边框颜色',
    value: { light: 'hsl(0 0% 88%)', dark: 'hsl(0 0% 28%)' },
    preview: 'border-color',
  },
  {
    token: '--markdown-table-border-radius',
    role: '表格圆角',
    value: '8px',
    preview: 'border-radius',
  },
  {
    token: '--markdown-table-font-size',
    role: '表格字号',
    value: '13px',
    preview: 'font-size',
  },
  {
    token: '--markdown-table-header-color',
    role: '表头文字颜色',
    value: { light: 'hsl(0 0% 28%)', dark: 'hsl(0 0% 64%)' },
    preview: 'text-color',
  },
  {
    token: '--markdown-math-border-radius',
    role: '数学节点圆角',
    value: '8px',
    preview: 'border-radius',
  },
  {
    token: '--markdown-math-hover-background',
    role: '数学节点悬停背景',
    value: { light: 'hsl(40 12% 96%)', dark: 'hsl(0 0% 20%)' },
    preview: 'background-color',
  },
] satisfies readonly MarkdownStyleToken[]

type MarkdownStyleTokenName = (typeof markdownStyleTokens)[number]['token']

const markdownStyleTokenGroups = [
  {
    label: '内容容器',
    tokens: [
      '--markdown-content-color',
      '--markdown-content-font-size',
      '--markdown-content-line-height',
    ],
  },
  { label: '段落', tokens: ['--markdown-paragraph-color'] },
  {
    label: '标题',
    tokens: [
      '--markdown-heading-1-color',
      '--markdown-heading-1-font-size',
      '--markdown-heading-1-line-height',
      '--markdown-heading-2-color',
      '--markdown-heading-2-font-size',
      '--markdown-heading-2-line-height',
    ],
  },
  {
    label: '引用块',
    tokens: [
      '--markdown-blockquote-color',
      '--markdown-blockquote-padding-inline',
    ],
  },
  {
    label: '行内文本',
    tokens: [
      '--markdown-strong-color',
      '--markdown-strikethrough-color',
    ],
  },
  {
    label: '列表',
    tokens: [
      '--markdown-list-padding-left',
      '--markdown-ordered-list-wide-marker-padding-left',
      '--markdown-task-checkbox-accent-color',
    ],
  },
  {
    label: '代码',
    tokens: [
      '--markdown-inline-code-font-family',
      '--markdown-inline-code-font-size',
      '--markdown-inline-code-border-color',
      '--markdown-inline-code-border-radius',
      '--markdown-code-block-color',
      '--markdown-code-block-font-family',
      '--markdown-code-block-font-size',
      '--markdown-code-block-padding',
      '--markdown-code-block-border-color',
      '--markdown-code-block-border-radius',
    ],
  },
  { label: '链接', tokens: ['--markdown-link-color'] },
  { label: '分隔线', tokens: ['--markdown-divider-color'] },
  {
    label: '图片',
    tokens: [
      '--markdown-image-placeholder-color',
      '--markdown-image-placeholder-font-size',
      '--markdown-image-placeholder-border-radius',
      '--markdown-image-border-radius',
    ],
  },
  { label: '列表与图片布局', tokens: ['--markdown-list-image-gap'] },
  {
    label: '表格',
    tokens: [
      '--markdown-table-frame-border-color',
      '--markdown-table-border-radius',
      '--markdown-table-font-size',
      '--markdown-table-cell-border-color',
      '--markdown-table-header-color',
    ],
  },
  {
    label: '数学公式',
    tokens: [
      '--markdown-math-border-radius',
      '--markdown-math-hover-background',
    ],
  },
] satisfies readonly {
  label: string
  tokens: readonly MarkdownStyleTokenName[]
}[]

function getMarkdownStyleToken(token: MarkdownStyleTokenName) {
  const item = markdownStyleTokens.find((candidate) => candidate.token === token)

  if (!item) {
    throw new Error(`Unknown Markdown style token: ${token}`)
  }

  return item
}

function renderMarkdownTokenPreview(item: MarkdownStyleToken) {
  const value = `var(${item.token})`

  switch (item.preview) {
    case 'text-color':
      return <span className="md-style-preview__mini-text" style={{ color: value }}>Markdown Aa</span>
    case 'accent-color':
      return <input aria-label="任务复选框预览" defaultChecked readOnly style={{ accentColor: value }} type="checkbox" />
    case 'border-color':
      return <span className="md-style-preview__mini-border" style={{ borderColor: value }} />
    case 'background-color':
      return <span className="md-style-preview__mini-background" style={{ background: value }}>Markdown</span>
    case 'font-size':
      return <span className="md-style-preview__mini-text" style={{ fontSize: value }}>Markdown Aa</span>
    case 'line-height':
      return (
        <span className="md-style-preview__mini-lines" style={{ lineHeight: value }}>
          阅读行高
          <br />
          第二行
        </span>
      )
    case 'font-family':
      return <code className="md-style-preview__mini-font" style={{ fontFamily: value }}>mono_01</code>
    case 'border-radius':
      return <span className="md-style-preview__mini-radius" style={{ borderRadius: value }} />
    case 'padding-inline':
      return <span className="md-style-preview__mini-padding" style={{ paddingInline: value }}>节点内容</span>
    case 'padding':
      return <span className="md-style-preview__mini-padding" style={{ padding: value }}>节点内容</span>
    case 'gap':
      return (
        <span className="md-style-preview__mini-gap" style={{ gap: value }}>
          <i />
          <i />
        </span>
      )
  }
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function MdStylePreview() {
  return (
    <>
      <CardPanel className="md-style-preview__scene">
        <Md content={mdRenderSample} />
      </CardPanel>

      {markdownStyleTokenGroups.map((group) => (
        <Fragment key={group.label}>
          <h2 className="token-preview-card-demo__category">{group.label}</h2>

          {group.tokens.map((token) => {
            const item = getMarkdownStyleToken(token)

            return (
              <TokenPreviewCard
                darkValue={typeof item.value === 'string' ? undefined : item.value.dark}
                key={item.token}
                label={item.role}
                token={item.token}
                value={typeof item.value === 'string' ? item.value : item.value.light}
              >
                <div className="md-style-preview__effect" aria-hidden="true">
                  {renderMarkdownTokenPreview(item)}
                </div>
              </TokenPreviewCard>
            )
          })}
        </Fragment>
      ))}
    </>
  )
}

export const mdDefinition = {
  id: 'md',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'Markdown',
    'Markdown渲染',
    'Markdown样式',
    ...markdownStyleTokens.flatMap((item) => [item.token, item.role]),
  ],
  preview: () => <MdStylePreview />,
} satisfies ComponentDefinition
