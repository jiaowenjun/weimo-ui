import { Md } from '../../components/md'
import { CardPanel } from '../../components/coss/card'
import type { ComponentDefinition } from '../component-docs'
import { mdRenderSample } from './markdown-sample'

type MarkdownTokenPreview =
  | 'text-primary'
  | 'font-base'
  | 'line-height'
  | 'text-secondary'
  | 'quote-padding'
  | 'divider'
  | 'inline-code-size'
  | 'font-mono'
  | 'section-gap'
  | 'radius-sm'
  | 'math-hover'

type MarkdownStyleToken = {
  token: string
  role: string
  value: string | { light: string; dark: string }
  preview: MarkdownTokenPreview
}

const markdownStyleTokens = [
  {
    token: '--color-text-primary',
    role: '正文与标题文字',
    value: { light: 'hsl(0 0% 9%)', dark: 'hsl(0 0% 98%)' },
    preview: 'text-primary',
  },
  {
    token: '--font-size-base',
    role: '默认字号',
    value: '15px',
    preview: 'font-base',
  },
  {
    token: '--font-line-height-reading',
    role: '长文阅读行高',
    value: '1.6',
    preview: 'line-height',
  },
  {
    token: '--color-text-secondary',
    role: '引用与弱文字',
    value: { light: 'hsl(0 0% 28%)', dark: 'hsl(0 0% 64%)' },
    preview: 'text-secondary',
  },
  {
    token: '--space-md-quote-padding',
    role: '引用块左右留白',
    value: '20px',
    preview: 'quote-padding',
  },
  {
    token: '--color-border-divider',
    role: '行内代码与表格分隔',
    value: { light: 'hsl(0 0% 88%)', dark: 'hsl(0 0% 28%)' },
    preview: 'divider',
  },
  {
    token: '--space-card-section-gap',
    role: '代码块内边距',
    value: '1em',
    preview: 'section-gap',
  },
  {
    token: '--radius-sm',
    role: '代码与图片圆角',
    value: '8px',
    preview: 'radius-sm',
  },
  {
    token: '--font-size-md',
    role: '行内代码字号',
    value: '14px',
    preview: 'inline-code-size',
  },
  {
    token: '--font-mono',
    role: '代码字体',
    value: '"SFMono-Regular", "Cascadia Code", "Liberation Mono", Menlo, Consolas, monospace',
    preview: 'font-mono',
  },
  {
    token: '--color-bg-hover',
    role: '数学节点 hover 背景',
    value: { light: 'hsl(40 12% 96%)', dark: 'hsl(0 0% 20%)' },
    preview: 'math-hover',
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
    case 'quote-padding':
      return <span className="md-style-preview__mini-quote-space">quote</span>
    case 'divider':
      return <span className="md-style-preview__mini-divider" />
    case 'inline-code-size':
      return <code className="md-style-preview__mini-code">inline()</code>
    case 'font-mono':
      return <code className="md-style-preview__mini-code md-style-preview__mini-code--mono">mono_01</code>
    case 'section-gap':
      return <span className="md-style-preview__mini-inset">padding</span>
    case 'radius-sm':
      return <span className="md-style-preview__mini-radius md-style-preview__mini-radius--sm" />
    case 'math-hover':
      return <span className="md-style-preview__mini-math-hover">math hover</span>
  }
}

function MdStylePreview() {
  return (
    <div className="md-style-preview" aria-label="Markdown样式档位预览">
      {markdownStyleTokens.map((item) => (
        <CardPanel className="md-style-preview__panel" key={item.token}>
          <div className="md-style-preview__meta">
            <span className="md-style-preview__label">{item.role}</span>
            <code className="md-style-preview__token">
              {item.token}:{' '}
              {typeof item.value === 'string' ? (
                item.value
              ) : (
                <>
                  <span className="md-style-preview__token-value--light">{item.value.light}</span>
                  <span className="md-style-preview__token-value--dark">{item.value.dark}</span>
                </>
              )}
            </code>
          </div>
          <div className="md-style-preview__effect" aria-hidden="true">
            {renderMarkdownTokenPreview(item.preview)}
          </div>
        </CardPanel>
      ))}
      <CardPanel className="md-style-preview__scene">
        <div className="md-style-preview__render">
          <Md content={mdRenderSample} />
        </div>
      </CardPanel>
    </div>
  )
}

export const mdDefinition = {
  id: 'md',
  status: 'Ready',
  frame: 'plain',
  preview: () => <MdStylePreview />,
} satisfies ComponentDefinition
