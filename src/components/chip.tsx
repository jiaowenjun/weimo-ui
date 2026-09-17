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

import './chip-surface.css'
import './chip.css'

export type ChipVariant = 'default' | 'glass'
export type ChipTextSize = 'sm' | 'base'

type ChipContent = Exclude<ReactNode, boolean | null | undefined>

export type ChipProps = Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'content' | 'prefix'> & {
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

  const { measureRef, inlineSize } = useAnimatedInlineSize([
    prefix,
    content,
    suffix,
    variant,
    textSize,
  ])
  const chipSurfaceAttributes = getChipSurfaceAttributes({ variant, textSize })

  return (
    <>
      <span
        className={getChipSurfaceClassName('chip', className)}
        style={getAnimatedInlineSizeStyle(style, inlineSize)}
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
