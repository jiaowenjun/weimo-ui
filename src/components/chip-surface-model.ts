import type { ClassValue } from 'clsx'

import { cn } from './lib/utils'

export type ChipSurfaceVariant = 'default' | 'glass'
export type ChipSurfaceTextSize = 'sm' | 'base'

export type ChipSurfaceOptions = {
  variant?: ChipSurfaceVariant
  textSize?: ChipSurfaceTextSize
  interactive?: boolean
}

export function getChipSurfaceClassName(...className: ClassValue[]) {
  return cn('chip-surface', className)
}

export function getChipSurfaceAttributes({
  variant = 'default',
  textSize = 'sm',
  interactive = false,
}: ChipSurfaceOptions = {}) {
  return {
    'data-variant': variant,
    'data-text-size': textSize,
    'data-interactive': interactive ? 'true' : undefined,
  }
}
