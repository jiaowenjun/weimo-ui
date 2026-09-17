import { useCallback, useEffect, useLayoutEffect, useState } from 'react'
import type { ComponentPropsWithoutRef, RefObject } from 'react'

import {
  getGlassSurfaceClassName,
  resolveElementBackgroundTone,
  type GlassSurfaceBackgroundTone,
} from './glass-surface-model'

import './glass-surface.css'

const useIsomorphicLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect
type GlassSurfaceScrollParent = HTMLElement | Window

export { getGlassSurfaceClassName }

export type GlassSurfaceProps = ComponentPropsWithoutRef<'div'> & {
  observe?: boolean
}

export function useGlassSurfaceBackgroundTone<ElementType extends HTMLElement>(
  elementRef: RefObject<ElementType | null>,
  observe: boolean,
) {
  return useGlassSurfaceBackgroundToneForElement(elementRef.current, observe)
}

export function useGlassSurfaceBackgroundToneRef<ElementType extends HTMLElement>(
  observe: boolean,
) {
  const [element, setElement] = useState<ElementType | null>(null)
  const backgroundTone = useGlassSurfaceBackgroundToneForElement(element, observe)
  const setElementRef = useCallback((nextElement: ElementType | null) => {
    setElement((currentElement) => (
      currentElement === nextElement ? currentElement : nextElement
    ))
  }, [])

  return { backgroundTone, setElementRef }
}

function useGlassSurfaceBackgroundToneForElement<ElementType extends HTMLElement>(
  element: ElementType | null,
  observe: boolean,
) {
  const [backgroundTone, setBackgroundTone] =
    useState<GlassSurfaceBackgroundTone | null>(null)

  useIsomorphicLayoutEffect(() => {
    const ownerWindow = element?.ownerDocument.defaultView

    if (!element || !ownerWindow || !observe) {
      setBackgroundTone(null)

      return undefined
    }

    let animationFrame = 0
    const scrollParents = getGlassSurfaceScrollParents(element)
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

export function GlassSurface({
  className,
  observe = true,
  ...props
}: GlassSurfaceProps) {
  const { backgroundTone, setElementRef } =
    useGlassSurfaceBackgroundToneRef<HTMLDivElement>(observe)

  return (
    <div
      className={getGlassSurfaceClassName(className)}
      data-background-tone={backgroundTone ?? undefined}
      ref={setElementRef}
      {...props}
    />
  )
}

function getGlassSurfaceScrollParents(element: HTMLElement) {
  const ownerWindow = element.ownerDocument.defaultView
  const scrollParents: GlassSurfaceScrollParent[] = ownerWindow ? [ownerWindow] : []
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
