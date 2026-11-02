import { useState } from 'react'
import { useSearchParams } from 'react-router'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { SiteTemplate } from 'weimo-ui-template/components/site-template'
import type { SiteNavigationGroup } from 'weimo-ui-template/components/site-template'

import { parseThemeMode } from './preview-theme'
import './site-template-preview-page.css'

const navigationGroups: SiteNavigationGroup[] = [
  {
    id: 'preview',
    title: '页面模板',
    items: [
      { href: '#overview', id: 'overview', label: '概览' },
      { href: '#components', id: 'components', label: '组件' },
      { href: '#tokens', id: 'tokens', label: '设计令牌' },
    ],
  },
]

/** iframe 预览源页面:不加任何包装地渲染生产 SiteTemplate,
    由外层演示卡片的 iframe 提供独立 viewport 与文档环境。 */
export function SiteTemplatePreviewPage() {
  const [searchParams] = useSearchParams()
  const [activeItemId, setActiveItemId] = useState('overview')
  const defaultTheme = parseThemeMode(searchParams.get('theme')) ?? 'system'

  return (
    <SiteTemplate
      activeItemId={activeItemId}
      mainClassName="site-template-preview-page__site"
      navigationGroups={navigationGroups}
      onNavigate={(item) => setActiveItemId(item.id)}
      pageTitle="SiteTemplate"
      siteName="weimo-ui-template"
      defaultTheme={defaultTheme}
    >
      <ComponentPreviewCard label="生产组件直出">
        <p className="site-template-preview-page__description">
          iframe 内的整页就是未加包装的 SiteTemplate:侧栏、顶栏、主题切换、
          699px 断点全部来自生产代码,预览卡片没有维护任何第二份实现。
        </p>
      </ComponentPreviewCard>

      <ComponentPreviewCard label="视口驱动响应式">
        <p className="site-template-preview-page__description">
          SideBar 的常驻/抽屉切换依据 iframe 自身的视口宽度判定:
          外层滑块把宽度拖过 699px,即可看到侧栏折叠为模态抽屉。
        </p>
      </ComponentPreviewCard>

      <ComponentPreviewCard label="主题文档隔离">
        <p className="site-template-preview-page__description">
          右上角主题按钮操作的是 iframe 自己的 document.documentElement,
          外层文档站的主题不受影响;URL 可带 ?theme=light|dark|system 指定初始主题。
        </p>
      </ComponentPreviewCard>
    </SiteTemplate>
  )
}
