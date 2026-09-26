import { act, cleanup, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useFrostedSurfaceBackgroundToneRef } from '../src/components/frosted-surface'
import { resolveElementBackgroundSample } from '../src/components/frosted-surface-model'

vi.mock('../src/components/frosted-surface-model', async (importOriginal) => ({
  ...await importOriginal<typeof import('../src/components/frosted-surface-model')>(),
  resolveElementBackgroundSample: vi.fn(),
}))

function ToneProbe({ mounted = true, positioned = true }) {
  const { backgroundTone, setElementRef } =
    useFrostedSurfaceBackgroundToneRef<HTMLDivElement>(positioned)

  return mounted ? (
    <div data-testid="surface" data-background-tone={backgroundTone ?? undefined} ref={setElementRef} />
  ) : null
}

const frames = new Map<number, FrameRequestCallback>()
let frameId = 0

function flushFrame() {
  const callbacks = [...frames.values()]
  frames.clear()
  act(() => callbacks.forEach((callback) => callback(0)))
}

beforeEach(() => {
  frames.clear()
  frameId = 0
  vi.mocked(resolveElementBackgroundSample).mockReset().mockReturnValue({
    luminance: 0.9,
    tone: 'light',
  })
  vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
    frames.set(++frameId, callback)
    return frameId
  })
  vi.spyOn(window, 'cancelAnimationFrame').mockImplementation((id) => {
    frames.delete(id)
  })
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('surface background tone timing', () => {
  it('samples a delayed popup mount before any animation frame runs', () => {
    const { rerender } = render(<ToneProbe mounted={false} />)
    expect(resolveElementBackgroundSample).not.toHaveBeenCalled()

    rerender(<ToneProbe />)

    expect(screen.getByTestId('surface')).toHaveAttribute('data-background-tone', 'light')
    expect(frames.size).toBe(1)
  })

  it('waits for positioning and resamples before paint when observation starts', () => {
    const { rerender } = render(<ToneProbe positioned={false} />)
    expect(resolveElementBackgroundSample).not.toHaveBeenCalled()
    expect(screen.getByTestId('surface')).not.toHaveAttribute('data-background-tone')

    rerender(<ToneProbe positioned />)

    expect(screen.getByTestId('surface')).toHaveAttribute('data-background-tone', 'light')

    rerender(<ToneProbe positioned={false} />)
    vi.mocked(resolveElementBackgroundSample).mockReturnValue({
      luminance: 0.1,
      tone: 'dark',
    })
    rerender(<ToneProbe positioned />)

    expect(screen.getByTestId('surface')).toHaveAttribute('data-background-tone', 'dark')
  })

  it('still coalesces later background updates and cancels pending work on unmount', () => {
    const { unmount } = render(<ToneProbe />)
    flushFrame()
    vi.mocked(resolveElementBackgroundSample).mockReturnValue({
      luminance: 0.1,
      tone: 'dark',
    })

    act(() => {
      window.dispatchEvent(new Event('resize'))
      window.dispatchEvent(new Event('resize'))
    })

    expect(frames.size).toBe(1)
    expect(screen.getByTestId('surface')).toHaveAttribute('data-background-tone', 'light')
    flushFrame()
    expect(screen.getByTestId('surface')).toHaveAttribute('data-background-tone', 'dark')

    act(() => window.dispatchEvent(new Event('resize')))
    expect(frames.size).toBe(1)
    unmount()
    expect(frames.size).toBe(0)
  })
})
