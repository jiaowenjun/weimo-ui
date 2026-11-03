/**
 * SubmitMachine:每个会话输入面的提交状态机——事件进、效果出;零 React/DOM,可独立单测。
 * shell(useDshComposer)持有编辑器状态并执行返回的效果。
 *
 * 命令 claim 与普通消息共用唯一的 frozen in-flight 槽:提交期间编辑器只读,
 * 只有 Host 接受(sink-settled ok)才清空草稿;拒绝或失败则草稿原样回到编辑态。
 * seq 单调递增,过期 attempt 的回包被静默丢弃(防陈旧响应反涌)。
 *
 * 移植自 reference/dsh 的 ui-conversation/input/machine.ts(textarea 化:
 * 无 occurrences/quotes/attachmentIds,adjudicated 的 outcome 简化为 claim | undefined)。
 */

/** busy 提交的投递模式:queue=排队下个 turn,steer=插入当前 turn。 */
export type InputSubmitMode = 'queue' | 'steer'

export interface SubmitOutcome {
  readonly kind: 'success' | 'error'
  readonly text?: string
}

/** 命令目录项:token 含尾分隔符(如 '/model ');run 由宿主实现。 */
export interface DshCommand {
  readonly name: string
  readonly token: string
  readonly hint?: string
  run(args: string, attempt: SubmitAttempt): Promise<SubmitOutcome>
}

/** 提交面的唯一 id 概念:seq 防回包,signal 供 release 中止。 */
export interface SubmitAttempt {
  readonly seq: number
  readonly signal: AbortSignal
  readonly draftSnapshot: string
  readonly mode: InputSubmitMode
}

export type InputPhase = 'plain' | 'adjudicating' | 'claimed' | 'submitting' | 'sending'

export type DshInputEvent =
  | { readonly type: 'draft-changed'; readonly command: DshCommand | undefined }
  | { readonly type: 'claim'; readonly claim: DshCommand }
  | {
      readonly type: 'enter'
      readonly mode: InputSubmitMode
      readonly draft: string
    }
  | {
      readonly type: 'adjudicated'
      readonly attempt: SubmitAttempt
      /** 命中的命令;undefined = 未命中,回落普通发送。 */
      readonly outcome: DshCommand | undefined
    }
  | {
      readonly type: 'submit-settled'
      readonly attempt: SubmitAttempt
      readonly ok: boolean
      readonly command: DshCommand | undefined
      readonly outcome?: SubmitOutcome
      readonly message?: string
    }
  | {
      readonly type: 'sink-settled'
      readonly attempt: SubmitAttempt
      readonly ok: boolean
      readonly outcome?: SubmitOutcome
      readonly message?: string
    }
  | { readonly type: 'release' }

export type DshInputEffect =
  | { readonly type: 'adjudicate'; readonly attempt: SubmitAttempt; readonly draft: string }
  | {
      readonly type: 'begin-submit'
      readonly attempt: SubmitAttempt
      readonly claim: DshCommand
      readonly args: string
    }
  | {
      readonly type: 'default-sink'
      readonly attempt: SubmitAttempt
      readonly draft: string
      readonly mode: InputSubmitMode
    }
  | { readonly type: 'notice'; readonly level: 'info' | 'error'; readonly text: string }
  /** retainSuffixOf:字符串快照,保留飞行期间追打的纯后缀;null 无条件清空。 */
  | { readonly type: 'commit-draft'; readonly retainSuffixOf: string | null }

/** 提交面在 InputState 快照中的切片。 */
export interface SubmitSnapshot {
  readonly phase: InputPhase
  readonly claim?: { readonly name: string; readonly token: string; readonly hint?: string }
}

/** frozen = 提交事务进行中,编辑器与一切 mutation 入口只读。 */
export function isFrozenPhase(phase: InputPhase): boolean {
  return phase === 'adjudicating' || phase === 'submitting' || phase === 'sending'
}

/** Exhaustiveness backstop for the closed DshInputEvent union. */
function unreachable(value: never): never {
  throw new Error(`unreachable input event: ${JSON.stringify(value)}`)
}

/** 剥离已 claim 命令 token,取 submit-time 参数段。 */
function argsAfter(draft: string, token: string): string {
  const s = draft.trimStart()
  if (s.startsWith(token)) return s.slice(token.length)
  const base = token.trimEnd()
  if (s.startsWith(base)) {
    const rest = s.slice(base.length)
    return /^\s/.test(rest) ? rest.slice(1) : rest
  }
  return ''
}

export class SubmitMachine {
  private phase: InputPhase = 'plain'
  private claim: DshCommand | undefined
  private seq = 0
  private inflight: {
    readonly attempt: SubmitAttempt
    readonly controller: AbortController
  } | undefined

  /** 提交面只读快照(claim 不外泄 run 闭包)。 */
  get state(): SubmitSnapshot {
    const c = this.claim
    return {
      phase: this.phase,
      ...(c
        ? {
          claim: {
            name: c.name,
            token: c.token,
            ...(c.hint !== undefined ? { hint: c.hint } : {}),
          },
        }
        : {}),
    }
  }

  /** 正在发送的消息 attempt;sending 相位之外为 undefined。 */
  get sendingAttempt(): SubmitAttempt | undefined {
    return this.phase === 'sending' ? this.inflight?.attempt : undefined
  }

  /** 喂入一个事件;返回 shell 待执行的效果(按序)。 */
  dispatch(ev: DshInputEvent): readonly DshInputEffect[] {
    switch (ev.type) {
      case 'draft-changed': return this.followCommand(ev.command)
      case 'claim': return this.followCommand(ev.claim)
      case 'enter': return this.onEnter(ev)
      case 'adjudicated': return this.onAdjudicated(ev.attempt, ev.outcome)
      case 'submit-settled': return this.onSubmitSettled(ev)
      case 'sink-settled': return this.onSinkSettled(ev)
      case 'release': return this.onRelease()
      default: return unreachable(ev)
    }
  }

  /**
   * 事务外 claim 跟随草稿的前导命令形态:删除或改写前缀即释放,
   * 还原出同样前缀则重新进入 claimed;busy 相位两者都拒绝。
   */
  private followCommand(command: DshCommand | undefined): readonly DshInputEffect[] {
    if (this.phase !== 'plain' && this.phase !== 'claimed') return []
    this.claim = command
    this.phase = command === undefined ? 'plain' : 'claimed'
    return []
  }

  /** 用发送时刻的草稿冻结唯一 in-flight 槽。 */
  private beginAttempt(mode: InputSubmitMode, draft: string): SubmitAttempt {
    const controller = new AbortController()
    this.seq += 1
    const attempt: SubmitAttempt = {
      seq: this.seq,
      signal: controller.signal,
      draftSnapshot: draft,
      mode,
    }
    this.inflight = { attempt, controller }
    return attempt
  }

  /** 发送冻结的消息;Host 接受前编辑器保持只读。 */
  private send(attempt: SubmitAttempt): readonly DshInputEffect[] {
    this.claim = undefined
    this.phase = 'sending'
    return [{ type: 'default-sink', attempt, draft: attempt.draftSnapshot, mode: attempt.mode }]
  }

  private onEnter(
    ev: Extract<DshInputEvent, { type: 'enter' }>,
  ): readonly DshInputEffect[] {
    if (isFrozenPhase(this.phase)) return []
    const { mode, draft } = ev
    if (this.phase === 'claimed' && this.claim !== undefined) {
      const attempt = this.beginAttempt(mode, draft)
      this.phase = 'submitting'
      return [
        { type: 'begin-submit', attempt, claim: this.claim, args: argsAfter(draft, this.claim.token) },
      ]
    }
    const trimmed = draft.trim()
    if (trimmed === '') return []
    const attempt = this.beginAttempt(mode, draft)
    if (trimmed.startsWith('/')) {
      this.phase = 'adjudicating'
      return [{ type: 'adjudicate', attempt, draft }]
    }
    return this.send(attempt)
  }

  private onAdjudicated(
    attempt: SubmitAttempt,
    outcome: DshCommand | undefined,
  ): readonly DshInputEffect[] {
    const flight = this.inflight
    if (this.phase !== 'adjudicating' || flight === undefined || flight.attempt.seq !== attempt.seq) {
      return []
    }
    if (outcome !== undefined) {
      this.claim = outcome
      this.phase = 'submitting'
      return [
        {
          type: 'begin-submit',
          attempt,
          claim: outcome,
          args: argsAfter(attempt.draftSnapshot, outcome.token),
        },
      ]
    }
    return this.send(attempt)
  }

  private onSubmitSettled(
    ev: Extract<DshInputEvent, { type: 'submit-settled' }>,
  ): readonly DshInputEffect[] {
    const flight = this.inflight
    if (
      this.phase !== 'submitting'
      || flight === undefined
      || flight.attempt.seq !== ev.attempt.seq
    ) {
      return []
    }
    this.inflight = undefined
    if (ev.ok) {
      this.phase = 'plain'
      this.claim = undefined
      const effects: DshInputEffect[] = [
        { type: 'commit-draft', retainSuffixOf: flight.attempt.draftSnapshot },
      ]
      if (ev.outcome?.text !== undefined) {
        effects.push({
          type: 'notice',
          level: ev.outcome.kind === 'error' ? 'error' : 'info',
          text: ev.outcome.text,
        })
      }
      return effects
    }
    // 失败后 claim 跟随前导命令形态回到 claimed/plain,草稿不动。
    const text = ev.message ?? ev.outcome?.text
    this.claim = ev.command
    this.phase = ev.command === undefined ? 'plain' : 'claimed'
    return text === undefined ? [] : [{ type: 'notice', level: 'error', text }]
  }

  /** Host 接受 → 清空编辑器;拒绝/失败 → 草稿原样回到编辑态。 */
  private onSinkSettled(
    ev: Extract<DshInputEvent, { type: 'sink-settled' }>,
  ): readonly DshInputEffect[] {
    const flight = this.inflight
    if (
      this.phase !== 'sending'
      || flight === undefined
      || flight.attempt.seq !== ev.attempt.seq
    ) {
      return []
    }
    this.inflight = undefined
    this.phase = 'plain'
    const effects: DshInputEffect[] = ev.ok ? [{ type: 'commit-draft', retainSuffixOf: null }] : []
    const text = ev.message ?? ev.outcome?.text
    if (text !== undefined) {
      effects.push({
        type: 'notice',
        level: ev.ok && ev.outcome?.kind !== 'error' ? 'info' : 'error',
        text,
      })
    }
    return effects
  }

  private onRelease(): readonly DshInputEffect[] {
    if (this.inflight !== undefined) {
      this.inflight.controller.abort()
      this.inflight = undefined
    }
    this.phase = 'plain'
    this.claim = undefined
    return []
  }
}
