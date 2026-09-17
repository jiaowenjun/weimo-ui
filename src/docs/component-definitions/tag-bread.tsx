import { Hash } from 'lucide-react'

import { TagBread } from '../../components/tag-bread'
import {
  getChipSurfaceAttributes,
  getChipSurfaceClassName,
} from '../../components/chip-surface-model'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../../components/coss/breadcrumb'
import { GhostIconButton } from '../../components/ghost-icon-button'
import {
  Menu,
  MenuItem,
  MenuPopup,
  MenuTrigger,
} from '../../components/menu'
import type { ComponentDefinition } from '../component-docs'

function TagBreadDemo() {
  const tagBreadDocsSurfaceAttributes = getChipSurfaceAttributes({
    variant: 'glass',
    textSize: 'base',
  })

  return (
    <div className="tag-bread-docs-preview">
      <TagBread tag="文学/古代/诗词" onSelect={() => {}} />
      <Breadcrumb
        aria-label="coss 省略面包屑示例"
        className={getChipSurfaceClassName(
          'tag-bread',
          'tag-bread-docs-preview__ellipsis',
        )}
        {...tagBreadDocsSurfaceAttributes}
      >
        <BreadcrumbList>
          <BreadcrumbItem className="tag-bread__item">
            <span className="tag-bread__prefix">
              <Hash aria-hidden="true" />
            </span>
            <BreadcrumbLink className="tag-bread__link" href="/">
              Home
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="tag-bread__separator">
            /
          </BreadcrumbSeparator>
          <BreadcrumbItem className="tag-bread__item">
            <Menu>
              <MenuTrigger
                render={
                  <GhostIconButton
                    aria-label="展开省略的面包屑层级"
                    className="tag-bread-docs-preview__ellipsis-trigger"
                    size="sm"
                  />
                }
              >
                <BreadcrumbEllipsis />
              </MenuTrigger>
              <MenuPopup align="start">
                <MenuItem render={<a href="/docs" />}>Docs</MenuItem>
                <MenuItem render={<a href="/particles" />}>Particles</MenuItem>
              </MenuPopup>
            </Menu>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="tag-bread__separator">
            /
          </BreadcrumbSeparator>
          <BreadcrumbItem className="tag-bread__item">
            <BreadcrumbLink className="tag-bread__link" href="/docs/components">
              Components
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator className="tag-bread__separator">
            /
          </BreadcrumbSeparator>
          <BreadcrumbItem className="tag-bread__item">
            <BreadcrumbPage className="tag-bread__page">Breadcrumb</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  )
}

export const tagBreadDefinition = {
  id: 'tag-bread',
  summary: '基于 coss Breadcrumb 的标签路径导航，提供磨砂玻璃背景和紧凑标签层级展示',
  status: 'Ready',
  props: [
    { name: 'tag', type: 'string', defaultValue: '-' },
    { name: 'onSelect', type: '(tag: string) => void', defaultValue: '-' },
    { name: 'prefix', type: 'ReactNode', defaultValue: '<Hash />' },
    { name: 'separator', type: 'ReactNode', defaultValue: "'/'" },
    {
      name: '...navProps',
      type: 'ComponentPropsWithoutRef<"nav">',
      defaultValue: '-',
    },
  ],
  preview: () => <TagBreadDemo />,
} satisfies ComponentDefinition
