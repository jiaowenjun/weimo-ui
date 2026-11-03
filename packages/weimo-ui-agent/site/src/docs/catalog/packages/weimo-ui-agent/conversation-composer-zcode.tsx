import { useCallback, useEffect, useRef, useState } from 'react'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import {
  ConversationComposerZcode,
  type ConversationComposerZcodeStatus,
} from 'weimo-ui-agent/components/conversation-composer-zcode'
import type { ComponentDefinition } from '../../component-docs'

/* ------------------------------------------------------------------ */
/* 模拟 Agent:pending → running(逐条回复) → idle;运行中提交入队。   */
/* ------------------------------------------------------------------ */

type DemoMessage = {
  id: number
  role: 'user' | 'agent'
  text: string
}

const SEED_MESSAGES: DemoMessage[] = [
  { id: 1, role: 'agent', text: '你好，我是演示里的模拟 Agent。输入消息按 Enter 发送，试试看。' },
]

const SEED_PROMPT_HISTORY = [
  '总结一下这个组件的交互协议',
  '解释发送键的三态是怎么映射的',
  '再简单一点',
]

const REPLY_SCRIPT = [
  '收到，我先梳理一下要点……',
  '发送键由 status 单独驱动：idle 发送、pending 转为加载、running 且没在打字时变成停止。',
  '运行中继续输入再发送是「排队追问」，不会打断当前回答；Esc 或停止按钮随时可以打断我。',
]

const PENDING_DELAY_MS = 900
const REPLY_INTERVAL_MS = 1300

function useDemoAgent() {
  const [messages, setMessages] = useState<DemoMessage[]>(SEED_MESSAGES)
  const [status, setStatus] = useState<ConversationComposerZcodeStatus>('idle')
  const timersRef = useRef<number[]>([])
  const queueRef = useRef<string[]>([])
  const seqRef = useRef(SEED_MESSAGES.length)

  const clearTimers = useCallback(() => {
    for (const timer of timersRef.current) {
      window.clearTimeout(timer)
    }
    timersRef.current = []
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  const push = useCallback((role: DemoMessage['role'], text: string) => {
    setMessages((current) => [...current, { id: ++seqRef.current, role, text }])
  }, [])

  /** 逐条流式输出 script;结束后回落 idle,再消费排队追问。 */
  const runReply = useCallback(
    (script: readonly string[]) => {
      setStatus('running')
      let delay = 400
      for (const line of script) {
        delay += REPLY_INTERVAL_MS
        timersRef.current.push(window.setTimeout(() => push('agent', line), delay))
      }
      timersRef.current.push(
        window.setTimeout(() => {
          setStatus('idle')
          const queued = queueRef.current.shift()
          if (queued !== undefined) {
            runReply([`收到排队追问「${queued}」：此刻发送键保持发送，就是为这种场景设计的。`])
          }
        }, delay + 500),
      )
    },
    [push],
  )

  const submit = useCallback(
    (text: string): boolean => {
      const trimmed = text.trim()
      if (!trimmed) {
        return false
      }
      push('user', trimmed)
      if (status === 'running') {
        queueRef.current.push(trimmed)
        return true
      }
      setStatus('pending')
      timersRef.current.push(
        window.setTimeout(() => runReply(REPLY_SCRIPT), PENDING_DELAY_MS),
      )
      return true
    },
    [push, runReply, status],
  )

  const stop = useCallback(() => {
    clearTimers()
    queueRef.current = []
    push('agent', '（已停止）')
    setStatus('idle')
  }, [clearTimers, push])

  return { messages, status, stop, submit }
}

/* ------------------------------------------------------------------ */
/* 主演示:对话 + composer + 提交被拒开关                              */
/* ------------------------------------------------------------------ */

function ConversationComposerDemo() {
  const [rejectSubmit, setRejectSubmit] = useState(false)
  const agent = useDemoAgent()
  const logEndRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ block: 'nearest' })
  }, [agent.messages])

  return (
    <ComponentPreviewCard className="agent-page__card">
      <div className="agent-page__chat">
        <div aria-label="对话记录" className="agent-page__log" role="log">
          {agent.messages.map((message) => (
            <div
              className={`agent-page__bubble agent-page__bubble--${message.role}`}
              key={message.id}
            >
              {message.text}
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
        <ConversationComposerZcode
          leadingActions={<span className="agent-page__model-pill">GLM-5.3</span>}
          onSubmit={(text) => (rejectSubmit ? false : agent.submit(text))}
          onStop={agent.stop}
          placeholder={
            agent.status === 'running'
              ? '运行中……继续输入可排队追问'
              : '给 Agent 发消息，Enter 发送 / Shift+Enter 换行'
          }
          promptHistory={SEED_PROMPT_HISTORY}
          status={agent.status}
          topContent={
            rejectSubmit ? (
              <p className="agent-page__hint">onSubmit 返回 false：本次提交被业务层拒绝，草稿保留。</p>
            ) : null
          }
        />
        <label className="agent-page__toggle">
          <input
            checked={rejectSubmit}
            onChange={(event) => setRejectSubmit(event.target.checked)}
            type="checkbox"
          />
          模拟提交被拒（onSubmit 返回 false）
        </label>
      </div>
    </ComponentPreviewCard>
  )
}

function ConversationComposerPageDemo() {
  return <ConversationComposerDemo />
}

export const conversationComposerZcodeDefinition = {
  id: 'conversation-composer-zcode',
  summary: 'Agent 聊天输入框:键盘协议、发送键三态、提交返回值协议与三个插槽',
  status: 'Ready',
  frame: 'plain',
  preview: () => <ConversationComposerPageDemo />,
} satisfies ComponentDefinition
