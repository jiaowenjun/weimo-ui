import type { ButtonHTMLAttributes, MouseEvent, ReactElement, ReactNode } from 'react'
import { Hash } from 'lucide-react'

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

import './capsule-button.css'
import './capsule-frame.css'
import './frosted-surface.css'

export type CapsuleButtonState = 'default' | 'frosted' | 'liquid-glass'

export type CapsuleButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'prefix'> & {
  animateWidth?: boolean
  prefix?: ReactElement | null
  state?: CapsuleButtonState
  suffix?: ReactElement | null
}

function isEmptyCapsuleButtonSlot(slot: ReactNode) {
  return slot === null || slot === undefined || typeof slot === 'boolean' || slot === ''
}

// 后缀部件点击就地拦截、不透传到胶囊本体:装饰性后缀(X 移除示能等)不应
// 触发胶囊 onClick;后缀元素自带的 onClick 先于本拦截执行,保留扩展位。
// 所有派生组件(EditableCapsule/TagBar 芯片等)经共享插槽自动继承。
function stopSuffixClickPropagation(event: MouseEvent<HTMLSpanElement>) {
  event.stopPropagation()
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
  const isFrostedState = state === 'frosted'
  const isLiquidGlassState = state === 'liquid-glass'
  const { backgroundStyle, backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLButtonElement>(
      isFrostedState || isLiquidGlassState,
    )
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
  // 字符——类型层已排除 string;插槽不嵌套 button 保持合法 HTML;后缀点击
  // 由 stopSuffixClickPropagation 就地拦截不透传,前缀与键盘激活仍由胶囊
  // 统一承接;默认前缀为 Hash 图标(对齐 TagBread),null 隐藏插槽,gap 不由
  // 空插槽垫宽;图标插槽的 hover/active 色由 capsule-button.css 以
  // nested-hover token 与胶囊自身反馈区分。
  const buttonContent = (
    <>
      {isEmptyCapsuleButtonSlot(prefix) ? null : (
        <span className="capsule-frame__slot capsule-button__prefix">{prefix}</span>
      )}
      <span className="capsule-frame__content capsule-button__text">{children}</span>
      {isEmptyCapsuleButtonSlot(suffix) ? null : (
        <span
          className="capsule-frame__slot capsule-button__suffix"
          onClick={stopSuffixClickPropagation}
        >
          {suffix}
        </span>
      )}
    </>
  )
  // noop 点击透传给玻璃层以启用库的悬停辉光与按压缩放反馈(同液态玻璃
  // 图标按钮);消费者的 onClick 仍由外层 button 承接,两者互不干扰。
  function noopLiquidGlassFeedback() {}

  // 液态玻璃态:按钮盒只做点击区,玻璃层绝对居中覆盖,隐藏 sizer 复刻
  // buttonContent 撑盒宽;不走 capsule-frame 材质层与 overflow:hidden,库投影
  // 可外溢。玻璃内边距镜像胶囊插槽几何(带插槽侧收窄到 6px)。
  if (isLiquidGlassState) {
    const liquidGlassPadding = `6px ${isEmptyCapsuleButtonSlot(suffix) ? '10px' : '6px'} 6px ${
      isEmptyCapsuleButtonSlot(prefix) ? '10px' : '6px'
    }`

    return (
      <button
        className={cn('capsule-button', 'capsule-button--liquid-glass', className)}
        data-background-tone={backgroundTone ?? undefined}
        data-state={state}
        ref={setElementRef}
        style={style}
        type="button"
        {...props}
      >
        <LiquidGlassSurface
          className="capsule-button__liquid-glass-layer"
          cornerRadius={999}
          onClick={noopLiquidGlassFeedback}
          padding={liquidGlassPadding}
        >
          {buttonContent}
        </LiquidGlassSurface>
        <span
          aria-hidden="true"
          className="capsule-button__liquid-sizer"
          style={{ padding: liquidGlassPadding }}
        >
          {buttonContent}
        </span>
      </button>
    )
  }

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
