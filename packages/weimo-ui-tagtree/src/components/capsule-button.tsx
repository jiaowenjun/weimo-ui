import type { ButtonHTMLAttributes, ReactElement, ReactNode } from 'react'
import { Hash } from 'lucide-react'

import { AnimatedInlineSizeMeasure } from 'weimo-ui-core/components/animated-inline-size'
import {
  getCapsuleFrameAttributes,
  getCapsuleFrameClassName,
} from 'weimo-ui-core/components/capsule-frame'
import {
  getAnimatedInlineSizeStyle,
  useAnimatedInlineSize,
} from 'weimo-ui-core/components/animated-inline-size-model'
import {
  getFrostedSurfaceClassName,
  useFrostedSurfaceBackgroundToneRef,
} from 'weimo-ui-core/components/frosted-surface'

import './capsule-button.css'
import 'weimo-ui-core/styles/capsule-frame.css'
import 'weimo-ui-core/styles/frosted-surface.css'

export type CapsuleButtonState = 'default' | 'glass'

export type CapsuleButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> & {
  animateWidth?: boolean
  prefix?: ReactElement | null
  state?: CapsuleButtonState
  suffix?: ReactElement | null
}

function isEmptyCapsuleButtonSlot(slot: ReactNode) {
  return slot === null || slot === undefined || typeof slot === 'boolean' || slot === ''
}

export function CapsuleButton({
  animateWidth = false,
  children,
  className,
  prefix = <Hash aria-hidden="true" />,
  state = 'default',
  style,
  suffix,
  ...props
}: CapsuleButtonProps) {
  const isFrostedState = state === 'glass'
  const { backgroundStyle, backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLButtonElement>(isFrostedState)
  const { measureRef, inlineSize } = useAnimatedInlineSize([
    prefix,
    children,
    state,
    suffix,
  ])
  // 胶囊只保留小字号一档(sm):字号由 capsule-frame 基底统一指定,尺寸参数已删除。
  const capsuleFrameAttributes = getCapsuleFrameAttributes({
    interactive: true,
    material: isFrostedState ? 'frosted' : 'solid',
  })
  const frostedSurfaceClassName = isFrostedState
    ? getFrostedSurfaceClassName('frosted-surface--bordered')
    : undefined
  // prefix/suffix 是整体按钮内部的独立图标插槽,只接受图标元素,不支持普通
  // 字符——类型层已排除 string;交互由外层胶囊按钮统一承接,避免在 button
  // 内嵌套另一个 button 造成无效 HTML;
  // 默认前缀为 Hash 图标(对齐 TagBread),null 隐藏插槽,gap 不由空插槽垫宽;
  // 图标插槽的 hover/active 色由 capsule-button.css 以 nested-hover token 与
  // 胶囊自身反馈区分。
  const buttonContent = (
    <>
      {isEmptyCapsuleButtonSlot(prefix) ? null : (
        <span className="capsule-frame__slot capsule-button__prefix">{prefix}</span>
      )}
      <span className="capsule-frame__content capsule-button__text">{children}</span>
      {isEmptyCapsuleButtonSlot(suffix) ? null : (
        <span className="capsule-frame__slot capsule-button__suffix">{suffix}</span>
      )}
    </>
  )
  const button = (
    <button
      className={getCapsuleFrameClassName(
        frostedSurfaceClassName,
        'capsule-button',
        'capsule-button--button',
        className,
      )}
      data-background-tone={
        isFrostedState ? backgroundTone ?? undefined : undefined
      }
      data-has-prefix={isEmptyCapsuleButtonSlot(prefix) ? undefined : 'true'}
      data-has-suffix={isEmptyCapsuleButtonSlot(suffix) ? undefined : 'true'}
      data-state={state}
      ref={isFrostedState ? setElementRef : undefined}
      style={
        animateWidth
          ? { ...getAnimatedInlineSizeStyle(style, inlineSize), ...backgroundStyle }
          : { ...style, ...backgroundStyle }
      }
      type="button"
      {...capsuleFrameAttributes}
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
          className={getCapsuleFrameClassName(
            frostedSurfaceClassName,
            'capsule-button',
            'capsule-button--button',
          )}
          data-has-prefix={isEmptyCapsuleButtonSlot(prefix) ? undefined : 'true'}
          data-has-suffix={isEmptyCapsuleButtonSlot(suffix) ? undefined : 'true'}
          data-state={state}
          type="button"
          {...capsuleFrameAttributes}
        >
          {buttonContent}
        </button>
      </AnimatedInlineSizeMeasure>
    </>
  )
}
