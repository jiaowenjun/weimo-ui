import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { getCardSurfaceClassName } from './card-surface'
import { cn } from './lib/utils'

import './base-card.css'

export type BaseCardProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'title'
> & {
  actionSlot?: ReactNode
  meta?: ReactNode
  title?: ReactNode
}

export function BaseCard({
  actionSlot,
  children,
  className,
  meta,
  title,
  ...props
}: BaseCardProps) {
  return (
    <div
      className={cn(getCardSurfaceClassName('base-card'), className)}
      {...props}
    >
      {title === undefined ? null : (
        <header className="base-card__header">
          <span className="base-card__title">{title}</span>
          {actionSlot === undefined ? null : (
            <div className="base-card__header-action">{actionSlot}</div>
          )}
        </header>
      )}
      {meta === undefined ? null : <div className="base-card__meta">{meta}</div>}
      <div className="base-card__content">{children}</div>
    </div>
  )
}
