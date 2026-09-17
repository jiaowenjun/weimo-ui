import { Md } from '../../components/md'
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
  values: readonly MarkdownStyleTokenValue[]
  role: string
  usedBy: string
  preview: MarkdownTokenPreview
}

type MarkdownStyleTokenValue = {
  label: string
  value: string
}

type MarkdownStyleTokenGroup = {
  title: string
  description: string
  tokens: readonly MarkdownStyleToken[]
}

const markdownStyleTokenGroups = [
  {
    title: '排版',
    description: '控制 Markdown 根容器、正文、标题和阅读行高。',
    tokens: [
      {
        token: '--color-text-primary',
        values: [
          { label: '亮', value: 'hsl(0 0% 9%)' },
          { label: '暗', value: 'hsl(0 0% 98%)' },
        ],
        role: '正文、标题、代码块文字',
        usedBy: '.weimo-markdown-content、.weimo-card-markdown__p、heading、pre code',
        preview: 'text-primary',
      },
      {
        token: '--font-size-base',
        values: [{ label: '全局', value: '15px' }],
        role: 'Markdown 默认字号',
        usedBy: '.weimo-markdown-content、h1-h6',
        preview: 'font-base',
      },
      {
        token: '--font-line-height-reading',
        values: [{ label: '全局', value: '1.6' }],
        role: '长文阅读行高',
        usedBy: '.weimo-markdown-content、paragraph、heading',
        preview: 'line-height',
      },
      {
        token: '--color-text-secondary',
        values: [
          { label: '亮', value: 'hsl(0 0% 28%)' },
          { label: '暗', value: 'hsl(0 0% 64%)' },
        ],
        role: '引用、删除线和表头弱文字',
        usedBy: '.weimo-card-markdown__blockquote、del、table th',
        preview: 'text-secondary',
      },
    ],
  },
  {
    title: '结构',
    description: '覆盖引用留白、分隔线、区块间距和容器圆角。',
    tokens: [
      {
        token: '--space-md-quote-padding',
        values: [{ label: '局部', value: '20px' }],
        role: '引用块左右留白',
        usedBy: '.weimo-card-markdown__blockquote',
        preview: 'quote-padding',
      },
      {
        token: '--color-border-divider',
        values: [
          { label: '亮', value: 'hsl(0 0% 88%)' },
          { label: '暗', value: 'hsl(0 0% 28%)' },
        ],
        role: '行内代码、表格外框、表格内部分隔和 hr',
        usedBy: 'inline code、table outer、table cell、hr',
        preview: 'divider',
      },
      {
        token: '--space-card-section-gap',
        values: [{ label: '全局', value: '1em' }],
        role: '代码块内边距',
        usedBy: '.weimo-card-markdown__pre',
        preview: 'section-gap',
      },
      {
        token: '--radius-sm',
        values: [{ label: '全局', value: '8px' }],
        role: '代码、表格滚动框、图片和可编辑数学节点圆角',
        usedBy: 'code、pre、scroll-block、img、.tiptap-mathematics-render',
        preview: 'radius-sm',
      },
    ],
  },
  {
    title: '富内容',
    description: '覆盖代码、图片占位和数学公式等富内容样式。',
    tokens: [
      {
        token: '--font-size-md',
        values: [{ label: '全局', value: '14px' }],
        role: '行内代码和图片占位字号',
        usedBy: '.weimo-card-markdown__code、image-placeholder',
        preview: 'inline-code-size',
      },
      {
        token: '--font-mono',
        values: [
          {
            label: '全局',
            value: '"SFMono-Regular", "Cascadia Code", "Liberation Mono", Menlo, Consolas, monospace',
          },
        ],
        role: '代码字体',
        usedBy: 'inline code、pre code',
        preview: 'font-mono',
      },
      {
        token: '--color-bg-hover',
        values: [
          { label: '亮', value: 'hsl(40 12% 96%)' },
          { label: '暗', value: 'hsl(0 0% 20%)' },
        ],
        role: '数学节点 hover 背景（复用通用反馈）',
        usedBy: '.tiptap-mathematics-render--editable:hover',
        preview: 'math-hover',
      },
    ],
  },
] satisfies readonly MarkdownStyleTokenGroup[]

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
    <div className="md-style-preview" aria-label="Markdown token 值与真实场景预览">
      <div className="md-style-preview__token-grid" aria-label="Markdown 渲染相关 token 按排版、结构和富内容分组。">
        {markdownStyleTokenGroups.map((group) => (
          <article className="md-style-preview__token-group" key={group.title}>
            <div className="md-style-preview__group-header">
              <h4>{group.title}</h4>
              <p>{group.description}</p>
            </div>
            {group.tokens.map((item) => (
              <div className="md-style-preview__token-card" key={item.token}>
                <code>{item.token}</code>
                <dl className="md-style-preview__token-values" aria-label={`${item.token} 具体值`}>
                  {item.values.map((value) => (
                    <div className="md-style-preview__token-value" key={`${item.token}-${value.label}`}>
                      <dt>{value.label}</dt>
                      <dd>
                        <code>{value.value}</code>
                      </dd>
                    </div>
                  ))}
                </dl>
                <p>{item.role}</p>
                <span>{item.usedBy}</span>
                <div className="md-style-preview__effect" aria-label={`${item.token} 样式效果预览`}>
                  {renderMarkdownTokenPreview(item.preview)}
                </div>
              </div>
            ))}
          </article>
        ))}
      </div>
      <aside className="md-style-preview__usage-scene" aria-label="Markdown token 值真实场景预览">
        <div className="md-style-preview__scene-header">
          <h3>真实 Markdown 场景</h3>
          <p>完整渲染只用于观察左侧 token 值在正文、引用、代码、表格和公式中的效果。</p>
        </div>
        <div className="md-style-preview__render">
          <Md content={mdRenderSample} />
        </div>
      </aside>
    </div>
  )
}

export const mdDefinition = {
  id: 'md',
  summary: 'Markdown 渲染相关 token 汇总，用真实 Markdown 场景辅助观察底层样式值',
  status: 'Ready',
  preview: () => <MdStylePreview />,
} satisfies ComponentDefinition
