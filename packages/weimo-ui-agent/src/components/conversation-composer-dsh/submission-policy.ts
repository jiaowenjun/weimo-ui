/**
 * busy 会话的投递模式解析——独立纯函数,唯一消费方是 dsh composer 的提交链。
 * 移植自 reference/dsh 的 ui-conversation/input/submission-policy.ts。
 */

export type BusyEnterBehavior = 'queue' | 'steer'

/** 触发提交的手势:enter = 普通 Enter 与主按钮(两者投递完全一致);accelerated = Ctrl/Cmd+Enter。 */
export type ComposerSubmitGesture = 'enter' | 'accelerated'

import type { InputSubmitMode } from './submit-machine'

/**
 * 解析 busy 时的投递模式:
 * - 非忙碌或传输不支持 steer → 永远 queue;
 * - 普通手势 → 用户偏好(Enter 与发送按钮共用同一手势,按钮投递的正是 Enter 会投递的);
 * - 加速手势 → 偏好的反面(快捷反转,无需进设置)。
 */
export function resolveSubmitMode(
  preferred: BusyEnterBehavior,
  running: boolean,
  gesture: ComposerSubmitGesture,
  steeringAvailable: boolean,
): InputSubmitMode {
  if (!running || !steeringAvailable) return 'queue'
  if (gesture === 'enter') return preferred
  return preferred === 'queue' ? 'steer' : 'queue'
}
