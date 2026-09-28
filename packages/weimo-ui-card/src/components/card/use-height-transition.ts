import { useEffect, useRef, useState } from 'react'
import type { TransitionEvent } from 'react'

export function useHeightTransition(
  durationMs: number,
  onFinish: () => void,
) {
  const [animatedHeight, setAnimatedHeight] = useState<string | null>(null)
  const fallbackRef = useRef<number | null>(null)
  const frameRef = useRef<number | null>(null)
  const onFinishRef = useRef(onFinish)

  useEffect(() => {
    onFinishRef.current = onFinish
  }, [onFinish])

  function clear() {
    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
      frameRef.current = null
    }

    if (fallbackRef.current !== null) {
      window.clearTimeout(fallbackRef.current)
      fallbackRef.current = null
    }
  }

  function lockHeight(height: string) {
    setAnimatedHeight(height)
  }

  function unlockHeight() {
    setAnimatedHeight(null)
  }

  function onNextFrame(callback: () => void) {
    clear()
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = null
      callback()
    })
  }

  function animateTo(targetHeight: string, onTargetFrame?: () => void) {
    clear()
    frameRef.current = window.requestAnimationFrame(() => {
      frameRef.current = window.requestAnimationFrame(() => {
        frameRef.current = null
        onTargetFrame?.()
        setAnimatedHeight(targetHeight)
        fallbackRef.current = window.setTimeout(() => {
          onFinishRef.current()
        }, durationMs + 80)
      })
    })
  }

  function handleTransitionEnd(event: TransitionEvent<HTMLElement>) {
    if (event.currentTarget !== event.target || event.propertyName !== 'height') return

    onFinishRef.current()
  }

  return {
    animatedHeight,
    animateTo,
    clear,
    handleTransitionEnd,
    lockHeight,
    onNextFrame,
    unlockHeight,
  }
}
