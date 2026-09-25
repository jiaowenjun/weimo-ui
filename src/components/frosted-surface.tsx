import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import type { ComponentPropsWithoutRef, RefObject } from 'react'

import {
  getFrostedSurfaceClassName,
  resolveElementBackgroundTone,
  type FrostedSurfaceBackgroundTone,
} from './frosted-surface-model'

import './frosted-surface.css'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
type FrostedSurfaceScrollParent = HTMLElement | Window

export { getFrostedSurfaceClassName }

export type FrostedSurfaceProps = ComponentPropsWithoutRef<'div'> & {
  bordered?: boolean
  observe?: boolean
}

export function useFrostedSurfaceBackgroundTone<ElementType extends HTMLElement>(
  elementRef: RefObject<ElementType | null>,
  observe: boolean,
) {
  return useFrostedSurfaceBackgroundToneForElement(elementRef.current, observe)
}

export function useFrostedSurfaceBackgroundToneRef<ElementType extends HTMLElement>(
  observe: boolean,
) {
  const [element, setElement] = useState<ElementType | null>(null)
  const backgroundTone = useFrostedSurfaceBackgroundToneForElement(element, observe)
  const setElementRef = useCallback((nextElement: ElementType | null) => {
    setElement((currentElement) => (
      currentElement === nextElement ? currentElement : nextElement
    ))
  }, [])

  return { backgroundTone, setElementRef }
}

function useFrostedSurfaceBackgroundToneForElement<ElementType extends HTMLElement>(
  element: ElementType | null,
  observe: boolean,
) {
  const [backgroundTone, setBackgroundTone] =
    useState<FrostedSurfaceBackgroundTone | null>(null)

  useIsomorphicLayoutEffect(() => {
    const ownerWindow = element?.ownerDocument.defaultView

    if (!element || !ownerWindow || !observe) {
      setBackgroundTone(null)

      return undefined
    }

    let animationFrame = 0
    const scrollParents = getFrostedSurfaceScrollParents(element)
    const scrollListenerOptions = { capture: true, passive: true } as const

    const updateBackgroundTone = () => {
      animationFrame = 0
      const nextTone = resolveElementBackgroundTone(element)

      setBackgroundTone((currentTone) => (currentTone === nextTone ? currentTone : nextTone))
    }

    const scheduleUpdate = () => {
      if (animationFrame) {
        return
      }

      animationFrame = ownerWindow.requestAnimationFrame(updateBackgroundTone)
    }

    const resizeObserver =
      'ResizeObserver' in ownerWindow ? new ownerWindow.ResizeObserver(scheduleUpdate) : null
    const mutationObserver =
      'MutationObserver' in ownerWindow
        ? new ownerWindow.MutationObserver(scheduleUpdate)
        : null

    // 首次挂载在绘制前确定字色,后续定位/背景变化仍按帧合并采样。
    updateBackgroundTone()
    scheduleUpdate()
    resizeObserver?.observe(element)
    resizeObserver?.observe(element.ownerDocument.documentElement)
    mutationObserver?.observe(element.ownerDocument.documentElement, {
      attributeFilter: ['class', 'style'],
      attributes: true,
      childList: true,
      subtree: true,
    })
    ownerWindow.addEventListener('resize', scheduleUpdate, { passive: true })
    scrollParents.forEach((scrollParent) => {
      scrollParent.addEventListener('scroll', scheduleUpdate, scrollListenerOptions)
    })

    return () => {
      if (animationFrame) {
        ownerWindow.cancelAnimationFrame(animationFrame)
      }

      resizeObserver?.disconnect()
      mutationObserver?.disconnect()
      ownerWindow.removeEventListener('resize', scheduleUpdate)
      scrollParents.forEach((scrollParent) => {
        scrollParent.removeEventListener('scroll', scheduleUpdate, scrollListenerOptions)
      })
    }
  }, [element, observe])

  return backgroundTone
}

export function FrostedSurface({
  bordered = false,
  className,
  observe = true,
  ...props
}: FrostedSurfaceProps) {
  const { backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLDivElement>(observe)

  return (
    <div
      className={getFrostedSurfaceClassName(
        bordered ? 'frosted-surface--bordered' : undefined,
        className,
      )}
      data-background-tone={backgroundTone ?? undefined}
      ref={setElementRef}
      {...props}
    />
  )
}

function getFrostedSurfaceScrollParents(element: HTMLElement) {
  const ownerWindow = element.ownerDocument.defaultView
  const scrollParents: FrostedSurfaceScrollParent[] = ownerWindow ? [ownerWindow] : []
  let current = element.parentElement

  while (current && ownerWindow) {
    const style = ownerWindow.getComputedStyle(current)
    const scrollableOverflow = `${style.overflowY} ${style.overflow}`
    const canScroll = current.scrollHeight > current.clientHeight

    if (canScroll && /\b(auto|scroll|overlay)\b/.test(scrollableOverflow)) {
      scrollParents.push(current)
    }

    current = current.parentElement
  }

  return scrollParents
}
