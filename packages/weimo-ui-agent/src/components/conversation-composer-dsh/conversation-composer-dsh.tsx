import { useCallback } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { Plus } from 'lucide-react'

import { cn } from 'weimo-ui-core/lib/utils'
import { QueueDock, type DshQueueAction, type DshQueuedMessage } from './queue-dock'
import type { BusyEnterBehavior } from './submission-policy'
import type {
  DshCommand,
  InputSubmitMode,
  SubmitAttempt,
  SubmitOutcome,
} from './submit-machine'
import { useDshComposer } from './use-dsh-composer'

import 'weimo-ui-core/styles/tokens.css'
import './conversation-composer-dsh.css'

export type ConversationComposerDshProps = Omit<
  ComponentPropsWithoutRef<'div'>,
  'children' | 'onChange' | 'onSubmit'
> & {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /**
   * default-sink 接缝(异步受理结算):Host 受理草稿;Promise resolve 且
   * kind='success' 才清空输入,拒绝/失败草稿原样回到编辑态并出 notice。
   */
  onSubmit: (
    draft: string,
    mode: InputSubmitMode,
    attempt: SubmitAttempt,
  ) => Promise<SubmitOutcome>
  /** 双击 Escape(500ms 窗口)或 Stop 按钮触发。 */
  onStop?: () => void
  /** 目标 agent 是否运行中(busy):决定 queue/steer 与 Stop 形态。 */
  running?: boolean
  /** busy 时普通 Enter 的投递偏好(默认 queue);Ctrl/Cmd+Enter 取反面。 */
  busyEnter?: BusyEnterBehavior
  /** 传输是否支持 steer(插入当前 turn);false 时 busy 一律 queue。 */
  steeringAvailable?: boolean
  /** slash 命令目录:草稿出现完整 token(如 '/model ')即 claim 锁定。 */
  commands?: readonly DshCommand[]
  /** 排队消息(QueueDock 数据);非空时 dock 贴卡片上方。 */
  queue?: readonly DshQueuedMessage[]
  onQueueAction?: (id: string, action: DshQueueAction) => void | Promise<void>
  placeholder?: string
  disabled?: boolean
  /** 插槽:工具行左侧(+ 按钮之后)与右侧(主按钮之前)。 */
  leadingActions?: ReactNode
  trailingActions?: ReactNode
  submitLabel?: string
  stopLabel?: string
  sendingLabel?: string
  /** textarea 的可访问名称;缺省回落 placeholder。 */
  inputLabel?: string
}

export function ConversationComposerDsh({
  busyEnter = 'queue',
  className,
  commands,
  defaultValue,
  disabled = false,
  inputLabel,
  leadingActions,
  onChange,
  onQueueAction,
  onSubmit,
  onStop,
  placeholder,
  queue,
  running = false,
  sendingLabel = '发送中',
  stopLabel = '停止',
  steeringAvailable = false,
  submitLabel = '发送',
  trailingActions,
  value,
  ...props
}: ConversationComposerDshProps) {
  const composer = useDshComposer({
    busyEnter,
    commands,
    defaultValue,
    disabled,
    onChange,
    onSubmit,
    onStop,
    running,
    steeringAvailable,
    value,
  })

  const sending = composer.phase === 'sending'
  const empty = composer.text.trim() === ''
  // 运行中且没在打草稿:主按钮让位停止(蓝本 primaryStops)。
  const primaryStops = running && !sending && empty
  const primaryDisabled = primaryStops ? onStop === undefined : !composer.canSubmit
  /** 诚实标签:只在点击确实会按该模式投递时才标注模式(蓝本注释原则)。 */
  const plainDraft = !empty && composer.phase === 'plain' && !composer.text.trimStart().startsWith('/')
  const primaryTitle = primaryStops
    ? `${stopLabel}(双击 Esc)`
    : sending
      ? sendingLabel
      : running && steeringAvailable && plainDraft
        ? composer.buttonSubmitMode === 'steer'
          ? `${submitLabel} · 插入当前回合`
          : `${submitLabel} · 排队下个回合`
        : submitLabel

  const handlePlusClick = useCallback(() => {
    if (composer.frozen || disabled) return
    const current = composer.text
    if (current === '') {
      composer.setText('/')
    } else if (!current.startsWith('/')) {
      composer.setText(`/${current}`)
    }
  }, [composer, disabled])

  const claimHintActive =
    composer.claim !== undefined
    && composer.text.trimStart() === composer.claim.token.trimEnd()
    && composer.claim.hint !== undefined

  return (
    <div {...props} className={cn('conversation-composer-dsh', className)}>
      <QueueDock items={queue ?? []} onAction={onQueueAction} running={running} />
      <div className="conversation-composer-dsh__card" data-composer-card="">
        {composer.notices.length > 0 ? (
          <div className="conversation-composer-dsh__notices">
            {composer.notices.map((notice) => (
              <div
                className={`conversation-composer-dsh__notice conversation-composer-dsh__notice--${notice.level}`}
                key={notice.seq}
                role={notice.level === 'error' ? 'alert' : 'status'}
              >
                <span>{notice.text}</span>
                <button
                  aria-label="关闭提示"
                  className="conversation-composer-dsh__notice-dismiss"
                  onClick={() => composer.dismissNotice(notice.seq)}
                  type="button"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
        <div className="conversation-composer-dsh__editor">
          <textarea
            aria-label={inputLabel ?? placeholder}
            className="conversation-composer-dsh__textarea"
            placeholder={placeholder}
            {...composer.textareaProps}
          />
          {claimHintActive ? (
            <p className="conversation-composer-dsh__claim-hint">{composer.claim?.hint}</p>
          ) : null}
        </div>
        <div className="conversation-composer-dsh__row">
          <div className="conversation-composer-dsh__tools">
            <button
              aria-label="插入命令"
              className="conversation-composer-dsh__add"
              disabled={disabled || composer.frozen}
              onClick={handlePlusClick}
              title="插入命令"
              type="button"
            >
              <Plus aria-hidden="true" />
            </button>
            {leadingActions}
          </div>
          <div className="conversation-composer-dsh__trailing">
            {trailingActions}
            <button
              aria-busy={sending || undefined}
              aria-label={primaryTitle}
              className="conversation-composer-dsh__primary"
              data-sending={sending || undefined}
              disabled={primaryDisabled}
              onClick={() => (primaryStops ? onStop?.() : composer.submit('enter'))}
              title={primaryTitle}
              type="button"
            >
              {primaryStops ? (
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
                  <rect fill="currentColor" height="10" rx="3" width="10" x="3" y="3" />
                </svg>
              ) : sending ? (
                <svg
                  aria-hidden="true"
                  className="conversation-composer-dsh__spinner"
                  height="16"
                  viewBox="0 0 16 16"
                  width="16"
                >
                  <circle
                    cx="8"
                    cy="8"
                    fill="none"
                    r="6"
                    stroke="currentColor"
                    strokeOpacity="0.35"
                    strokeWidth="2"
                  />
                  <path
                    d="M8 2a6 6 0 0 1 6 6"
                    fill="none"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeWidth="2"
                  />
                </svg>
              ) : (
                <svg aria-hidden="true" height="16" viewBox="0 0 16 16" width="16">
                  <path
                    d="M8 2.5a.75.75 0 0 1 .75.75v6.94l2.47-2.47a.75.75 0 1 1 1.06 1.06l-3.74 3.75a.75.75 0 0 1-1.08 0L3.72 8.78a.75.75 0 1 1 1.06-1.06l2.47 2.47V3.25A.75.75 0 0 1 8 2.5Z"
                    fill="currentColor"
                  />
                  <path d="M3.5 13.5h9a.75.75 0 0 1 0 1.5h-9a.75.75 0 0 1 0-1.5Z" fill="currentColor" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
