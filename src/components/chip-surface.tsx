import type { ComponentPropsWithoutRef } from 'react'

import {
  getChipSurfaceAttributes,
  getChipSurfaceClassName,
  type ChipSurfaceOptions,
} from './chip-surface-model'
import { useFrostedSurfaceBackgroundToneRef } from './frosted-surface'

import './chip-surface.css'
import './frosted-surface.css'

export type {
  ChipSurfaceOptions,
  ChipSurfaceTextSize,
  ChipSurfaceVariant,
} from './chip-surface-model'

export type ChipSurfaceProps = Omit<ComponentPropsWithoutRef<'span'>, 'prefix'> &
  ChipSurfaceOptions

export function ChipSurface({
  bordered = true,
  className,
  variant = 'default',
  textSize = 'sm',
  interactive = false,
  ...props
}: ChipSurfaceProps) {
  const isGlassVariant = variant === 'glass'
  const { backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLSpanElement>(isGlassVariant)

  return (
    <span
      className={getChipSurfaceClassName(isGlassVariant && 'frosted-surface', className)}
      data-background-tone={
        isGlassVariant ? backgroundTone ?? undefined : undefined
      }
      ref={isGlassVariant ? setElementRef : undefined}
      {...getChipSurfaceAttributes({ bordered, variant, textSize, interactive })}
      {...props}
    />
  )
}
