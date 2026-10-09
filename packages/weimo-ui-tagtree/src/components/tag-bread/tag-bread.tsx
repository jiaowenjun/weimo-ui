import { Fragment } from 'react'
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react'
import { Hash } from 'lucide-react'

import { AnimatedInlineSizeMeasure } from 'weimo-ui-core/components/animated-inline-size'
import {
  getCapsuleFrameAttributes,
  getCapsuleFrameClassName,
} from 'weimo-ui-core/components/capsule-frame'
import {
  getAnimatedInlineSizeStyle,
  useAnimatedInlineSize,
} from 'weimo-ui-core/components/animated-inline-size-model'
import {
  getFrostedSurfaceClassName,
  useFrostedSurfaceBackgroundToneRef,
} from 'weimo-ui-core/components/frosted-surface'
import { GhostIconButton } from 'weimo-ui-core/components/ghost-icon-button'
import { Menu, MenuItem, MenuPopup, MenuTrigger } from 'weimo-ui-core/components/menu'
import {
  Breadcrumb,
  BreadcrumbEllipsis,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../coss/breadcrumb'
import 'weimo-ui-core/styles/capsule-frame.css'
import 'weimo-ui-core/styles/frosted-surface.css'
import './tag-bread.css'

type TagBreadCrumb = {
  label: string
  path: string
}

export type TagBreadProps = Omit<
  ComponentPropsWithoutRef<'nav'>,
  'children' | 'prefix' | 'onSelect'
> & {
  tag: string
  onSelect?: (tag: string) => void
  prefix?: ReactNode
  separator?: ReactNode
  maxVisible?: number
}

function buildTagBreadCrumbs(tag: string): TagBreadCrumb[] {
  const segments = tag
    .split('/')
    .map((segment) => segment.trim())
    .filter(Boolean)

  return segments.map((label, index) => ({
    label,
    path: segments.slice(0, index + 1).join('/'),
  }))
}

export function TagBread({
  className,
  tag,
  onSelect,
  prefix = <Hash aria-hidden="true" />,
  separator = '/',
  maxVisible = 4,
  style,
  ...props
}: TagBreadProps) {
  const crumbs = buildTagBreadCrumbs(tag)
  const maxVisibleCrumbs = Math.max(maxVisible, 2)
  const collapsedCrumbs =
    crumbs.length > maxVisibleCrumbs
      ? crumbs.slice(1, crumbs.length - (maxVisibleCrumbs - 1))
      : []
  const visibleCrumbs =
    collapsedCrumbs.length > 0
      ? [crumbs[0], ...crumbs.slice(crumbs.length - (maxVisibleCrumbs - 1))]
      : crumbs
  const { measureRef, inlineSize } = useAnimatedInlineSize(tag)
  const { backgroundStyle, backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLElement>(true)
  const capsuleFrameAttributes = getCapsuleFrameAttributes({
    material: 'frosted',
  })
  const frostedSurfaceClassName = getFrostedSurfaceClassName(
    'frosted-surface--bordered',
  )

  function handleCrumbClick(event: MouseEvent<HTMLAnchorElement>, path: string) {
    event.preventDefault()
    onSelect?.(path)
  }

  function renderEllipsisItem(interactive = true) {
    return (
      <BreadcrumbItem className="tag-bread__item">
        {interactive ? (
          <Menu>
            <MenuTrigger render={<GhostIconButton aria-label="展开省略的面包屑层级" size="sm" />}>
              <BreadcrumbEllipsis />
            </MenuTrigger>
            <MenuPopup align="start">
              {collapsedCrumbs.map((crumb) => (
                <MenuItem key={crumb.path} onClick={() => onSelect?.(crumb.path)}>
                  {crumb.label}
                </MenuItem>
              ))}
            </MenuPopup>
          </Menu>
        ) : (
          <GhostIconButton aria-hidden="true" size="sm" tabIndex={-1}>
            <BreadcrumbEllipsis />
          </GhostIconButton>
        )}
      </BreadcrumbItem>
    )
  }

  function renderCrumbs(interactive = true) {
    return (
      <BreadcrumbList>
        {visibleCrumbs.map((crumb, index) => {
          const isPage = index === visibleCrumbs.length - 1

          return (
            <Fragment key={crumb.path}>
              <BreadcrumbItem className="tag-bread__item">
                {index === 0 ? (
                  <span className="tag-bread__prefix">{prefix}</span>
                ) : null}
                {isPage ? (
                  <BreadcrumbPage className="tag-bread__page">
                    {crumb.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    className="tag-bread__link"
                    href=""
                    onClick={
                      interactive
                        ? (event) => handleCrumbClick(event, crumb.path)
                        : undefined
                    }
                  >
                    {crumb.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {index < visibleCrumbs.length - 1 ? (
                <BreadcrumbSeparator className="tag-bread__separator">
                  {separator}
                </BreadcrumbSeparator>
              ) : null}
              {index === 0 && collapsedCrumbs.length > 0 ? (
                <Fragment>
                  {renderEllipsisItem(interactive)}
                  <BreadcrumbSeparator className="tag-bread__separator">
                    {separator}
                  </BreadcrumbSeparator>
                </Fragment>
              ) : null}
            </Fragment>
          )
        })}
      </BreadcrumbList>
    )
  }

  return (
    <>
      <Breadcrumb
        {...props}
        className={getCapsuleFrameClassName(
          frostedSurfaceClassName,
          'tag-bread',
          className,
        )}
        data-background-tone={backgroundTone ?? undefined}
        ref={setElementRef}
        style={{ ...getAnimatedInlineSizeStyle(style, inlineSize), ...backgroundStyle }}
        {...capsuleFrameAttributes}
      >
        {renderCrumbs()}
      </Breadcrumb>
      <AnimatedInlineSizeMeasure measureRef={measureRef}>
        <Breadcrumb
          className={getCapsuleFrameClassName(frostedSurfaceClassName, 'tag-bread')}
          {...capsuleFrameAttributes}
        >
          {renderCrumbs(false)}
        </Breadcrumb>
      </AnimatedInlineSizeMeasure>
    </>
  )
}
