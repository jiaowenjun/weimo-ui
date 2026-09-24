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
  bordered = false,
  className,
  ...props
}: CardSurfaceProps) {
  return (
    <div
      className={getCardSurfaceClassName(
        bordered ? 'card-surface--bordered' : undefined,
        className,
      )}
      {...props}
    />
  )
}
