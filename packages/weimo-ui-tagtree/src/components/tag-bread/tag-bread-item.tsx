import type { ComponentPropsWithoutRef, MouseEvent, ReactNode } from 'react'

import { cn } from 'weimo-ui-core/lib/utils'

import { BreadcrumbLink } from '../coss/breadcrumb'
import 'weimo-ui-core/styles/tokens.css'
import './tag-bread-item.css'

export type TagBreadItemProps = Omit<
  ComponentPropsWithoutRef<'a'>,
  'children' | 'onSelect'
> & {
  /** 点击时回传的标签路径，通常为截至本级的全路径。 */
  path: string
  /** 选中回调；缺省时仅渲染链接形态（测宽克隆用法），不派发选中语义。 */
  onSelect?: (path: string) => void
  children: ReactNode
}

export function TagBreadItem({
  path,
  onSelect,
  className,
  onClick,
  children,
  ...props
}: TagBreadItemProps) {
  function handleClick(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault()
    onClick?.(event)
    onSelect?.(path)
  }

  return (
    <BreadcrumbLink
      className={cn('tag-bread-item', className)}
      href=""
      onClick={handleClick}
      {...props}
    >
      <span className="tag-bread-item__content">{children}</span>
    </BreadcrumbLink>
  )
}
