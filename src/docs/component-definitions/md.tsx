import { CardPanel } from '../../components/coss/card'
import { Md } from '../../components/md'
import { TokenPreviewCard } from '../../components/token-preview-card'
import type { ComponentDefinition } from '../component-docs'
import { mdRenderSample } from './markdown-sample'

type MarkdownTokenPreview =
  | 'text-primary'
  | 'text-secondary'
  | 'text-placeholder'
  | 'color-primary'
  | 'border'
  | 'divider'
  | 'math-hover'
  | 'font-base'
  | 'font-md'
  | 'font-sm'
  | 'line-height'
  | 'font-mono'
  | 'radius-sm'
  | 'section-gap'
  | 'quote-padding'
  | 'list-indent-compact'
  | 'list-indent-wide'

type MarkdownStyleToken = {
  token: string
  role: string
  value: string | { light: string; dark: string }
  preview: MarkdownTokenPreview
}

const markdownStyleTokens = [
  {
    token: '--markdown-color-text-primary',
    role: '正文与标题文字',
    value: { light: 'hsl(0 0% 9%)', dark: 'hsl(0 0% 98%)' },
    preview: 'text-primary',
  },
  {
    token: '--markdown-color-text-secondary',
    role: '引用与弱文字',
    value: { light: 'hsl(0 0% 28%)', dark: 'hsl(0 0% 64%)' },
    preview: 'text-secondary',
  },
  {
    token: '--markdown-color-text-placeholder',
    role: '图片占位文字',
    value: { light: 'hsl(0 0% 74%)', dark: 'hsl(0 0% 35%)' },
    preview: 'text-placeholder',
  },
  {
    token: '--markdown-color-primary',
    role: '链接与任务控件',
    value: { light: 'hsl(0 0% 15%)', dark: 'hsl(0 0% 96%)' },
    preview: 'color-primary',
  },
  {
    token: '--markdown-color-border',
    role: '代码块边框',
    value: { light: 'hsl(0 0% 90%)', dark: 'hsl(0 0% 20%)' },
    preview: 'border',
  },
  {
    token: '--markdown-color-border-divider',
    role: '行内代码与表格分隔',
    value: { light: 'hsl(0 0% 88%)', dark: 'hsl(0 0% 28%)' },
    preview: 'divider',
  },
  {
    token: '--markdown-color-bg-hover',
    role: '数学节点 hover 背景',
    value: { light: 'hsl(40 12% 96%)', dark: 'hsl(0 0% 20%)' },
    preview: 'math-hover',
  },
  {
    token: '--markdown-font-size-base',
    role: '正文与标题字号',
    value: '16px',
    preview: 'font-base',
  },
  {
    token: '--markdown-font-size-md',
    role: '行内代码与图片占位字号',
    value: '14px',
    preview: 'font-md',
  },
  {
    token: '--markdown-font-size-sm',
    role: '代码块与表格字号',
    value: '13px',
    preview: 'font-sm',
  },
  {
    token: '--markdown-font-line-height-reading',
    role: '长文阅读行高',
    value: '1.6',
    preview: 'line-height',
  },
  {
    token: '--markdown-font-mono',
    role: '代码字体',
    value: '"SFMono-Regular", "Cascadia Code", "Liberation Mono", Menlo, Consolas, monospace',
    preview: 'font-mono',
  },
  {
    token: '--markdown-radius-sm',
    role: '代码与图片圆角',
    value: '8px',
    preview: 'radius-sm',
  },
  {
    token: '--markdown-space-section-gap',
    role: '代码块内边距与图文间距',
    value: '1em',
    preview: 'section-gap',
  },
  {
    token: '--markdown-quote-padding',
    role: '引用块左右留白',
    value: '20px',
    preview: 'quote-padding',
  },
  {
    token: '--markdown-list-indent-compact',
    role: '普通列表缩进',
    value: '1.35em',
    preview: 'list-indent-compact',
  },
  {
    token: '--markdown-list-indent-wide',
    role: '字母与罗马序号缩进',
    value: '2em',
    preview: 'list-indent-wide',
  },
] satisfies readonly MarkdownStyleToken[]

function renderMarkdownTokenPreview(preview: MarkdownTokenPreview) {
  switch (preview) {
    case 'text-primary':
      return <span className="md-style-preview__mini-type md-style-preview__mini-type--primary">正文 Aa</span>
    case 'font-base':
      return <span className="md-style-preview__mini-type md-style-preview__mini-type--base">Base 16</span>
    case 'line-height':
      return (
        <span className="md-style-preview__mini-lines">
          阅读行高
          <br />
          第二行
        </span>
      )
    case 'text-secondary':
      return <span className="md-style-preview__mini-type md-style-preview__mini-type--secondary">辅助文字</span>
    case 'text-placeholder':
      return <span className="md-style-preview__mini-type md-style-preview__mini-type--placeholder">图片占位</span>
    case 'color-primary':
      return <span className="md-style-preview__mini-link">链接文字</span>
    case 'border':
      return <span className="md-style-preview__mini-swatch md-style-preview__mini-swatch--border" />
    case 'divider':
      return <span className="md-style-preview__mini-divider" />
    case 'math-hover':
      return <span className="md-style-preview__mini-math-hover">math hover</span>
    case 'font-md':
      return <code className="md-style-preview__mini-code">inline()</code>
    case 'font-sm':
      return <code className="md-style-preview__mini-code md-style-preview__mini-code--sm">code()</code>
    case 'font-mono':
      return <code className="md-style-preview__mini-code md-style-preview__mini-code--mono">mono_01</code>
    case 'radius-sm':
      return <span className="md-style-preview__mini-radius md-style-preview__mini-radius--sm" />
    case 'section-gap':
      return <span className="md-style-preview__mini-inset">padding</span>
    case 'quote-padding':
      return <span className="md-style-preview__mini-quote-space">quote</span>
    case 'list-indent-compact':
      return <span className="md-style-preview__mini-list-indent md-style-preview__mini-list-indent--compact">• 列表项</span>
    case 'list-indent-wide':
      return <span className="md-style-preview__mini-list-indent md-style-preview__mini-list-indent--wide">(VIII) 列表项</span>
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

      {markdownStyleTokens.map((item) => (
        <TokenPreviewCard
          darkValue={typeof item.value === 'string' ? undefined : item.value.dark}
          key={item.token}
          label={item.role}
          token={item.token}
          value={typeof item.value === 'string' ? item.value : item.value.light}
        >
          <div className="md-style-preview__effect" aria-hidden="true">
            {renderMarkdownTokenPreview(item.preview)}
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
