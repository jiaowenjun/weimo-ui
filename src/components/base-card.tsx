import type { ComponentPropsWithoutRef } from 'react'

import { getCardSurfaceClassName } from './card-surface'
import { cn } from './lib/utils'

import './base-card.css'

export type BaseCardProps = ComponentPropsWithoutRef<'div'>

export function BaseCard({ className, ...props }: BaseCardProps) {
  return (
    <div
      className={cn(getCardSurfaceClassName('base-card'), className)}
      {...props}
    />
  )
}
