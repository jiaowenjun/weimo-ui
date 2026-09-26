import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { AnimatedInlineSizeMeasure } from './animated-inline-size'
import {
  getCapsuleFrameAttributes,
  getCapsuleFrameClassName,
} from './capsule-frame'
import {
  getAnimatedInlineSizeStyle,
  useAnimatedInlineSize,
} from './animated-inline-size-model'
import {
  getFrostedSurfaceClassName,
  useFrostedSurfaceBackgroundToneRef,
} from './frosted-surface'

import './capsule-frame.css'
import './chip.css'
import './frosted-surface.css'

export type ChipVariant = 'default' | 'glass'
export type ChipTextSize = 'sm' | 'base' | 'lg'

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

  const isFrostedVariant = variant === 'glass'
  const { backgroundStyle, backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLSpanElement>(isFrostedVariant)
  const { measureRef, inlineSize } = useAnimatedInlineSize([
    prefix,
    content,
    suffix,
    variant,
    textSize,
  ])
  const capsuleFrameAttributes = getCapsuleFrameAttributes({
    material: isFrostedVariant ? 'frosted' : 'solid',
    textSize,
  })
  const frostedSurfaceClassName = isFrostedVariant
    ? getFrostedSurfaceClassName(bordered ? 'frosted-surface--bordered' : undefined)
    : undefined

  return (
    <>
      <span
        className={getCapsuleFrameClassName(
          frostedSurfaceClassName,
          'chip',
          className,
        )}
        style={{ ...getAnimatedInlineSizeStyle(style, inlineSize), ...backgroundStyle }}
        data-background-tone={
          isFrostedVariant ? backgroundTone ?? undefined : undefined
        }
        ref={isFrostedVariant ? setElementRef : undefined}
        {...capsuleFrameAttributes}
        {...props}
      >
        {isEmptyChipSlot(prefix) ? null : (
          <span className="capsule-frame__slot chip__slot chip__slot--prefix">
            {prefix}
          </span>
        )}
        <span className="capsule-frame__content chip__content">{content}</span>
        {isEmptyChipSlot(suffix) ? null : (
          <span className="capsule-frame__slot chip__slot chip__slot--suffix">
            {suffix}
          </span>
        )}
      </span>
      <AnimatedInlineSizeMeasure measureRef={measureRef}>
        <span
          className={getCapsuleFrameClassName(
            frostedSurfaceClassName,
            'chip',
            className,
          )}
          {...capsuleFrameAttributes}
        >
          {isEmptyChipSlot(prefix) ? null : (
            <span className="capsule-frame__slot chip__slot chip__slot--prefix">
              {prefix}
            </span>
          )}
          <span className="capsule-frame__content chip__content">{content}</span>
          {isEmptyChipSlot(suffix) ? null : (
            <span className="capsule-frame__slot chip__slot chip__slot--suffix">
              {suffix}
            </span>
          )}
        </span>
      </AnimatedInlineSizeMeasure>
    </>
  )
}
