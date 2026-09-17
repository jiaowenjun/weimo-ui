import type { ComponentPropsWithoutRef } from 'react'
import type { ClassValue } from 'clsx'

import { cn } from './lib/utils'

import './card-surface.css'

export type CardSurfaceProps = ComponentPropsWithoutRef<'div'>

export function getCardSurfaceClassName(...className: ClassValue[]) {
  return cn('card-surface', className)
}

export function CardSurface({ className, ...props }: CardSurfaceProps) {
  return (
    <div
      className={getCardSurfaceClassName(className)}
      {...props}
    />
  )
}
