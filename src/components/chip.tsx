import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { AnimatedInlineSizeMeasure } from './animated-inline-size'
import {
  getChipSurfaceAttributes,
  getChipSurfaceClassName,
} from './chip-surface-model'
import {
  getAnimatedInlineSizeStyle,
  useAnimatedInlineSize,
} from './animated-inline-size-model'
import { useGlassSurfaceBackgroundToneRef } from './glass-surface'

import './chip-surface.css'
import './chip.css'
import './glass-surface.css'

export type ChipVariant = 'default' | 'glass'
export type ChipTextSize = 'sm' | 'base'

type ChipContent = Exclude<ReactNode, boolean | null | undefined>

export type ChipProps = Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'content' | 'prefix'> & {
  bordered?: boolean
  prefix?: ReactNode
  content: ChipContent
  suffix?: ReactNode
  variant?: ChipVariant
  textSize?: ChipTextSize
}

function isEmptyChipSlot(slot: ReactNode) {
  return slot === null || slot === undefined || typeof slot === 'boolean' || slot === ''
}

export function Chip({
  bordered = true,
  className,
  prefix,
  content,
  suffix,
  style,
  variant = 'default',
  textSize = 'sm',
  ...props
}: ChipProps) {
  if (isEmptyChipSlot(content)) {
    throw new Error('Chip content cannot be empty.')
  }

  const isGlassVariant = variant === 'glass'
  const { backgroundTone, setElementRef } =
    useGlassSurfaceBackgroundToneRef<HTMLSpanElement>(isGlassVariant)
  const { measureRef, inlineSize } = useAnimatedInlineSize([
    prefix,
    content,
    suffix,
    variant,
    textSize,
  ])
  const chipSurfaceAttributes = getChipSurfaceAttributes({ bordered, variant, textSize })

  return (
    <>
      <span
        className={getChipSurfaceClassName(
          isGlassVariant && 'glass-surface',
          'chip',
          className,
        )}
        style={getAnimatedInlineSizeStyle(style, inlineSize)}
        data-background-tone={
          isGlassVariant ? backgroundTone ?? undefined : undefined
        }
        ref={isGlassVariant ? setElementRef : undefined}
        {...chipSurfaceAttributes}
        {...props}
      >
        {isEmptyChipSlot(prefix) ? null : (
          <span className="chip-surface__slot chip__slot chip__slot--prefix">
            {prefix}
          </span>
        )}
        <span className="chip-surface__content chip__content">{content}</span>
        {isEmptyChipSlot(suffix) ? null : (
          <span className="chip-surface__slot chip__slot chip__slot--suffix">
            {suffix}
          </span>
        )}
      </span>
      <AnimatedInlineSizeMeasure measureRef={measureRef}>
        <span
          className={getChipSurfaceClassName('chip')}
          {...chipSurfaceAttributes}
        >
          {isEmptyChipSlot(prefix) ? null : (
            <span className="chip-surface__slot chip__slot chip__slot--prefix">
              {prefix}
            </span>
          )}
          <span className="chip-surface__content chip__content">{content}</span>
          {isEmptyChipSlot(suffix) ? null : (
            <span className="chip-surface__slot chip__slot chip__slot--suffix">
              {suffix}
            </span>
          )}
        </span>
      </AnimatedInlineSizeMeasure>
    </>
  )
}
