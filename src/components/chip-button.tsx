import type { ButtonHTMLAttributes, ReactNode } from 'react'

import { AnimatedInlineSizeMeasure } from './animated-inline-size'
import {
  getChipSurfaceAttributes,
  getChipSurfaceClassName,
  type ChipSurfaceTextSize,
} from './chip-surface-model'
import {
  getAnimatedInlineSizeStyle,
  useAnimatedInlineSize,
} from './animated-inline-size-model'
import { useFrostedSurfaceBackgroundToneRef } from './frosted-surface'

import './chip-surface.css'
import './chip-button.css'
import './frosted-surface.css'

export type ChipButtonState = 'default' | 'glass'

export type ChipButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> & {
  animateWidth?: boolean
  prefix?: ReactNode
  state?: ChipButtonState
  suffix?: ReactNode
  textSize?: ChipSurfaceTextSize
}

function isEmptyChipButtonSlot(slot: ReactNode) {
  return slot === null || slot === undefined || typeof slot === 'boolean' || slot === ''
}

export function ChipButton({
  animateWidth = false,
  children,
  className,
  prefix = '#',
  state = 'default',
  style,
  suffix,
  textSize = 'sm',
  ...props
}: ChipButtonProps) {
  const isGlassState = state === 'glass'
  const { backgroundStyle, backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLButtonElement>(isGlassState)
  const { measureRef, inlineSize } = useAnimatedInlineSize([
    prefix,
    children,
    state,
    suffix,
    textSize,
  ])
  const chipSurfaceAttributes = getChipSurfaceAttributes({ variant: state, interactive: true, textSize })
  // prefix/suffix 是整体按钮内部的独立小部件(字符或图标,如 Hash 图标、可关闭
  // 胶囊的 X 图标),纯视觉不承接交互——button 内不能嵌套交互元素,点击统一由
  // 胶囊按钮自身承接;空前缀隐藏插槽,gap 不由空插槽垫宽。
  const buttonContent = (
    <>
      {isEmptyChipButtonSlot(prefix) ? null : (
        <span className="chip-surface__slot chip-button__prefix">{prefix}</span>
      )}
      <span className="chip-surface__content chip-button__text">{children}</span>
      {isEmptyChipButtonSlot(suffix) ? null : (
        <span className="chip-surface__slot chip-button__suffix">{suffix}</span>
      )}
    </>
  )
  const button = (
    <button
      className={getChipSurfaceClassName(
        isGlassState && 'frosted-surface',
        'chip-button',
        'chip-button--button',
        className,
      )}
      data-background-tone={
        isGlassState ? backgroundTone ?? undefined : undefined
      }
      data-state={state}
      ref={isGlassState ? setElementRef : undefined}
      style={
        animateWidth
          ? { ...getAnimatedInlineSizeStyle(style, inlineSize), ...backgroundStyle }
          : { ...style, ...backgroundStyle }
      }
      type="button"
      {...chipSurfaceAttributes}
      {...props}
    >
      {buttonContent}
    </button>
  )

  if (!animateWidth) {
    return button
  }

  return (
    <>
      {button}
      <AnimatedInlineSizeMeasure measureRef={measureRef}>
        <button
          className={getChipSurfaceClassName('chip-button', 'chip-button--button')}
          data-state={state}
          type="button"
          {...chipSurfaceAttributes}
        >
          {buttonContent}
        </button>
      </AnimatedInlineSizeMeasure>
    </>
  )
}
