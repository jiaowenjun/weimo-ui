/**
 * conversation-composer 的纯逻辑层——键盘门禁与发送状态机,零 DOM/React 依赖,可独立单测。
 *
 * 协议抽象自 ZCode 桌面客户端的 composer 实现(reference/zcode packages/ui):
 * - Enter 提交门禁:修饰键/IME/空输入逐层拒绝(LexicalChatInput shouldSubmitLexicalEnter)
 * - 提交返回值协议:业务层返回 false 拒绝提交,草稿保留(shouldResetLexicalEditorAfterSubmit)
 * - 发送控制三态:running+空草稿 → Stop、pending → Spinner、否则发送键
 *   (ConversationComposerZcode canSend/showStopControl)
 * - ↑/↓ 历史导航索引步进(promptHistory)
 */

export type ConversationComposerZcodeStatus = 'idle' | 'pending' | 'running'

/** onSubmit 返回值:false = 业务层拒绝提交,草稿保留;其余(void/true) = 已受理,清空输入。 */
export type ConversationComposerZcodeSubmitResult = boolean | void

export interface ComposerEnterGuardOptions {
  enterSubmits: boolean
  shiftKey?: boolean
  ctrlKey?: boolean
  metaKey?: boolean
  /** IME 组合中(如中文候选框);Enter 属于选词确认,绝不发送。 */
  isComposing?: boolean
  allowSubmitWhenEmpty?: boolean
  text: string
}

/**
 * 裸 Enter 是否应触发提交。任何修饰组合(Shift/Ctrl/Meta)都换行不发送;
 * 空白文本默认拒绝(allowSubmitWhenEmpty 放开,供「继续/跳过」类快捷发送)。
 */
export function shouldSubmitEnter({
  allowSubmitWhenEmpty = false,
  ctrlKey = false,
  enterSubmits,
  isComposing = false,
  metaKey = false,
  shiftKey = false,
  text,
}: ComposerEnterGuardOptions): boolean {
  if (!enterSubmits) {
    return false
  }
  if (shiftKey || ctrlKey || metaKey || isComposing) {
    return false
  }
  return Boolean(text.trim() || allowSubmitWhenEmpty)
}

/** 提交返回值协议:只有显式 false 保留草稿,undefined/true 都按已受理清空。 */
export function shouldResetAfterSubmit(
  result: ConversationComposerZcodeSubmitResult,
): boolean {
  return result !== false
}

export type ComposerSendControl =
  | { kind: 'stop' }
  | { kind: 'send'; canSend: boolean; pending: boolean }

export interface ComposerSendControlOptions {
  status: ConversationComposerZcodeStatus
  /** 有可提交内容(非空文本;附件等未来内容源并入此位)。 */
  hasDraft: boolean
  disabled?: boolean
  /** 组件侧 = status === 'running' 且 onStop 已提供。 */
  canStop?: boolean
}

/**
 * 发送键三态映射(对齐 ZCode 旧 UI 状态机):
 * - 运行中且用户没在打字 → Stop(canStop && !hasDraft)
 * - 运行中有草稿 → 仍为发送键(排队追问场景)
 * - pending → 发送键 + Spinner + 不可再提交(输入不锁,Enter 退回换行)
 * - idle → canSend = 非禁用且有草稿
 */
export function resolveSendControl({
  canStop = false,
  disabled = false,
  hasDraft,
  status,
}: ComposerSendControlOptions): ComposerSendControl {
  if (canStop && !hasDraft && !disabled) {
    return { kind: 'stop' }
  }
  return {
    kind: 'send',
    canSend: !disabled && status !== 'pending' && hasDraft,
    pending: status === 'pending',
  }
}

export interface ComposerEscapeOptions {
  canStop?: boolean
}

/**
 * Esc 键语义:运行中且可停止 → 'stop';其余场景返回 null 由宿主/browser 默认行为接管。
 */
export function resolveEscapeAction({
  canStop = false,
}: ComposerEscapeOptions): 'stop' | null {
  return canStop ? 'stop' : null
}

export interface PromptHistoryMove {
  text: string
  /** null = 已退出历史态回到当前草稿。 */
  index: number | null
}

/**
 * ↑/↓ 历史索引步进。entries 约定旧→新排列(index 最大为最新一条):
 * - up:未在历史态 → 跳最新一条;已到最旧 → null(不再移动)
 * - down:未在历史态 → null;越过最新一条 → 退出历史态还原草稿 draftText
 */
export function navigatePromptHistory(
  entries: readonly string[],
  index: number | null,
  direction: 'up' | 'down',
  draftText: string,
): PromptHistoryMove | null {
  if (entries.length === 0) {
    return null
  }

  if (direction === 'up') {
    if (index === null) {
      return { text: entries[entries.length - 1]!, index: entries.length - 1 }
    }
    if (index <= 0) {
      return null
    }
    return { text: entries[index - 1]!, index: index - 1 }
  }

  if (index === null) {
    return null
  }
  if (index >= entries.length - 1) {
    return { text: draftText, index: null }
  }
  return { text: entries[index + 1]!, index: index + 1 }
}

/** 历史条目合并:外部 promptHistory 在前(旧→新),本地提交追加,相邻去重。 */
export function mergePromptHistory(
  external: readonly string[],
  local: readonly string[],
): string[] {
  const merged: string[] = []
  for (const text of [...external, ...local]) {
    const trimmed = text.trim()
    if (!trimmed || merged[merged.length - 1] === trimmed) {
      continue
    }
    merged.push(trimmed)
  }
  return merged
}
