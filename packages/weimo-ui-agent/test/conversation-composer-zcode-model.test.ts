import { describe, expect, it } from 'vitest'

import {
  mergePromptHistory,
  navigatePromptHistory,
  resolveEscapeAction,
  resolveSendControl,
  shouldResetAfterSubmit,
  shouldSubmitEnter,
} from '../src/components/conversation-composer-zcode/conversation-composer-model'

describe('shouldSubmitEnter', () => {
  const base = { enterSubmits: true, text: '你好' }

  it('裸 Enter 提交非空文本', () => {
    expect(shouldSubmitEnter(base)).toBe(true)
  })

  it('任意修饰组合退回换行:Shift / Ctrl / Meta', () => {
    expect(shouldSubmitEnter({ ...base, shiftKey: true })).toBe(false)
    expect(shouldSubmitEnter({ ...base, ctrlKey: true })).toBe(false)
    expect(shouldSubmitEnter({ ...base, metaKey: true })).toBe(false)
  })

  it('IME 组合中的 Enter 属于选词,绝不发送', () => {
    expect(shouldSubmitEnter({ ...base, isComposing: true })).toBe(false)
  })

  it('空白文本默认拒绝,allowSubmitWhenEmpty 放开', () => {
    expect(shouldSubmitEnter({ ...base, text: '   \n ' })).toBe(false)
    expect(
      shouldSubmitEnter({ ...base, text: ' ', allowSubmitWhenEmpty: true }),
    ).toBe(true)
  })

  it('enterSubmits 关闭时 Enter 永不提交(纯换行模式)', () => {
    expect(shouldSubmitEnter({ ...base, enterSubmits: false })).toBe(false)
  })
})

describe('shouldResetAfterSubmit', () => {
  it('只有显式 false 保留草稿', () => {
    expect(shouldResetAfterSubmit(false)).toBe(false)
    expect(shouldResetAfterSubmit(undefined)).toBe(true)
    expect(shouldResetAfterSubmit(true)).toBe(true)
  })
})

describe('resolveSendControl', () => {
  it('running 且无草稿 → Stop', () => {
    expect(
      resolveSendControl({ status: 'running', hasDraft: false, canStop: true }),
    ).toEqual({ kind: 'stop' })
  })

  it('running 但在打草稿 → 仍为发送键(排队追问)', () => {
    expect(
      resolveSendControl({ status: 'running', hasDraft: true, canStop: true }),
    ).toEqual({ kind: 'send', canSend: true, pending: false })
  })

  it('running 但未提供 onStop → 无停止可显,退回发送键', () => {
    expect(
      resolveSendControl({ status: 'running', hasDraft: false, canStop: false }),
    ).toEqual({ kind: 'send', canSend: false, pending: false })
  })

  it('pending → 发送键 Spinner 且不可再提交', () => {
    expect(
      resolveSendControl({ status: 'pending', hasDraft: true }),
    ).toEqual({ kind: 'send', canSend: false, pending: true })
  })

  it('idle → canSend 仅取决于禁用与草稿', () => {
    expect(resolveSendControl({ status: 'idle', hasDraft: true })).toEqual({
      kind: 'send',
      canSend: true,
      pending: false,
    })
    expect(
      resolveSendControl({ status: 'idle', hasDraft: true, disabled: true }),
    ).toEqual({ kind: 'send', canSend: false, pending: false })
    expect(resolveSendControl({ status: 'idle', hasDraft: false })).toEqual({
      kind: 'send',
      canSend: false,
      pending: false,
    })
  })

  it('disabled 时即便 running 无草稿也不显示 Stop', () => {
    expect(
      resolveSendControl({
        status: 'running',
        hasDraft: false,
        canStop: true,
        disabled: true,
      }),
    ).toEqual({ kind: 'send', canSend: false, pending: false })
  })
})

describe('resolveEscapeAction', () => {
  it('运行中可停止 → stop,其余 → null', () => {
    expect(resolveEscapeAction({ canStop: true })).toBe('stop')
    expect(resolveEscapeAction({ canStop: false })).toBeNull()
  })
})

describe('navigatePromptHistory', () => {
  const entries = ['第一问', '第二问', '第三问']

  it('↑ 从草稿进入历史态,跳到最新一条', () => {
    expect(navigatePromptHistory(entries, null, 'up', '草稿')).toEqual({
      text: '第三问',
      index: 2,
    })
  })

  it('↑ 在历史态逐条向旧移动,到最旧不再移动', () => {
    expect(navigatePromptHistory(entries, 2, 'up', '草稿')).toEqual({
      text: '第二问',
      index: 1,
    })
    expect(navigatePromptHistory(entries, 1, 'up', '草稿')).toEqual({
      text: '第一问',
      index: 0,
    })
    expect(navigatePromptHistory(entries, 0, 'up', '草稿')).toBeNull()
  })

  it('↓ 逐条向新移动,越过最新一条退出历史态并还原草稿', () => {
    expect(navigatePromptHistory(entries, 0, 'down', '草稿')).toEqual({
      text: '第二问',
      index: 1,
    })
    expect(navigatePromptHistory(entries, 2, 'down', '草稿')).toEqual({
      text: '草稿',
      index: null,
    })
  })

  it('↓ 在历史态之外与空历史都无动作', () => {
    expect(navigatePromptHistory(entries, null, 'down', '草稿')).toBeNull()
    expect(navigatePromptHistory([], null, 'up', '草稿')).toBeNull()
  })
})

describe('mergePromptHistory', () => {
  it('外部在前本地在后,trim 后剔除空串与相邻重复', () => {
    expect(
      mergePromptHistory(['旧问题', '  '], ['新问题', '新问题', '']),
    ).toEqual(['旧问题', '新问题'])
  })

  it('跨来源的相邻重复同样去重', () => {
    expect(mergePromptHistory(['同问'], ['同问'])).toEqual(['同问'])
  })
})
