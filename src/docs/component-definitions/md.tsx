import { CardPanel } from '../../components/coss/card'
import { Md } from '../../components/md'
import { TokenPreviewCard } from '../../components/token-preview-card'
import type { ComponentDefinition } from '../component-docs'
import { mdRenderSample } from './markdown-sample'

type MarkdownStyleToken = {
  token: string
  role: string
  value: string | { light: string; dark: string }
}

const markdownStyleTokens = [
  {
    token: '--markdown-content-color',
    role: '内容默认文字颜色',
    value: { light: 'hsl(0 0% 9%)', dark: 'hsl(0 0% 98%)' },
  },
  {
    token: '--markdown-content-font-size',
    role: '内容默认字号',
    value: '16px',
  },
  {
    token: '--markdown-content-line-height',
    role: '内容默认行高',
    value: '1.6',
  },
  {
    token: '--markdown-paragraph-color',
    role: '正文文字颜色',
    value: { light: 'hsl(0 0% 9%)', dark: 'hsl(0 0% 98%)' },
  },
  {
    token: '--markdown-heading-1-color',
    role: '一级标题文字颜色',
    value: { light: 'hsl(0 0% 9%)', dark: 'hsl(0 0% 98%)' },
  },
  {
    token: '--markdown-heading-1-font-size',
    role: '一级标题字号',
    value: '16px',
  },
  {
    token: '--markdown-heading-1-line-height',
    role: '一级标题行高',
    value: '1.6',
  },
  {
    token: '--markdown-blockquote-color',
    role: '引用块文字颜色',
    value: { light: 'hsl(0 0% 28%)', dark: 'hsl(0 0% 64%)' },
  },
  {
    token: '--markdown-blockquote-padding-inline',
    role: '引用块横向内边距',
    value: '20px',
  },
  {
    token: '--markdown-list-padding-left',
    role: '列表左内边距',
    value: '1.35em',
  },
  {
    token: '--markdown-ordered-list-wide-marker-padding-left',
    role: '宽序号有序列表左内边距',
    value: '2em',
  },
  {
    token: '--markdown-inline-code-font-family',
    role: '行内代码字体',
    value: 'SFMono-Regular',
  },
  {
    token: '--markdown-inline-code-font-size',
    role: '行内代码字号',
    value: '14px',
  },
  {
    token: '--markdown-inline-code-border-color',
    role: '行内代码边框颜色',
    value: { light: 'hsl(0 0% 88%)', dark: 'hsl(0 0% 28%)' },
  },
  {
    token: '--markdown-inline-code-border-radius',
    role: '行内代码圆角',
    value: '8px',
  },
  {
    token: '--markdown-link-color',
    role: '链接文字颜色',
    value: { light: 'hsl(0 0% 15%)', dark: 'hsl(0 0% 96%)' },
  },
  {
    token: '--markdown-image-placeholder-color',
    role: '图片占位文字颜色',
    value: { light: 'hsl(0 0% 74%)', dark: 'hsl(0 0% 35%)' },
  },
  {
    token: '--markdown-image-placeholder-font-size',
    role: '图片占位文字字号',
    value: '14px',
  },
  {
    token: '--markdown-image-placeholder-border-radius',
    role: '图片占位圆角',
    value: '8px',
  },
  {
    token: '--markdown-image-border-radius',
    role: '图片圆角',
    value: '8px',
  },
  {
    token: '--markdown-list-image-gap',
    role: '列表与图片间距',
    value: '1em',
  },
  {
    token: '--markdown-table-frame-border-color',
    role: '表格外框颜色',
    value: { light: 'hsl(0 0% 88%)', dark: 'hsl(0 0% 28%)' },
  },
  {
    token: '--markdown-table-cell-border-color',
    role: '表格单元格边框颜色',
    value: { light: 'hsl(0 0% 88%)', dark: 'hsl(0 0% 28%)' },
  },
  {
    token: '--markdown-table-border-radius',
    role: '表格圆角',
    value: '8px',
  },
  {
    token: '--markdown-table-font-size',
    role: '表格字号',
    value: '13px',
  },
  {
    token: '--markdown-table-header-color',
    role: '表头文字颜色',
    value: { light: 'hsl(0 0% 28%)', dark: 'hsl(0 0% 64%)' },
  },
  {
    token: '--markdown-math-border-radius',
    role: '数学节点圆角',
    value: '8px',
  },
  {
    token: '--markdown-math-hover-background',
    role: '数学节点悬停背景',
    value: { light: 'hsl(40 12% 96%)', dark: 'hsl(0 0% 20%)' },
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
    label: '列表',
    tokens: [
      '--markdown-list-padding-left',
      '--markdown-ordered-list-wide-marker-padding-left',
    ],
  },
  {
    label: '代码',
    tokens: [
      '--markdown-inline-code-font-family',
      '--markdown-inline-code-font-size',
      '--markdown-inline-code-border-color',
      '--markdown-inline-code-border-radius',
    ],
  },
  { label: '链接', tokens: ['--markdown-link-color'] },
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

function renderMarkdownTokenGroupPreview(
  group: (typeof markdownStyleTokenGroups)[number],
) {
  switch (group.label) {
    case '内容容器':
      return <Md content={'<span>Markdown 内容容器<br />承载默认字色、字号和行高。</span>'} />
    case '段落':
      return <Md content="这是一段用于预览正文颜色的 Markdown 文本。" />
    case '标题':
      return <Md content="# 一级标题" />
    case '引用块':
      return <Md content="> 引用块使用独立字色与横向内边距。" />
    case '列表':
      return <Md content={'- 普通列表\n\nA. 宽序号列表'} />
    case '代码':
      return <Md content="行内 `const token = true` 示例" />
    case '链接':
      return <Md content="[Markdown 链接](https://weimo.ink)" />
    case '图片':
      return (
        <Md
          content={'![图片占位](missing-image)\n\n![图片预览](preview-image)'}
          renderImage={({ alt, className }) => (
            <span
              aria-label={alt}
              className={`${className ?? ''} md-style-preview__image`}
              role="img"
            />
          )}
          resolveImageSrc={(src) => src === 'preview-image' ? src : undefined}
        />
      )
    case '列表与图片布局':
      return (
        <Md
          content={'1. 第一项\n2. 第二项\n\n![布局图片](preview-image)'}
          renderImage={({ alt, className }) => (
            <span
              aria-label={alt}
              className={`${className ?? ''} md-style-preview__image`}
              role="img"
            />
          )}
          resolveImageSrc={(src) => src === 'preview-image' ? src : undefined}
        />
      )
    case '表格':
      return <Md content={'| 节点 | 状态 |\n| --- | --- |\n| 表格 | Ready |'} />
    case '数学公式':
      return <Md className="md-style-preview__math" content="$E = mc^2$" />
    default:
      return null
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
        <TokenPreviewCard
          items={group.tokens.map((token) => {
            const item = getMarkdownStyleToken(token)

            return {
              darkValue: typeof item.value === 'string' ? undefined : item.value.dark,
              token: item.token,
              value: typeof item.value === 'string' ? item.value : item.value.light,
            }
          })}
          key={group.label}
          label={group.label}
        >
          <div className="md-style-preview__group-effect">
            <div className="md-style-preview__content-wrapper">
              {renderMarkdownTokenGroupPreview(group)}
            </div>
          </div>
        </TokenPreviewCard>
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
