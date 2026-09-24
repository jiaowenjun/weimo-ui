import type { ComponentPropsWithoutRef } from 'react'
import type { ClassValue } from 'clsx'

import { cn } from './lib/utils'

import './card-surface.css'

export type CardSurfaceProps = ComponentPropsWithoutRef<'div'> & {
  bordered?: boolean
}

export function getCardSurfaceClassName(...className: ClassValue[]) {
  return cn('card-surface', className)
}

/* bordered 三态：未指定时交给上下文（嵌套在 card-surface 内的卡片经
   .card-surface .card-surface 自动描边），显式 true/false 强制有/无边框。 */
export function getCardSurfaceBorderClassName(bordered: boolean | undefined) {
  if (bordered === undefined) return undefined

  return bordered ? 'card-surface--bordered' : 'card-surface--borderless'
}

export function CardSurface({
  bordered,
  className,
  ...props
}: CardSurfaceProps) {
  return (
    <div
      className={getCardSurfaceClassName(
        getCardSurfaceBorderClassName(bordered),
        className,
      )}
      {...props}
    />
  )
}
