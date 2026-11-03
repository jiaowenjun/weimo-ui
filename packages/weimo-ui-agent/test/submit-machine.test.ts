import { describe, expect, it } from 'vitest'

import {
  SubmitMachine,
  type DshCommand,
  type SubmitAttempt,
} from '../src/components/conversation-composer-dsh/submit-machine'

const modelCommand: DshCommand = {
  name: 'model',
  token: '/model ',
  hint: '输入模型名',
  run: async () => ({ kind: 'success' as const, text: '已切换' }),
}

const draftOf = (attempt: SubmitAttempt) => attempt.draftSnapshot

describe('SubmitMachine 普通消息', () => {
  it('plain → sending → sink-settled ok → commit-draft(null) 清空', () => {
    const m = new SubmitMachine()
    const effects = m.dispatch({ type: 'enter', mode: 'queue', draft: '你好' })
    expect(m.state.phase).toBe('sending')
    expect(effects).toHaveLength(1)
    expect(effects[0]).toMatchObject({ type: 'default-sink', draft: '你好', mode: 'queue' })

    const settled = m.dispatch({
      type: 'sink-settled',
      attempt: (effects[0] as Extract<typeof effects[number], { type: 'default-sink' }>).attempt,
      ok: true,
    })
    expect(m.state.phase).toBe('plain')
    expect(settled).toEqual([{ type: 'commit-draft', retainSuffixOf: null }])
  })

  it('sink-settled 失败 → 草稿保留 + error notice', () => {
    const m = new SubmitMachine()
    const effects = m.dispatch({ type: 'enter', mode: 'queue', draft: '消息' })
    const attempt = (effects[0] as { attempt: SubmitAttempt }).attempt
    const settled = m.dispatch({
      type: 'sink-settled',
      attempt,
      ok: false,
      message: '连接已断开',
    })
    expect(m.state.phase).toBe('plain')
    expect(settled).toEqual([{ type: 'notice', level: 'error', text: '连接已断开' }])
  })

  it('空白草稿静默 no-op', () => {
    const m = new SubmitMachine()
    expect(m.dispatch({ type: 'enter', mode: 'queue', draft: '   ' })).toEqual([])
    expect(m.state.phase).toBe('plain')
  })
})

describe('SubmitMachine 命令链', () => {
  it('/ 开头 → adjudicating → 命中 → begin-submit → submit-settled ok → 保留后缀', () => {
    const m = new SubmitMachine()
    const effects = m.dispatch({ type: 'enter', mode: 'queue', draft: '/model glm-5' })
    expect(m.state.phase).toBe('adjudicating')
    expect(effects[0]).toMatchObject({ type: 'adjudicate', draft: '/model glm-5' })

    const attempt = (effects[0] as { attempt: SubmitAttempt }).attempt
    const next = m.dispatch({ type: 'adjudicated', attempt, outcome: modelCommand })
    expect(m.state.phase).toBe('submitting')
    expect(m.state.claim).toMatchObject({ name: 'model', token: '/model ' })
    expect(next[0]).toMatchObject({ type: 'begin-submit', args: 'glm-5' })

    const settled = m.dispatch({
      type: 'submit-settled',
      attempt,
      ok: true,
      command: modelCommand,
      outcome: { kind: 'success', text: '已切换' },
    })
    expect(m.state.phase).toBe('plain')
    expect(settled).toEqual([
      { type: 'commit-draft', retainSuffixOf: '/model glm-5' },
      { type: 'notice', level: 'info', text: '已切换' },
    ])
  })

  it('/ 开头未命中 → adjudicated(undefined) 回落普通发送', () => {
    const m = new SubmitMachine()
    const effects = m.dispatch({ type: 'enter', mode: 'queue', draft: '/nosuch args' })
    const attempt = (effects[0] as { attempt: SubmitAttempt }).attempt
    const next = m.dispatch({ type: 'adjudicated', attempt, outcome: undefined })
    expect(m.state.phase).toBe('sending')
    expect(next[0]).toMatchObject({ type: 'default-sink', draft: '/nosuch args' })
  })

  it('claim 态 Enter 直接走 begin-submit,args 剥离 token', () => {
    const m = new SubmitMachine()
    m.dispatch({ type: 'claim', claim: modelCommand })
    expect(m.state.phase).toBe('claimed')
    const effects = m.dispatch({ type: 'enter', mode: 'queue', draft: '/model glm-5' })
    expect(effects[0]).toMatchObject({ type: 'begin-submit', claim: modelCommand, args: 'glm-5' })
    expect(m.state.phase).toBe('submitting')
  })

  it('claim 失败 → claim 跟随 command 回到 claimed + notice', () => {
    const m = new SubmitMachine()
    m.dispatch({ type: 'claim', claim: modelCommand })
    const effects = m.dispatch({ type: 'enter', mode: 'queue', draft: '/model x' })
    const attempt = (effects[0] as { attempt: SubmitAttempt }).attempt
    const settled = m.dispatch({
      type: 'submit-settled',
      attempt,
      ok: false,
      command: modelCommand,
      message: '模型不存在',
    })
    expect(m.state.phase).toBe('claimed')
    expect(m.state.claim?.name).toBe('model')
    expect(settled).toEqual([{ type: 'notice', level: 'error', text: '模型不存在' }])
  })
})

describe('SubmitMachine 防护', () => {
  it('frozen 三相位拒绝对话重入', () => {
    const m = new SubmitMachine()
    m.dispatch({ type: 'enter', mode: 'queue', draft: '消息' })
    expect(m.dispatch({ type: 'enter', mode: 'queue', draft: '第二条' })).toEqual([])
    expect(m.state.phase).toBe('sending')
  })

  it('过期 seq 的回包静默丢弃', () => {
    const m = new SubmitMachine()
    const stale: SubmitAttempt = {
      seq: 0,
      signal: new AbortController().signal,
      draftSnapshot: '旧消息',
      mode: 'queue',
    }
    m.dispatch({ type: 'enter', mode: 'queue', draft: '新消息' })
    expect(m.dispatch({ type: 'sink-settled', attempt: stale, ok: true })).toEqual([])
    expect(m.state.phase).toBe('sending')
  })

  it('followCommand:claim 随草稿前导形态进出;busy 拒绝', () => {
    const m = new SubmitMachine()
    m.dispatch({ type: 'draft-changed', command: modelCommand })
    expect(m.state.phase).toBe('claimed')
    m.dispatch({ type: 'draft-changed', command: undefined })
    expect(m.state.phase).toBe('plain')

    m.dispatch({ type: 'claim', claim: modelCommand })
    m.dispatch({ type: 'enter', mode: 'queue', draft: '/model x' })
    m.dispatch({ type: 'draft-changed', command: undefined })
    expect(m.state.phase).toBe('submitting')
  })

  it('release 中止 in-flight 并复位', () => {
    const m = new SubmitMachine()
    const effects = m.dispatch({ type: 'enter', mode: 'queue', draft: '消息' })
    const attempt = (effects[0] as { attempt: SubmitAttempt }).attempt
    expect(m.dispatch({ type: 'release' })).toEqual([])
    expect(attempt.signal.aborted).toBe(true)
    expect(m.state.phase).toBe('plain')
    // release 后过期回包同样丢弃
    expect(m.dispatch({ type: 'sink-settled', attempt, ok: true })).toEqual([])
  })

  it('argsAfter 约定:token 不含尾分隔符时第一分支直切(保留前导空格)', () => {
    const m = new SubmitMachine()
    const tightCommand: DshCommand = { ...modelCommand, token: '/model' }
    m.dispatch({ type: 'claim', claim: tightCommand })
    const effects = m.dispatch({ type: 'enter', mode: 'queue', draft: '/model glm-5' })
    expect((effects[0] as { args: string }).args).toBe(' glm-5')
  })
})
