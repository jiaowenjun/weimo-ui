import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react'
import { Hash } from 'lucide-react'

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
  prefix?: ReactElement | null
  state?: ChipButtonState
  suffix?: ReactElement | null
  textSize?: ChipSurfaceTextSize
}

function isEmptyChipButtonSlot(slot: ReactNode) {
  return slot === null || slot === undefined || typeof slot === 'boolean' || slot === ''
}

export function ChipButton({
  animateWidth = false,
  children,
  className,
  prefix = <Hash aria-hidden="true" />,
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
  // prefix/suffix 是整体按钮内部的独立小部件,只接受图标元素(Hash 图标、可
  // 关闭胶囊的 X 幽灵图标按钮等),不支持普通字符——类型层已排除 string;
  // 默认前缀为 Hash 图标(对齐 TagBread),null 隐藏插槽,gap 不由空插槽垫宽;
  // 嵌套图标按钮的 hover/active 色由 chip-button.css 以 nested-hover token 与
  // 胶囊自身反馈区分,点击会冒泡至胶囊按钮统一承接。
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
      data-has-prefix={isEmptyChipButtonSlot(prefix) ? undefined : 'true'}
      data-has-suffix={isEmptyChipButtonSlot(suffix) ? undefined : 'true'}
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
          data-has-prefix={isEmptyChipButtonSlot(prefix) ? undefined : 'true'}
          data-has-suffix={isEmptyChipButtonSlot(suffix) ? undefined : 'true'}
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
