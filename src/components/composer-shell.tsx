import { forwardRef, useEffect, useRef } from 'react'
import type { ComponentPropsWithoutRef, ReactNode, TransitionEvent } from 'react'

import { cn } from './lib/utils'

import './card-composer.css'

const COMPOSER_SHELL_TRANSITION_MS = 180

export type ComposerShellProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children'
> & {
  children: ReactNode
  isClosing?: boolean
  onExitAnimationEnd?: () => void
  onViewTransitionEnd?: () => void
}

export const ComposerShell = forwardRef<HTMLDivElement, ComposerShellProps>(
  function ComposerShell(
    {
      children,
      className,
      isClosing = false,
      onExitAnimationEnd,
      onTransitionEnd,
      onViewTransitionEnd,
      ...props
    },
    forwardedRef,
  ) {
    const wrapperRef = useRef<HTMLDivElement | null>(null)

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
      let frame = 0
      let fallbackTimer = 0

      function finishExitAnimation(cancelled: boolean) {
        if (cancelled) return

        onExitAnimationEnd?.()
      }

      frame = window.requestAnimationFrame(() => {
        const wrapper = wrapperRef.current
        const animations = wrapper?.getAnimations() ?? []
        if (animations.length === 0) {
          fallbackTimer = window.setTimeout(
            () => finishExitAnimation(cancelled),
            COMPOSER_SHELL_TRANSITION_MS,
          )
          return
        }

        void Promise.allSettled(
          animations.map((animation) =>
            animation.finished.then(() => undefined),
          ),
        ).then(() => finishExitAnimation(cancelled))
      })

      return () => {
        cancelled = true
        window.cancelAnimationFrame(frame)
        window.clearTimeout(fallbackTimer)
      }
    }, [isClosing, onExitAnimationEnd])

    function handleTransitionEnd(event: TransitionEvent<HTMLDivElement>) {
      onTransitionEnd?.(event)

      if (event.propertyName !== 'height') return
      if (!(event.target instanceof Element)) return

      const card = event.target.closest('.weimo-card')
      if (card?.getAttribute('data-mode') !== 'view') return

      onViewTransitionEnd?.()
    }

    return (
      <div
        {...props}
        className={cn('weimo-card-composer', className)}
        data-state={isClosing ? 'closing' : undefined}
        onTransitionEnd={handleTransitionEnd}
        ref={setWrapperNode}
      >
        <div className="weimo-card-composer__frame">
          {children}
        </div>
      </div>
    )
  },
)
