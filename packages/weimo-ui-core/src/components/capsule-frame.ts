import type { ClassValue } from 'clsx'

import { cn } from './lib/utils'

export type CapsuleFrameMaterial = 'solid' | 'frosted'
export type CapsuleFrameTextSize = 'sm' | 'base' | 'lg'

export type CapsuleFrameOptions = {
  material?: CapsuleFrameMaterial
  textSize?: CapsuleFrameTextSize
  interactive?: boolean
}

export function getCapsuleFrameClassName(...className: ClassValue[]) {
  return cn('capsule-frame', className)
}

export function getCapsuleFrameAttributes({
  material = 'solid',
  textSize = 'sm',
  interactive = false,
}: CapsuleFrameOptions = {}) {
  return {
    'data-material': material,
    'data-text-size': textSize,
    'data-interactive': interactive ? 'true' : undefined,
  }
}
