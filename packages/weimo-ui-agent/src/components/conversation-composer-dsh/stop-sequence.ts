/**
 * 双击 Escape 停止序列——同 region、同 turn,在窗口间隔内的第二次按压触发 cancel。
 * 移植自 reference/dsh 的 ui-conversation/stop-sequence.ts(textarea 化:
 * region 用宿主元素引用,generation 并入 turn 序号)。
 */
export interface StopSequenceTarget {
  /** 焦点所属的宿主元素;两次按压必须落在同一元素(引用相等)。 */
  readonly region: object
  /** 会话回合序号;turn 切换(提交被受理/停止)后旧按压失效。 */
  readonly turn: number
  cancel(): void
}

export const STOP_SEQUENCE_INTERVAL_MS = 500

export class StopSequence {
  private first: { target: StopSequenceTarget; deadline: number } | undefined
  private timer: ReturnType<typeof setTimeout> | undefined

  private readonly intervalMs: number

  constructor(intervalMs: number = STOP_SEQUENCE_INTERVAL_MS) {
    this.intervalMs = intervalMs
  }

  /** 喂入一次 Escape 按压;返回是否触发了停止。 */
  press(target: StopSequenceTarget): boolean {
    const first = this.first
    this.reset()
    if (
      first !== undefined
      && Date.now() <= first.deadline
      && first.target.region === target.region
      && first.target.turn === target.turn
    ) {
      target.cancel()
      return true
    }
    this.first = { target, deadline: Date.now() + this.intervalMs }
    this.timer = setTimeout(() => this.reset(), this.intervalMs + 1)
    return false
  }

  /** 外部状态变化(如 turn 已切换)时清掉挂起的首按。 */
  reset(): void {
    if (this.timer !== undefined) {
      clearTimeout(this.timer)
      this.timer = undefined
    }
    this.first = undefined
  }
}
