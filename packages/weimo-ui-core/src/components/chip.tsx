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
import { LiquidGlassSurface } from './liquid-glass'
import { cn } from 'weimo-ui-core/lib/utils'

import './capsule-frame.css'
import './chip.css'
import './frosted-surface.css'

export type ChipVariant = 'default' | 'frosted' | 'liquid-glass'

type ChipContent = Exclude<ReactNode, boolean | null | undefined>

export type ChipProps = Omit<ComponentPropsWithoutRef<'span'>, 'children' | 'content' | 'prefix'> & {
  bordered?: boolean
  prefix?: ReactNode
  content: ChipContent
  suffix?: ReactNode
  variant?: ChipVariant
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
  ...props
}: ChipProps) {
  if (isEmptyChipSlot(content)) {
    throw new Error('Chip content cannot be empty.')
  }

  const isFrostedVariant = variant === 'frosted'
  const isLiquidGlassVariant = variant === 'liquid-glass'
  const { backgroundStyle, backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLSpanElement>(
      isFrostedVariant || isLiquidGlassVariant,
    )
  const { measureRef, inlineSize } = useAnimatedInlineSize([
    prefix,
    content,
    suffix,
    variant,
  ])

  // 液态玻璃态:壳只做几何容器,玻璃层(LiquidGlassSurface)绝对居中覆盖,
  // 隐藏 sizer 复刻槽位内容撑盒宽;不走 capsule-frame 材质层与 overflow:hidden,
  // 库投影可外溢。玻璃内边距镜像胶囊插槽几何(带插槽侧收窄到 6px)。
  if (isLiquidGlassVariant) {
    const liquidGlassPadding = `6px ${isEmptyChipSlot(suffix) ? '10px' : '6px'} 6px ${
      isEmptyChipSlot(prefix) ? '10px' : '6px'
    }`
    const liquidSlots = (
      <>
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
      </>
    )

    return (
      <span
        className={cn('chip', 'chip--liquid-glass', className)}
        data-background-tone={backgroundTone ?? undefined}
        ref={setElementRef}
        style={style}
        {...props}
      >
        <LiquidGlassSurface
          className="chip__liquid-glass-layer"
          cornerRadius={999}
          padding={liquidGlassPadding}
        >
          {liquidSlots}
        </LiquidGlassSurface>
        <span
          aria-hidden="true"
          className="chip__liquid-sizer"
          style={{ padding: liquidGlassPadding }}
        >
          {liquidSlots}
        </span>
      </span>
    )
  }
  const capsuleFrameAttributes = getCapsuleFrameAttributes({
    material: isFrostedVariant ? 'frosted' : 'solid',
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
        data-has-prefix={isEmptyChipSlot(prefix) ? undefined : 'true'}
        data-has-suffix={isEmptyChipSlot(suffix) ? undefined : 'true'}
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
          data-has-prefix={isEmptyChipSlot(prefix) ? undefined : 'true'}
          data-has-suffix={isEmptyChipSlot(suffix) ? undefined : 'true'}
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
