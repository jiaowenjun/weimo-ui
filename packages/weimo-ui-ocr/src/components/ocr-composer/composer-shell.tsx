import { forwardRef, useEffect, useRef, useState } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from 'weimo-ui-core/lib/utils'

import 'weimo-ui-core/styles/tokens.css'
import './ocr-composer.css'

const COMPOSER_SHELL_TRANSITION_MS = 180

export type ComposerShellProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children'
> & {
  children: ReactNode
  isClosing?: boolean
  onExitAnimationEnd?: () => void
}

/**
 * ComposerShell:「新建」占位的折叠壳层,与内容完全解耦(只认 children)。
 * 移植自 weimo-ui-editor 的 ComposerShell(源头是 weimo-ui monorepo),
 * 类名前缀改为 weimo-ocr-composer-shell,编舞逻辑保持一致。
 *
 * 退场协议:React 卸载没有退出动画钩子,由父级单向驱动——父置 isClosing,
 * 壳切 data-state='closing' 播收起动画并禁指针;等 wrapper.getAnimations()
 * 全部 finished 后回调 onExitAnimationEnd,父级才真正卸载。无动画
 * (reduced-motion/竞态)走固定时长兜底,保证回调必达。
 */
export const ComposerShell = forwardRef<HTMLDivElement, ComposerShellProps>(
  function ComposerShell(
    {
      children,
      className,
      isClosing = false,
      onExitAnimationEnd,
      ...props
    },
    forwardedRef,
  ) {
    const wrapperRef = useRef<HTMLDivElement | null>(null)
    // 稳态标记:进场动画结束后放开 overflow,让卡片投影溢出壳层
    // (0fr 折叠的动画遮罩只在进出场期需要);closing 起时撤回,退场
    // 动画重新获得遮罩。纯装饰性放开,定时器到达即可,无需精确事件。
    const [settled, setSettled] = useState(false)

    useEffect(() => {
      const timer = window.setTimeout(
        () => setSettled(true),
        COMPOSER_SHELL_TRANSITION_MS + 80,
      )
      return () => window.clearTimeout(timer)
    }, [])

    useEffect(() => {
      if (isClosing) setSettled(false)
    }, [isClosing])

    function setWrapperNode(node: HTMLDivElement | null) {
      wrapperRef.current = node

      if (typeof forwardedRef === 'function') {
        forwardedRef(node)
        return
      }

      if (forwardedRef) {
        forwardedRef.current = node
      }
    }

    useEffect(() => {
      if (!isClosing) return

      let cancelled = false
      let observed = false
      let frame = 0
      let fallbackTimer = 0
      let settleTimer = 0

      function finishExitAnimation() {
        if (cancelled) return

        cancelled = true
        window.clearTimeout(fallbackTimer)
        window.clearTimeout(settleTimer)
        onExitAnimationEnd?.()
      }

      function observeExitAnimations() {
        if (observed || cancelled) return
        observed = true
        window.cancelAnimationFrame(frame)

        const animations = wrapperRef.current?.getAnimations() ?? []
        if (animations.length === 0) {
          fallbackTimer = window.setTimeout(
            finishExitAnimation,
            COMPOSER_SHELL_TRANSITION_MS,
          )
          return
        }

        void Promise.allSettled(
          animations.map((animation) =>
            animation.finished.then(() => undefined),
          ),
        ).then(finishExitAnimation)
        // 冻结环境(后台标签页/自动化节流)下 CSS 动画可能停摆不 finish,
        // 定时器竞速保证退场回调必达——父级靠它卸载,等不起。
        settleTimer = window.setTimeout(
          finishExitAnimation,
          COMPOSER_SHELL_TRANSITION_MS * 3,
        )
      }

      // 观察入口同样须竞速:rAF 本身可能挂起(同上),定时器兜底进入。
      frame = window.requestAnimationFrame(observeExitAnimations)
      fallbackTimer = window.setTimeout(
        observeExitAnimations,
        COMPOSER_SHELL_TRANSITION_MS * 2,
      )

      return () => {
        cancelled = true
        window.cancelAnimationFrame(frame)
        window.clearTimeout(fallbackTimer)
        window.clearTimeout(settleTimer)
      }
    }, [isClosing, onExitAnimationEnd])

    return (
      <div
        {...props}
        className={cn('weimo-ocr-composer-shell', className)}
        data-settled={settled ? 'true' : undefined}
        data-state={isClosing ? 'closing' : undefined}
        ref={setWrapperNode}
      >
        <div className="weimo-ocr-composer-shell__frame">
          {children}
        </div>
      </div>
    )
  },
)
