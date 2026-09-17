import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ComponentPropsWithoutRef } from 'react'

import {
  acquireCachedCanvasTransparencyAssets,
  acquireCanvasTransparencyAssets,
  DEFAULT_CANVAS_TRANSPARENCY_OPTIONS,
  peekCachedCanvasTransparencyAssets,
  type CachedCanvasTransparencyAsset,
  type CachedCanvasTransparencyAssets,
} from './canvas-transparency-cache'
import type { CanvasTransparencyRgbColor } from './canvas-transparency-model'

export type { CanvasTransparencyRgbColor } from './canvas-transparency-model'

type CanvasTransparencyTone = 'light' | 'dark'

export type CanvasTransparencyAsset = CachedCanvasTransparencyAsset

export type CanvasTransparencyState =
  | { status: 'loading' }
  | { status: 'ready'; asset: CanvasTransparencyAsset; background: CanvasTransparencyRgbColor }
  | { status: 'error'; error: Error }

export type CanvasTransparencyProps = Omit<ComponentPropsWithoutRef<'img'>, 'src' | 'alt'> & {
  src: string
  alt: string
  tolerance?: number
  feather?: number
  onStateChange?: (state: CanvasTransparencyState) => void
}

type CanvasTransparencyInternalState =
  | { requestKey: string; status: 'loading' }
  | {
      requestKey: string
      status: 'ready'
      assets: Record<CanvasTransparencyTone, CanvasTransparencyAsset>
      background: CanvasTransparencyRgbColor
    }
  | { requestKey: string; status: 'error'; error: Error }

function createReadyState(
  requestKey: string,
  assets: CachedCanvasTransparencyAssets,
): CanvasTransparencyInternalState {
  return {
    requestKey,
    status: 'ready',
    assets: {
      dark: assets.dark,
      light: assets.light,
    },
    background: assets.background,
  }
}

function normalizeError(error: unknown) {
  return error instanceof Error ? error : new Error('图像透明化处理失败。')
}

function resolveCanvasTransparencyTone(element: HTMLElement): CanvasTransparencyTone {
  const colorScheme = window.getComputedStyle(element).colorScheme
  const schemes = colorScheme.split(/\s+/)

  if (schemes.includes('dark') && !schemes.includes('light')) return 'dark'
  if (schemes.includes('light') && !schemes.includes('dark')) return 'light'
  if (document.documentElement.classList.contains('dark')) return 'dark'

  return 'light'
}

export function CanvasTransparency({
  alt,
  feather = DEFAULT_CANVAS_TRANSPARENCY_OPTIONS.feather,
  onStateChange,
  src,
  tolerance = DEFAULT_CANVAS_TRANSPARENCY_OPTIONS.tolerance,
  ...imageProps
}: CanvasTransparencyProps) {
  const requestKey = JSON.stringify([src, tolerance, feather])
  const [state, setState] = useState<CanvasTransparencyInternalState>(() => {
    const cachedAssets = peekCachedCanvasTransparencyAssets(src, {
      tolerance,
      feather,
    })

    return cachedAssets
      ? createReadyState(requestKey, cachedAssets)
      : { requestKey, status: 'loading' }
  })
  const imageRef = useRef<HTMLImageElement | null>(null)
  const onStateChangeRef = useRef(onStateChange)
  const [tone, setTone] = useState<CanvasTransparencyTone | null>(null)

  useEffect(() => {
    onStateChangeRef.current = onStateChange
  }, [onStateChange])

  useLayoutEffect(() => {
    let active = true
    let release: (() => void) | undefined

    function applyLease(
      lease: Awaited<ReturnType<typeof acquireCanvasTransparencyAssets>>,
    ) {
      if (!active) {
        lease.release()
        return
      }

      release = lease.release
      setState(createReadyState(requestKey, lease.assets))
    }

    const cachedLease = acquireCachedCanvasTransparencyAssets(src, {
      tolerance,
      feather,
    })

    if (cachedLease) {
      applyLease(cachedLease)
    } else {
      void acquireCanvasTransparencyAssets(src, { tolerance, feather })
        .then(applyLease)
        .catch((error: unknown) => {
          if (!active) return

          setState({ requestKey, status: 'error', error: normalizeError(error) })
        })
    }

    return () => {
      active = false
      release?.()
    }
  }, [feather, requestKey, src, tolerance])

  const currentState = state.requestKey === requestKey
    ? state
    : (() => {
        const cachedAssets = peekCachedCanvasTransparencyAssets(src, {
          tolerance,
          feather,
        })

        return cachedAssets
          ? createReadyState(requestKey, cachedAssets)
          : { requestKey, status: 'loading' } satisfies CanvasTransparencyInternalState
      })()

  useLayoutEffect(() => {
    if (currentState.requestKey !== requestKey || currentState.status !== 'ready') return

    const element = imageRef.current
    if (!element) return

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const syncTone = () => {
      const nextTone = resolveCanvasTransparencyTone(element)
      setTone((currentTone) => currentTone === nextTone ? currentTone : nextTone)
    }
    const observer = new MutationObserver(syncTone)

    syncTone()
    observer.observe(document.documentElement, {
      attributeFilter: ['class', 'style', 'data-theme', 'data-image-theme'],
      attributes: true,
      subtree: true,
    })
    mediaQuery.addEventListener('change', syncTone)

    return () => {
      observer.disconnect()
      mediaQuery.removeEventListener('change', syncTone)
    }
  }, [currentState, requestKey])

  useEffect(() => {
    const listener = onStateChangeRef.current

    if (!listener) return

    if (currentState.requestKey !== requestKey) {
      listener({ status: 'loading' })
      return
    }

    if (currentState.status === 'ready' && tone) {
      listener({
        status: 'ready',
        asset: currentState.assets[tone],
        background: currentState.background,
      })
      return
    }

    if (currentState.status === 'error') {
      listener({ status: 'error', error: currentState.error })
      return
    }

    listener({ status: 'loading' })
  }, [currentState, requestKey, tone])

  if (currentState.requestKey !== requestKey) return null
  if (currentState.status !== 'ready') return null

  const selectedTone = tone ?? 'light'
  const selectedAsset = currentState.assets[selectedTone]

  return (
    <img
      {...imageProps}
      alt={alt}
      height={imageProps.height ?? selectedAsset.height}
      ref={imageRef}
      src={selectedAsset.url}
      width={imageProps.width ?? selectedAsset.width}
    />
  )
}
