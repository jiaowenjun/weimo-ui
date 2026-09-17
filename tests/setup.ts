import '@testing-library/jest-dom/vitest'
import { afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

afterEach(() => {
  cleanup()
})

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

class TestResizeObserver implements ResizeObserver {
  disconnect() {}
  observe() {}
  unobserve() {}
}

Object.defineProperty(window, 'ResizeObserver', {
  configurable: true,
  value: TestResizeObserver,
})
Object.defineProperty(globalThis, 'ResizeObserver', {
  configurable: true,
  value: TestResizeObserver,
})

Object.defineProperty(HTMLElement.prototype, 'animate', {
  configurable: true,
  value: vi.fn().mockImplementation(() => ({
    cancel: vi.fn(),
    finish: vi.fn(),
    oncancel: null,
    onfinish: null,
    pause: vi.fn(),
    play: vi.fn(),
  })),
})

Object.defineProperty(HTMLElement.prototype, 'scrollIntoView', {
  configurable: true,
  value: vi.fn(),
})

Object.defineProperty(Document.prototype, 'elementFromPoint', {
  configurable: true,
  value: vi.fn(() => document.body),
})

Object.defineProperty(ShadowRoot.prototype, 'elementFromPoint', {
  configurable: true,
  value: vi.fn(() => null),
})
