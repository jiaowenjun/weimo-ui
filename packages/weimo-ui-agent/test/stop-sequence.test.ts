import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { StopSequence } from '../src/components/conversation-composer-dsh/stop-sequence'

describe('StopSequence 双击 Esc', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-03T12:00:00Z'))
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('窗口内同 region 同 turn 的第二次按压触发 cancel', () => {
    const seq = new StopSequence(500)
    const region = {}
    let cancelled = 0
    expect(seq.press({ region, turn: 1, cancel: () => ++cancelled })).toBe(false)
    vi.advanceTimersByTime(300)
    expect(seq.press({ region, turn: 1, cancel: () => ++cancelled })).toBe(true)
    expect(cancelled).toBe(1)
  })

  it('超窗后首按过期,不再触发', () => {
    const seq = new StopSequence(500)
    const region = {}
    let cancelled = 0
    seq.press({ region, turn: 1, cancel: () => ++cancelled })
    vi.advanceTimersByTime(600)
    expect(seq.press({ region, turn: 1, cancel: () => ++cancelled })).toBe(false)
    expect(cancelled).toBe(0)
  })

  it('换 region 或换 turn 的第二次按压不成立', () => {
    const seq = new StopSequence(500)
    let cancelled = 0
    seq.press({ region: {}, turn: 1, cancel: () => ++cancelled })
    expect(seq.press({ region: {}, turn: 1, cancel: () => ++cancelled })).toBe(false)
    const region = {}
    seq.press({ region, turn: 1, cancel: () => ++cancelled })
    expect(seq.press({ region, turn: 2, cancel: () => ++cancelled })).toBe(false)
    expect(cancelled).toBe(0)
  })

  it('触发后序列自清,第三次按压重新计数', () => {
    const seq = new StopSequence(500)
    const region = {}
    let cancelled = 0
    seq.press({ region, turn: 1, cancel: () => ++cancelled })
    expect(seq.press({ region, turn: 1, cancel: () => ++cancelled })).toBe(true)
    expect(seq.press({ region, turn: 1, cancel: () => ++cancelled })).toBe(false)
    expect(cancelled).toBe(1)
  })
})
