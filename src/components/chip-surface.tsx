import type { ComponentPropsWithoutRef } from 'react'

import {
  getChipSurfaceAttributes,
  getChipSurfaceClassName,
  type ChipSurfaceOptions,
} from './chip-surface-model'
import { useGlassSurfaceBackgroundToneRef } from './glass-surface'

import './chip-surface.css'
import './glass-surface.css'

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
    useGlassSurfaceBackgroundToneRef<HTMLSpanElement>(isGlassVariant)

  return (
    <span
      className={getChipSurfaceClassName(isGlassVariant && 'glass-surface', className)}
      data-background-tone={
        isGlassVariant ? backgroundTone ?? undefined : undefined
      }
      ref={isGlassVariant ? setElementRef : undefined}
      {...getChipSurfaceAttributes({ bordered, variant, textSize, interactive })}
      {...props}
    />
  )
}
