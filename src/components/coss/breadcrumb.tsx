import { ChevronRight, MoreHorizontal } from 'lucide-react'
import type { ComponentProps, ReactElement } from 'react'
import { mergeProps } from '@base-ui/react/merge-props'
import { useRender } from '@base-ui/react/use-render'

import { cn } from '../lib/utils'

import './breadcrumb.css'

export function Breadcrumb({
  className,
  ...props
}: ComponentProps<'nav'>): ReactElement {
  return (
    <nav
      aria-label="breadcrumb"
      className={cn('coss-breadcrumb', className)}
      data-slot="breadcrumb"
      {...props}
    />
  )
}

export function BreadcrumbList({
  className,
  ...props
}: ComponentProps<'ol'>): ReactElement {
  return (
    <ol
      className={cn('coss-breadcrumb__list', className)}
      data-slot="breadcrumb-list"
      {...props}
    />
  )
}

export function BreadcrumbItem({
  className,
  ...props
}: ComponentProps<'li'>): ReactElement {
  return (
    <li
      className={cn('coss-breadcrumb__item', className)}
      data-slot="breadcrumb-item"
      {...props}
    />
  )
}

export function BreadcrumbLink({
  className,
  render,
  ...props
}: useRender.ComponentProps<'a'>): ReactElement {
  const defaultProps = {
    className: cn('coss-breadcrumb__link', className),
    'data-slot': 'breadcrumb-link',
  }

  return useRender({
    defaultTagName: 'a',
    props: mergeProps<'a'>(defaultProps, props),
    render,
  })
}

export function BreadcrumbPage({
  className,
  ...props
}: ComponentProps<'span'>): ReactElement {
  return (
    <span
      aria-current="page"
      className={cn('coss-breadcrumb__page', className)}
      data-slot="breadcrumb-page"
      {...props}
    />
  )
}

export function BreadcrumbSeparator({
  children,
  className,
  ...props
}: ComponentProps<'li'>): ReactElement {
  return (
    <li
      aria-hidden="true"
      className={cn('coss-breadcrumb__separator', className)}
      data-slot="breadcrumb-separator"
      role="presentation"
      {...props}
    >
      {children ?? <ChevronRight />}
    </li>
  )
}

export function BreadcrumbEllipsis({
  className,
  ...props
}: ComponentProps<'span'>): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={cn('coss-breadcrumb__ellipsis', className)}
      data-slot="breadcrumb-ellipsis"
      role="presentation"
      {...props}
    >
      <MoreHorizontal />
      <span className="coss-breadcrumb__sr-only">More</span>
    </span>
  )
}
