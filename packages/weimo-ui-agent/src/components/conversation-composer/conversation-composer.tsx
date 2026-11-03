import { useCallback } from 'react'
import type {
  ComponentPropsWithoutRef,
  KeyboardEvent as ReactKeyboardEvent,
  ReactNode,
} from 'react'
import { ArrowUp, LoaderCircle, Square } from 'lucide-react'

import { cn } from 'weimo-ui-core/lib/utils'
import {
  resolveEscapeAction,
  resolveSendControl,
  shouldResetAfterSubmit,
  shouldSubmitEnter,
  type ConversationComposerStatus,
  type ConversationComposerSubmitResult,
} from './conversation-composer-model'
import { useComposerText } from './use-composer-text'

import 'weimo-ui-core/styles/tokens.css'
import './conversation-composer.css'

export type ConversationComposerProps = Omit<
  ComponentPropsWithoutRef<'form'>,
  'children' | 'onChange' | 'onSubmit'
> & {
  /** 受控文本;缺省走非受控(defaultValue 起步)。 */
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /**
   * 提交(发送按钮 / 裸 Enter)。返回 false 表示业务层拒绝本次提交
   * (如附件未就绪、校验失败),草稿保留不清空;其余返回值按已受理清空。
   */
  onSubmit: (value: string) => ConversationComposerSubmitResult
  /** status='running' 时的停止通道:Stop 按钮 / Esc。 */
  onStop?: () => void
  /** idle=可编辑可提交;pending=请求进行中(输入不锁,Enter 退回换行);running=任务执行中。 */
  status?: ConversationComposerStatus
  placeholder?: string
  disabled?: boolean
  /** 禁用原因,悬停可见。 */
  disabledReason?: string
  /** 裸 Enter 是否提交(默认 true);false 为纯换行模式。 */
  enterSubmits?: boolean
  /** 空输入是否允许提交(默认 false),供「继续/跳过」类快捷发送。 */
  allowSubmitWhenEmpty?: boolean
  /** 外部历史(旧→新);已受理的提交自动追记,↑/↓ 翻阅。 */
  promptHistory?: readonly string[]
  /** 插槽:输入区上方整行(附件预览、上下文 chip 等)。 */
  topContent?: ReactNode
  /** 插槽:底部行左侧工具区(模式切换、模型选择等)。 */
  leadingActions?: ReactNode
  /** 插槽:整体替换默认提交区(发送/Stop 按钮),自定义控件簇时使用。 */
  submitControl?: ReactNode
  submitLabel?: string
  stopLabel?: string
  /** textarea 的可访问名称;缺省回落 placeholder。 */
  inputLabel?: string
}

export function ConversationComposer({
  allowSubmitWhenEmpty = false,
  className,
  defaultValue,
  disabled = false,
  disabledReason,
  enterSubmits = true,
  inputLabel,
  leadingActions,
  onChange,
  onSubmit,
  onStop,
  placeholder,
  promptHistory,
  status = 'idle',
  stopLabel = '停止',
  submitControl,
  submitLabel = '发送',
  topContent,
  value,
  ...props
}: ConversationComposerProps) {
  const composer = useComposerText({ defaultValue, onChange, promptHistory, value })

  const canStop = status === 'running' && Boolean(onStop) && !disabled
  const hasDraft = composer.text.trim().length > 0
  const sendControl = resolveSendControl({ canStop, disabled, hasDraft, status })
  // pending 期间输入不锁(可继续编辑草稿),但 Enter 退回换行防误发。
  const submitDisabled = status === 'pending'

  const submitNow = useCallback(() => {
    const submitted = composer.text
    const result = onSubmit(submitted)
    // 提交返回值协议:只有业务层显式拒绝(false)时保留草稿。
    if (shouldResetAfterSubmit(result)) {
      composer.resetAfterSubmit()
    }
  }, [composer, onSubmit])

  const handleSubmit: ComponentPropsWithoutRef<'form'>['onSubmit'] = useCallback(
    (event) => {
      event.preventDefault()
      if (disabled || submitDisabled) {
        return
      }
      if (
        shouldSubmitEnter({
          allowSubmitWhenEmpty,
          enterSubmits,
          text: composer.text,
        })
      ) {
        submitNow()
      }
    },
    [allowSubmitWhenEmpty, composer.text, disabled, enterSubmits, submitDisabled, submitNow],
  )

  const handleStopClick = useCallback(() => {
    onStop?.()
  }, [onStop])

  const handleTextareaKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      // IME 组合中的按键(含 Enter 选词)全部放行,键盘层绝不拦截。
      if (event.nativeEvent.isComposing) {
        return
      }

      if (event.key === 'Escape' && !event.defaultPrevented) {
        if (resolveEscapeAction({ canStop }) === 'stop') {
          event.preventDefault()
          onStop?.()
        }
        return
      }

      if (event.key === 'Enter') {
        // 修饰组合(Shift/Ctrl/Meta+Enter)一律换行;enterSubmits 关闭或
        // pending 期间裸 Enter 也退回默认行为(换行),不误触发提交。
        if (
          event.shiftKey ||
          event.ctrlKey ||
          event.metaKey ||
          !enterSubmits ||
          submitDisabled
        ) {
          return
        }
        if (
          shouldSubmitEnter({
            allowSubmitWhenEmpty,
            ctrlKey: event.ctrlKey,
            enterSubmits,
            isComposing: event.nativeEvent.isComposing,
            metaKey: event.metaKey,
            shiftKey: event.shiftKey,
            text: composer.text,
          })
        ) {
          event.preventDefault()
          submitNow()
        } else {
          // 裸 Enter 但门禁未过(如空输入):吞掉按键,不插入空行。
          event.preventDefault()
        }
        return
      }

      const textarea = event.currentTarget
      if (event.key === 'ArrowUp') {
        // 空草稿或光标在起始位才进入历史;历史态中继续上翻不受光标限制。
        const atStart = textarea.selectionStart === 0 && textarea.selectionEnd === 0
        if (composer.historyIndex !== null || atStart || composer.text === '') {
          event.preventDefault()
          composer.navigateHistory('up', true)
        }
        return
      }
      if (event.key === 'ArrowDown' && composer.historyIndex !== null) {
        event.preventDefault()
        composer.navigateHistory('down', true)
      }
    },
    [
      allowSubmitWhenEmpty,
      canStop,
      composer,
      enterSubmits,
      onStop,
      submitDisabled,
      submitNow,
    ],
  )

  const defaultSubmitControl =
    sendControl.kind === 'stop' ? (
      <button
        aria-label={stopLabel}
        className="conversation-composer__stop"
        onClick={handleStopClick}
        title={`${stopLabel}(Esc)`}
        type="button"
      >
        <Square aria-hidden="true" />
      </button>
    ) : (
      <button
        aria-label={submitLabel}
        className="conversation-composer__send"
        disabled={!sendControl.canSend}
        title={enterSubmits ? `${submitLabel}(Enter)` : submitLabel}
        type="submit"
      >
        {sendControl.pending ? (
          <LoaderCircle aria-hidden="true" className="conversation-composer__spinner" />
        ) : (
          <ArrowUp aria-hidden="true" />
        )}
      </button>
    )

  return (
    <form
      {...props}
      className={cn('conversation-composer', className)}
      data-disabled={disabled || undefined}
      onSubmit={handleSubmit}
      title={disabled ? disabledReason : undefined}
    >
      {topContent ? (
        <div className="conversation-composer__top">{topContent}</div>
      ) : null}
      <textarea
        aria-label={inputLabel ?? placeholder}
        className="conversation-composer__textarea"
        disabled={disabled}
        onChange={(event) => composer.setText(event.target.value)}
        onKeyDown={handleTextareaKeyDown}
        placeholder={placeholder}
        ref={composer.textareaRef}
        rows={1}
        value={composer.text}
      />
      <div className="conversation-composer__toolbar">
        <div className="conversation-composer__leading">{leadingActions}</div>
        <div className="conversation-composer__submit">
          {submitControl ?? defaultSubmitControl}
        </div>
      </div>
    </form>
  )
}
