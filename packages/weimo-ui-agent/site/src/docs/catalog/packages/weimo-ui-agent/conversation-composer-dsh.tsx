import { useCallback, useEffect, useRef, useState } from 'react'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import {
  ConversationComposerDsh,
  type BusyEnterBehavior,
  type DshCommand,
  type DshQueuedMessage,
  type InputSubmitMode,
  type SubmitAttempt,
  type SubmitOutcome,
} from 'weimo-ui-agent/components/conversation-composer-dsh'
import type { ComponentDefinition } from '../../component-docs'

/* ------------------------------------------------------------------ */
/* 模拟 Host:异步受理(onSubmit Promise)、running 回合、排队消费。   */
/* ------------------------------------------------------------------ */

type DemoMessage = {
  id: number
  role: 'user' | 'agent'
  text: string
}

const SEED_MESSAGES: DemoMessage[] = [
  { id: 1, role: 'agent', text: '你好，我是 dsh 协议演示里的模拟 Agent。这里的提交是事务：Host 接受前编辑器只读，接受后才清空。' },
]

const REPLY_SCRIPT = [
  '收到。我这一轮会持续几秒——期间你可以继续输入并提交：默认排队下个回合，Ctrl+Enter 反转。',
  '排队中的消息出现在输入框上方的 dock 里，可以行内编辑、删除，也可以在我运行时插入当前回合（steer）。',
  '双击 Esc（500ms 内两次）或运行中把草稿清空，发送键就会变成停止键。全部讲完了。',
]

const HOST_LATENCY_MS = 900
const REPLY_INTERVAL_MS = 1300

function useDemoDshHost() {
  const [messages, setMessages] = useState<DemoMessage[]>(SEED_MESSAGES)
  const [running, setRunning] = useState(false)
  const [queue, setQueue] = useState<DshQueuedMessage[]>([])
  const timersRef = useRef<number[]>([])
  const queueRef = useRef<DshQueuedMessage[]>([])
  const queueSeqRef = useRef(0)
  const msgSeqRef = useRef(SEED_MESSAGES.length)
  const runningRef = useRef(false)
  const rejectNextRef = useRef(false)

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer)
    }
    timersRef.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const push = useCallback((role: DemoMessage['role'], text: string) => {
    setMessages((current) => [...current, { id: ++msgSeqRef.current, role, text }])
  }, [])

  const setQueueItems = useCallback((next: DshQueuedMessage[]) => {
    queueRef.current = next
    setQueue(next)
  }, [])

  /** 回合结束消费队列:队首消息作为下一条用户消息再次开轮。 */
  const consumeQueue = useCallback(() => {
    const next = queueRef.current[0]
    if (next === undefined) return
    setQueueItems(queueRef.current.slice(1))
    push('user', next.text)
    runTurn(['（排队消息已自动投递）刚才排队的内容我收到了，接着说——'])
  }, [push, setQueueItems])

  const runTurn = useCallback(
    (script: readonly string[]) => {
      runningRef.current = true
      setRunning(true)
      let delay = 400
      for (const line of script) {
        delay += REPLY_INTERVAL_MS
        timersRef.current.push(window.setTimeout(() => push('agent', line), delay))
      }
      timersRef.current.push(
        window.setTimeout(() => {
          runningRef.current = false
          setRunning(false)
          consumeQueue()
        }, delay + 500),
      )
    },
    [consumeQueue, push],
  )

  /** default-sink 接缝:异步受理;拒绝时草稿原样回归编辑态(机器结算语义)。 */
  const submit = useCallback(
    async (draft: string, mode: InputSubmitMode): Promise<SubmitOutcome> => {
      await new Promise((resolve) => window.setTimeout(resolve, HOST_LATENCY_MS))
      if (rejectNextRef.current) {
        rejectNextRef.current = false
        return { kind: 'error', text: 'Host 拒绝了这条消息（演示开关）——草稿已原样回到输入框' }
      }
      if (mode === 'queue') {
        // dsh Host 语义:非 busy 的 queue 即立即投递开轮;busy 才真正进 dock。
        if (!runningRef.current) {
          push('user', draft)
          runTurn(REPLY_SCRIPT)
          return { kind: 'success' }
        }
        setQueueItems([...queueRef.current, { id: `q${++queueSeqRef.current}`, text: draft }])
        return { kind: 'success', text: '已受理：消息进入排队 dock，下个回合自动投递' }
      }
      push('user', draft)
      if (runningRef.current) {
        push('agent', '（已插入当前回合）收到 steer：这条插队消息我现在就处理。')
        return { kind: 'success' }
      }
      runTurn(REPLY_SCRIPT)
      return { kind: 'success' }
    },
    [push, runTurn, setQueueItems],
  )

  const stop = useCallback(() => {
    clearTimers()
    runningRef.current = false
    setRunning(false)
    push('agent', '（已停止——双击 Esc 或停止键）排队消息保留在 dock，下次提交后随回合消费。')
  }, [clearTimers, push])

  const queueAction = useCallback(
    async (id: string, action: { kind: 'edit'; text: string } | { kind: 'remove' } | { kind: 'steer' }) => {
      await new Promise((resolve) => window.setTimeout(resolve, 250))
      if (action.kind === 'remove') {
        setQueueItems(queueRef.current.filter((item) => item.id !== id))
        return
      }
      if (action.kind === 'edit') {
        setQueueItems(
          queueRef.current.map((item) => (item.id === id ? { ...item, text: action.text } : item)),
        )
        return
      }
      const target = queueRef.current.find((item) => item.id === id)
      if (target === undefined) return
      setQueueItems(queueRef.current.filter((item) => item.id !== id))
      push('user', target.text)
      push('agent', '（steer 自 dock）这条排队消息被手动插入当前回合，立即处理。')
    },
    [push, setQueueItems],
  )

  /** 命令目录:/clear 清空、/model 切换假模型(claim 锁定 + hint)。 */
  const commands: readonly DshCommand[] = [
    {
      name: 'clear',
      token: '/clear ',
      hint: '清空对话记录（无参数）',
      run: async () => {
        msgSeqRef.current = 0
        setMessages([{ id: ++msgSeqRef.current, role: 'agent', text: '对话已清空。' }])
        return { kind: 'success', text: '已执行 /clear' }
      },
    },
    {
      name: 'model',
      token: '/model ',
      hint: '输入模型名，如 /model glm-5.3',
      run: async (args: string) => {
        const name = args.trim()
        if (name === '') {
          return { kind: 'error', text: '用法：/model <模型名>' }
        }
        return { kind: 'success', text: `已切换到 ${name}（演示）` }
      },
    },
  ]

  const rejectNext = useCallback(() => {
    rejectNextRef.current = true
  }, [])

  return { commands, messages, queue, queueAction, rejectNext, running, stop, submit }
}

/* ------------------------------------------------------------------ */
/* 主演示                                                              */
/* ------------------------------------------------------------------ */

function ConversationComposerDshDemo() {
  const host = useDemoDshHost()
  const [busyEnter, setBusyEnter] = useState<BusyEnterBehavior>('queue')
  const [steeringAvailable, setSteeringAvailable] = useState(true)
  const logEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: 'nearest' })
  }, [host.messages])

  const handleSubmit = useCallback(
    (draft: string, mode: InputSubmitMode, _attempt: SubmitAttempt): Promise<SubmitOutcome> =>
      host.submit(draft, mode),
    [host],
  )

  return (
    <ComponentPreviewCard className="agent-page__card" label="会话输入框 · dsh">
      <div className="agent-page__chat">
        <div aria-label="对话记录" className="agent-page__log" role="log">
          {host.messages.map((message) => (
            <div
              className={`agent-page__bubble agent-page__bubble--${message.role}`}
              key={message.id}
            >
              {message.text}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
        <ConversationComposerDsh
          busyEnter={busyEnter}
          commands={host.commands}
          onQueueAction={host.queueAction}
          onSubmit={handleSubmit}
          onStop={host.stop}
          placeholder="Enter 发送；运行中默认排队，Ctrl+Enter 反转；输入 /model 或 /clear 试试命令"
          queue={host.queue}
          running={host.running}
          steeringAvailable={steeringAvailable}
        />
        <div className="agent-page__dsh-controls">
          <button className="agent-page__arm-reject" onClick={host.rejectNext} type="button">
            拒绝下一次提交（草稿回归演示）
          </button>
          <span className="agent-page__segment" role="group" aria-label="busy 时 Enter 偏好">
            {(['queue', 'steer'] as const).map((mode) => (
              <button
                aria-pressed={busyEnter === mode}
                className={`agent-page__segment-item${busyEnter === mode ? ' agent-page__segment-item--active' : ''}`}
                key={mode}
                onClick={() => setBusyEnter(mode)}
                type="button"
              >
                {mode === 'queue' ? 'Enter = 排队' : 'Enter = 插入'}
              </button>
            ))}
          </span>
          <label className="agent-page__toggle">
            <input
              checked={steeringAvailable}
              onChange={(event) => setSteeringAvailable(event.target.checked)}
              type="checkbox"
            />
            传输支持 steer
          </label>
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

/* ------------------------------------------------------------------ */
/* 协议要点卡                                                          */
/* ------------------------------------------------------------------ */

const PROTOCOL_POINTS = [
  ['异步受理结算', 'onSubmit 是 Promise：Host 接受（resolve success）才清空草稿；拒绝/失败草稿原样回到输入框并出 notice——对应 zcode 版的同步返回值协议的异步升级。'],
  ['冻结事务', '提交进行中（adjudicating / submitting / sending）编辑器只读但保持焦点；seq 单调递增，过期回包静默丢弃。'],
  ['queue / steer', '运行中提交默认按偏好排队（dock 可编辑/删除/插入）；Ctrl/Cmd+Enter 一键反转；按钮标签只描述点击真正会执行的动作。'],
  ['命令 claim', '输入 /model 或 /clear（补空格或直接回车）锁定前缀为命令，hint 出现在输入区下缘；Enter 执行 run(args)，失败 claim 回归。'],
  ['双击 Esc', '500ms 内连按两次 Esc 停止运行中的回合（同区域判定，跨回合失效）。'],
  ['IME 三重守卫', 'isComposing + keyCode 229 + compositionend 后 10ms 窗口（Safari 晚到 keydown 兜底），组合中的 Enter 永不提交。'],
]

function ConversationComposerDshProtocolDemo() {
  return (
    <ComponentPreviewCard className="agent-page__card" label="协议要点（对比 zcode 版）">
      <dl className="agent-page__protocol">
        {PROTOCOL_POINTS.map(([term, detail]) => (
          <div className="agent-page__protocol-row" key={term}>
            <dt>{term}</dt>
            <dd>{detail}</dd>
          </div>
        ))}
      </dl>
    </ComponentPreviewCard>
  )
}

function ConversationComposerDshPageDemo() {
  return (
    <>
      <ConversationComposerDshDemo />
      <ConversationComposerDshProtocolDemo />
    </>
  )
}

export const conversationComposerDshDefinition = {
  id: 'conversation-composer-dsh',
  summary: 'dsh 协议的会话输入框:事务化提交状态机、异步受理结算、queue/steer、双击 Esc',
  status: 'Ready',
  frame: 'plain',
  preview: () => <ConversationComposerDshPageDemo />,
} satisfies ComponentDefinition
