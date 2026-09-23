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

export function CardSurface({
  bordered = true,
  className,
  ...props
}: CardSurfaceProps) {
  return (
    <div
      className={getCardSurfaceClassName(
        bordered ? undefined : 'card-surface--borderless',
        className,
      )}
      {...props}
    />
  )
}
