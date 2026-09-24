import type { ComponentPropsWithoutRef } from 'react'
import type { ClassValue } from 'clsx'

import { cn } from './lib/utils'

import './popup-surface.css'

export type PopupSurfaceLevel = 'modal' | 'tooltip'

export type PopupSurfaceProps = ComponentPropsWithoutRef<'div'> & {
  bordered?: boolean
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
  bordered = false,
  className,
  level = 'modal',
  ...props
}: PopupSurfaceProps) {
  return (
    <div
      className={getPopupSurfaceClassName(
        level,
        bordered ? 'popup-surface--bordered' : undefined,
        className,
      )}
      data-level={level === 'modal' ? undefined : level}
      {...props}
    />
  )
}
