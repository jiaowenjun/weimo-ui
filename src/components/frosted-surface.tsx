import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import type { ComponentPropsWithoutRef, CSSProperties, RefObject } from 'react'

import {
  getFrostedSurfaceClassName,
  interpolateFrostedBorderColor,
  resolveElementBackgroundSample,
  type FrostedSurfaceBackgroundSample,
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
  const backgroundSample = useFrostedSurfaceBackgroundToneForElement(
    elementRef.current,
    observe,
  )

  return backgroundSample?.tone ?? null
}

// 返回完整采样:backgroundTone 驱动 data-background-tone,backgroundLuminance 供
// 演示页直接展示材质感知到的背景相对亮度(两者来自同一次采样,不会相互漂移)。
// backgroundStyle 以 inline 自定义属性下发插值边框色——所有磨砂材质的边框
// 亮度随感知亮度两段递增,直接声明 border-color 的规则(如禁用描边)优先级更高
// 不受影响;采样前为 undefined,CSS 的 tone 二值声明作为回退。
export function useFrostedSurfaceBackgroundToneRef<ElementType extends HTMLElement>(
  observe: boolean,
) {
  const [element, setElement] = useState<ElementType | null>(null)
  const backgroundSample = useFrostedSurfaceBackgroundToneForElement(element, observe)
  const setElementRef = useCallback((nextElement: ElementType | null) => {
    setElement((currentElement) => (
      currentElement === nextElement ? currentElement : nextElement
    ))
  }, [])

  const interpolatedBorderColor = interpolateFrostedBorderColor(
    backgroundSample?.luminance ?? null,
  )

  return {
    backgroundLuminance: backgroundSample?.luminance ?? null,
    backgroundStyle: interpolatedBorderColor
      ? ({ '--glass-surface-border': interpolatedBorderColor }) as CSSProperties
      : undefined,
    backgroundTone: backgroundSample?.tone ?? null,
    setElementRef,
  }
}

function useFrostedSurfaceBackgroundToneForElement<ElementType extends HTMLElement>(
  element: ElementType | null,
  observe: boolean,
) {
  const [backgroundSample, setBackgroundSample] =
    useState<FrostedSurfaceBackgroundSample | null>(null)

  useIsomorphicLayoutEffect(() => {
    const ownerWindow = element?.ownerDocument.defaultView

    if (!element || !ownerWindow || !observe) {
      setBackgroundSample(null)

      return undefined
    }

    let animationFrame = 0
    const scrollParents = getFrostedSurfaceScrollParents(element)
    const scrollListenerOptions = { capture: true, passive: true } as const

    const updateBackgroundTone = () => {
      animationFrame = 0
      const nextSample = resolveElementBackgroundSample(element)

      setBackgroundSample((currentSample) => (
        currentSample?.tone === nextSample?.tone &&
        currentSample?.luminance === nextSample?.luminance
          ? currentSample
          : nextSample
      ))
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

  return backgroundSample
}

export function FrostedSurface({
  bordered = true,
  className,
  observe = true,
  style,
  ...props
}: FrostedSurfaceProps) {
  const { backgroundStyle, backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLDivElement>(observe)

  return (
    <div
      className={getFrostedSurfaceClassName(
        bordered ? 'frosted-surface--bordered' : undefined,
        className,
      )}
      data-background-tone={backgroundTone ?? undefined}
      ref={setElementRef}
      style={{ ...style, ...backgroundStyle }}
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
