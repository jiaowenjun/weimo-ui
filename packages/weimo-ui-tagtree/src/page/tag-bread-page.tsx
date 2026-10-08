import { Hash } from 'lucide-react'

import {
  getCapsuleFrameAttributes,
  getCapsuleFrameClassName,
} from 'weimo-ui-core/components/capsule-frame'
import { getFrostedSurfaceClassName } from 'weimo-ui-core/components/frosted-surface-model'
import { GhostIconButton } from 'weimo-ui-core/components/ghost-icon-button'
import { Menu, MenuItem, MenuPopup, MenuTrigger } from 'weimo-ui-core/components/menu'
import { ComponentPreviewCard } from 'weimo-ui-card/components/component-preview-card'

import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../components/coss/breadcrumb'
import { TagBread } from '../components/tag-bread/tag-bread'

import './tag-page.css'

function TagBreadDemo() {
  const surfaceAttributes = getCapsuleFrameAttributes({ material: 'frosted' })

  return (
    <ComponentPreviewCard className="tag-page__card" label="标签面包屑">
      <div className="tag-page__canvas">
        <div className="tag-page__bread-preview">
          <TagBread tag="文学/古代/诗词" onSelect={() => {}} />
          <Breadcrumb
            aria-label="省略面包屑示例"
            className={getCapsuleFrameClassName(
              getFrostedSurfaceClassName('frosted-surface--bordered'),
              'tag-bread',
            )}
            {...surfaceAttributes}
          >
            <BreadcrumbList>
              <BreadcrumbItem className="tag-bread__item">
                <span className="tag-bread__prefix"><Hash aria-hidden="true" /></span>
                <BreadcrumbLink href="/">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem className="tag-bread__item">
                <Menu>
                  <MenuTrigger render={<GhostIconButton aria-label="展开省略的面包屑层级" size="sm" />}>
                    <BreadcrumbEllipsis />
                  </MenuTrigger>
                  <MenuPopup align="start">
                    <MenuItem render={<a href="/docs" />}>Docs</MenuItem>
                    <MenuItem render={<a href="/particles" />}>Particles</MenuItem>
                  </MenuPopup>
                </Menu>
              </BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem className="tag-bread__item"><BreadcrumbLink href="/docs/components">Components</BreadcrumbLink></BreadcrumbItem>
              <BreadcrumbSeparator>/</BreadcrumbSeparator>
              <BreadcrumbItem className="tag-bread__item"><BreadcrumbPage>Breadcrumb</BreadcrumbPage></BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

export type TagBreadPageProps = {
  embedded?: boolean
}

export function TagBreadPage({ embedded = false }: TagBreadPageProps = {}) {
  // 站点内嵌时不带独立页外壳:卡片作为兄弟节点直接进 app-shell__content
  // 纵列,与其他组件页的单列满宽布局对齐。
  if (embedded) {
    return <TagBreadDemo />
  }

  return (
    <main className="tag-page">
      <header className="tag-page__header">
        <p className="tag-page__eyebrow">Weimo UI / 标签面包屑</p>
        <h1>标签面包屑</h1>
        <p>面包屑导航组件。</p>
      </header>
      <div className="tag-page__grid">
        <TagBreadDemo />
      </div>
    </main>
  )
}
