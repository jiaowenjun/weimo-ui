import { Fragment } from 'react'
import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react'
import { Hash } from 'lucide-react'

import { AnimatedInlineSizeMeasure } from './animated-inline-size'
import {
  getChipSurfaceAttributes,
  getChipSurfaceClassName,
} from './chip-surface-model'
import {
  getAnimatedInlineSizeStyle,
  useAnimatedInlineSize,
} from './animated-inline-size-model'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from './coss/breadcrumb'
import './chip-surface.css'
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
  style,
  ...props
}: TagBreadProps) {
  const crumbs = buildTagBreadCrumbs(tag)
  const { measureRef, inlineSize } = useAnimatedInlineSize(tag)
  const chipSurfaceAttributes = getChipSurfaceAttributes({ variant: 'glass', textSize: 'base' })

  function handleCrumbClick(event: MouseEvent<HTMLAnchorElement>, path: string) {
    event.preventDefault()
    onSelect?.(path)
  }

  function renderCrumbs(interactive = true) {
    return (
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isPage = index === crumbs.length - 1

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
              {index < crumbs.length - 1 ? (
                <BreadcrumbSeparator className="tag-bread__separator">
                  {separator}
                </BreadcrumbSeparator>
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
        className={getChipSurfaceClassName('tag-bread', className)}
        style={getAnimatedInlineSizeStyle(style, inlineSize)}
        {...chipSurfaceAttributes}
      >
        {renderCrumbs()}
      </Breadcrumb>
      <AnimatedInlineSizeMeasure measureRef={measureRef}>
        <Breadcrumb
          className={getChipSurfaceClassName('tag-bread')}
          {...chipSurfaceAttributes}
        >
          {renderCrumbs(false)}
        </Breadcrumb>
      </AnimatedInlineSizeMeasure>
    </>
  )
}
