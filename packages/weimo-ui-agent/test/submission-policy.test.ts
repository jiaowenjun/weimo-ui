import { describe, expect, it } from 'vitest'

import { resolveSubmitMode } from '../src/components/conversation-composer-dsh/submission-policy'

describe('resolveSubmitMode', () => {
  it('非忙碌或不支持 steer → 永远 queue', () => {
    expect(resolveSubmitMode('steer', false, 'enter', true)).toBe('queue')
    expect(resolveSubmitMode('steer', true, 'enter', false)).toBe('queue')
    expect(resolveSubmitMode('steer', true, 'accelerated', false)).toBe('queue')
  })

  it('普通手势(Enter 与主按钮共用) → 用户偏好', () => {
    expect(resolveSubmitMode('queue', true, 'enter', true)).toBe('queue')
    expect(resolveSubmitMode('steer', true, 'enter', true)).toBe('steer')
  })

  it('加速手势(Ctrl/Cmd+Enter) → 偏好反面', () => {
    expect(resolveSubmitMode('queue', true, 'accelerated', true)).toBe('steer')
    expect(resolveSubmitMode('steer', true, 'accelerated', true)).toBe('queue')
  })
})
