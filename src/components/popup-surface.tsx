import type { ComponentPropsWithoutRef } from 'react'
import type { ClassValue } from 'clsx'

import { cn } from './lib/utils'

import './popup-surface.css'

export type PopupSurfaceLevel = 'modal' | 'tooltip'

export type PopupSurfaceProps = ComponentPropsWithoutRef<'div'> & {
  level?: PopupSurfaceLevel
}

export function getPopupSurfaceClassName(
  level: PopupSurfaceLevel = 'modal',
  ...className: ClassValue[]
) {
  void level

  return cn('popup-surface', className)
}

export function PopupSurface({
  className,
  level = 'modal',
  ...props
}: PopupSurfaceProps) {
  return (
    <div
      className={getPopupSurfaceClassName(level, className)}
      data-level={level === 'modal' ? undefined : level}
      {...props}
    />
  )
}
