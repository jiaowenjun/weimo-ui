import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import type { ChangeEvent, KeyboardEvent as ReactKeyboardEvent } from 'react'

import { StopSequence } from './stop-sequence'
import {
  isFrozenPhase,
  SubmitMachine,
  type DshCommand,
  type DshInputEffect,
  type InputPhase,
  type InputSubmitMode,
  type SubmitAttempt,
  type SubmitOutcome,
  type SubmitSnapshot,
} from './submit-machine'
import { resolveSubmitMode, type BusyEnterBehavior, type ComposerSubmitGesture } from './submission-policy'

export interface DshComposerNotice {
  readonly seq: number
  readonly level: 'info' | 'error'
  readonly text: string
}

export interface UseDshComposerOptions {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** default-sink 接缝:Host 受理;resolve ok 才清空草稿(异步受理结算)。 */
  onSubmit: (
    draft: string,
    mode: InputSubmitMode,
    attempt: SubmitAttempt,
  ) => Promise<SubmitOutcome>
  commands?: readonly DshCommand[]
  running?: boolean
  busyEnter?: BusyEnterBehavior
  steeringAvailable?: boolean
  disabled?: boolean
  /** 双击 Esc / Stop 按钮的停止通道。 */
  onStop?: () => void
}

const NOTICE_LIMIT = 3
/** Safari 在 compositionend 之后才派发收尾 keydown,多守 10ms(蓝本:the old textarea's proven window)。 */
const RECENT_COMPOSITION_WINDOW_MS = 10
/** 编辑区行数上限,超出后滚动(蓝本 .scroll 语义)。 */
const MAX_TEXT_ROWS = 14

type LeadingCommandResolver = (draft: string, commands: readonly DshCommand[]) => DshCommand | undefined

/** 草稿前导命令形态:token(含分隔符)完整出现即 claim;裸 token 要求词边界或恰好等值。 */
export const resolveLeadingCommand: LeadingCommandResolver = (draft, commands) => {
  const exact = commands.find((command) => draft.startsWith(command.token))
  if (exact !== undefined) return exact
  return commands.find((command) => {
    const base = command.token.trimEnd()
    return base !== '' && (draft.startsWith(`${base} `) || draft === base)
  })
}

/**
 * dsh composer 的 shell:持有 SubmitMachine 与文本态,执行机器产出的效果,
 * 绑定 textarea 的键盘/IME/自动增高。视图只消费返回的快照与 props 面。
 */
export function useDshComposer({
  busyEnter = 'queue',
  commands,
  defaultValue,
  disabled = false,
  onChange,
  onSubmit,
  onStop,
  running = false,
  steeringAvailable = false,
  value,
}: UseDshComposerOptions) {
  const isControlled = value !== undefined
  const [internalText, setInternalText] = useState(defaultValue ?? '')
  const text = isControlled ? value : internalText

  const machineRef = useRef<SubmitMachine | null>(null)
  if (machineRef.current === null) machineRef.current = new SubmitMachine()
  const machine = machineRef.current

  const [snapshot, setSnapshot] = useState<SubmitSnapshot>(() => machine.state)
  const [notices, setNotices] = useState<DshComposerNotice[]>([])
  const noticeSeqRef = useRef(0)
  const turnRef = useRef(0)

  const textRef = useRef(text)
  textRef.current = text

  // 可变 props 镜像:异步结算回包时回调必须读到最新值,不受闭包冻结。
  const onSubmitRef = useRef(onSubmit)
  onSubmitRef.current = onSubmit
  const commandsRef = useRef(commands)
  commandsRef.current = commands
  const busyEnterRef = useRef(busyEnter)
  busyEnterRef.current = busyEnter
  const runningRef = useRef(running)
  runningRef.current = running
  const steeringRef = useRef(steeringAvailable)
  steeringRef.current = steeringAvailable
  const disabledRef = useRef(disabled)
  disabledRef.current = disabled
  const onStopRef = useRef(onStop)
  onStopRef.current = onStop

  const frozen = isFrozenPhase(snapshot.phase)

  const writeText = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalText(next)
      }
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  const executeEffect = useCallback(
    (effect: DshInputEffect) => {
      switch (effect.type) {
        case 'adjudicate': {
          const found = resolveLeadingCommand(effect.draft, commandsRef.current ?? [])
          // 微任务回投,adjudicating 相位可见;未命中回落普通发送。
          queueMicrotask(() => {
            dispatch({ type: 'adjudicated', attempt: effect.attempt, outcome: found })
          })
          break
        }
        case 'begin-submit': {
          effect.claim
            .run(effect.args, effect.attempt)
            .then((outcome) => {
              dispatch({
                type: 'submit-settled',
                attempt: effect.attempt,
                ok: outcome.kind === 'success',
                command: effect.claim,
                outcome,
              })
            })
            .catch((error: unknown) => {
              dispatch({
                type: 'submit-settled',
                attempt: effect.attempt,
                ok: false,
                command: effect.claim,
                message: error instanceof Error ? error.message : String(error),
              })
            })
          break
        }
        case 'default-sink': {
          onSubmitRef
            .current(effect.draft, effect.mode, effect.attempt)
            .then((outcome) => {
              dispatch({
                type: 'sink-settled',
                attempt: effect.attempt,
                ok: outcome.kind === 'success',
                outcome,
              })
            })
            .catch((error: unknown) => {
              dispatch({
                type: 'sink-settled',
                attempt: effect.attempt,
                ok: false,
                message: error instanceof Error ? error.message : String(error),
              })
            })
          break
        }
        case 'notice': {
          const seq = ++noticeSeqRef.current
          setNotices((current) => [
            ...current.slice(NOTICE_LIMIT - 1),
            { seq, level: effect.level, text: effect.text },
          ])
          break
        }
        case 'commit-draft': {
          turnRef.current += 1
          const current = textRef.current
          if (effect.retainSuffixOf === null || !current.startsWith(effect.retainSuffixOf)) {
            writeText('')
          } else {
            // 保留冻结快照之后追打的纯后缀(蓝本 retainSuffixOf 语义)。
            writeText(current.slice(effect.retainSuffixOf.length))
          }
          break
        }
        default:
          break
      }
    },
    // dispatch 稳定(见下),writeText 依赖受控面;两者都不变语义。
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [writeText],
  )

  const dispatch = useCallback(
    (event: Parameters<SubmitMachine['dispatch']>[0]) => {
      const effects = machine.dispatch(event)
      for (const effect of effects) {
        executeEffect(effect)
      }
      setSnapshot(machine.state)
    },
    [executeEffect, machine],
  )

  const dismissNotice = useCallback((seq: number) => {
    setNotices((current) => current.filter((notice) => notice.seq !== seq))
  }, [])

  const setText = useCallback(
    (next: string) => {
      if (isFrozenPhase(machine.state.phase)) return
      writeText(next)
      dispatch({ type: 'draft-changed', command: resolveLeadingCommand(next, commandsRef.current ?? []) })
    },
    [dispatch, machine, writeText],
  )

  /** 提交入口(裸 Enter 与主按钮共用 'enter' 手势;Ctrl/Cmd+Enter 为 'accelerated')。 */
  const submit = useCallback(
    (gesture: ComposerSubmitGesture) => {
      if (disabledRef.current || isFrozenPhase(machine.state.phase)) return
      const draft = textRef.current
      if (draft.trim() === '' && machine.state.phase !== 'claimed') return
      const mode = resolveSubmitMode(
        busyEnterRef.current,
        runningRef.current,
        gesture,
        steeringRef.current,
      )
      dispatch({ type: 'enter', mode, draft })
    },
    [dispatch, machine],
  )

  const canSubmit =
    !disabled && !frozen && (text.trim() !== '' || snapshot.phase === 'claimed')

  /* ---------------- IME 三重守卫 ---------------- */

  const composingRef = useRef(false)
  const composingUntilRef = useRef(0)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  const syncComposingAttribute = useCallback(() => {
    const el = textareaRef.current
    if (el !== null) {
      el.dataset.composerComposing = String(composingRef.current)
    }
  }, [])

  const handleCompositionStart = useCallback(() => {
    composingRef.current = true
    syncComposingAttribute()
  }, [syncComposingAttribute])

  const handleCompositionEnd = useCallback(() => {
    composingRef.current = false
    composingUntilRef.current = Date.now() + RECENT_COMPOSITION_WINDOW_MS
    syncComposingAttribute()
  }, [syncComposingAttribute])

  /** isComposing 覆盖多数引擎;keyCode 229 是无 isComposing 的老引擎信号;10ms 窗口兜 Safari 晚到 keydown。 */
  const isComposingEvent = useCallback(
    (event: KeyboardEvent) =>
      event.isComposing
      || event.keyCode === 229
      || composingRef.current
      || Date.now() < composingUntilRef.current,
    [],
  )

  /* ---------------- 双击 Esc 停止序列 ---------------- */

  const stopSequenceRef = useRef<StopSequence | null>(null)
  if (stopSequenceRef.current === null) stopSequenceRef.current = new StopSequence()
  const stopSequence = stopSequenceRef.current

  // turn 切换后旧按压失效。
  useEffect(() => {
    stopSequence.reset()
  }, [stopSequence, running])

  /* ---------------- 键盘链 ---------------- */

  const handleKeyDown = useCallback(
    (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
      if (event.key === 'Enter') {
        const native = event.nativeEvent
        // 无意义组合吞掉(蓝本 keymap:alt/altgraph/ctrl+meta/shift+ctrl)。
        if (
          event.altKey
          || native.getModifierState?.('AltGraph') === true
          || (event.ctrlKey && event.metaKey)
          || (event.shiftKey && (event.ctrlKey || event.metaKey))
        ) {
          event.preventDefault()
          return
        }
        // Shift+Enter 原生换行(含组合中)。
        if (event.shiftKey) return
        // IME 收尾 Enter:选词,不提交不断行,不 preventDefault。
        if (isComposingEvent(native)) return
        event.preventDefault()
        // 按住不放不得连发。
        if (event.repeat) return
        if (disabledRef.current || isFrozenPhase(machine.state.phase)) return
        submit(event.ctrlKey || event.metaKey ? 'accelerated' : 'enter')
        return
      }
      if (event.key === 'Escape') {
        if (!runningRef.current || onStopRef.current === undefined) return
        if (event.defaultPrevented) return
        event.preventDefault()
        stopSequence.press({
          region: textareaRef.current ?? {},
          turn: turnRef.current,
          cancel: () => onStopRef.current?.(),
        })
      }
    },
    [isComposingEvent, machine, stopSequence, submit],
  )

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLTextAreaElement>) => {
      setText(event.target.value)
    },
    [setText],
  )

  /* ---------------- 自动增高 ---------------- */

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useLayoutEffect(() => {
    resizeTextarea()
  }, [resizeTextarea, text])

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(resizeTextarea)
    observer.observe(el)
    return () => observer.disconnect()
  }, [resizeTextarea])

  // 卸载即 release:中止 in-flight,防陈旧回包打到已卸载的界面。
  useEffect(() => {
    return () => {
      machine.dispatch({ type: 'release' })
    }
  }, [machine])

  return {
    text,
    setText,
    phase: snapshot.phase as InputPhase,
    claim: snapshot.claim,
    frozen,
    notices,
    dismissNotice,
    canSubmit,
    /** 主按钮(enter 手势)将投递的模式,供诚实标签。 */
    buttonSubmitMode: resolveSubmitMode(busyEnter, running, 'enter', steeringAvailable) as InputSubmitMode,
    submit,
    textareaProps: {
      ref: textareaRef,
      value: text,
      readOnly: frozen || disabled,
      onChange: handleChange,
      onKeyDown: handleKeyDown,
      onCompositionStart: handleCompositionStart,
      onCompositionEnd: handleCompositionEnd,
      'data-frozen': frozen || undefined,
      rows: 1,
    } as const,
    maxTextRows: MAX_TEXT_ROWS,
  }
}
