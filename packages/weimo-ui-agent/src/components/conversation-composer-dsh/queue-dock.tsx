import { useState } from 'react'
import type { ReactNode } from 'react'
import { ChevronDown, ChevronRight, Pencil, SendHorizontal, X } from 'lucide-react'

import { cn } from 'weimo-ui-core/lib/utils'

/**
 * 排队消息 dock:busy 会话中投递为 queue 的消息在此排队,行内编辑/删除/steer。
 * 视觉贴挂在输入卡片上方(负 margin,方角下缘由卡片上边框收口)。
 * 移植自 reference/dsh 的 ui-conversation/queue/QueueDock.tsx(纯文本队列精简)。
 */

export interface DshQueuedMessage {
  readonly id: string
  readonly text: string
}

export type DshQueueAction =
  | { readonly kind: 'edit'; readonly text: string }
  | { readonly kind: 'remove' }
  | { readonly kind: 'steer' }

export interface QueueDockProps {
  items: readonly DshQueuedMessage[]
  /** steer 只在运行中可用(插入当前 turn 的前提)。 */
  running?: boolean
  onAction?: (id: string, action: DshQueueAction) => void | Promise<void>
  /** 无障碍/文案。 */
  label?: string
  children?: ReactNode
}

export function QueueDock({
  items,
  label = '排队消息',
  onAction,
  running = false,
}: QueueDockProps) {
  const [collapsed, setCollapsed] = useState(true)
  const [editing, setEditing] = useState<{ id: string; text: string } | null>(null)
  // 任意行操作期间全 dock 动作禁用(蓝本的 busy 串行化)。
  const [busyId, setBusyId] = useState<string | null>(null)
  const interactionActive = editing !== null || busyId !== null

  if (items.length === 0) return null

  const expandForInteraction = () => setCollapsed(false)

  const runAction = async (id: string, action: DshQueueAction) => {
    if (busyId !== null) return
    setBusyId(id)
    try {
      await onAction?.(id, action)
      if (action.kind === 'edit') setEditing(null)
    } finally {
      setBusyId(null)
    }
  }

  const beginEdit = (item: DshQueuedMessage) => {
    expandForInteraction()
    setEditing({ id: item.id, text: item.text })
  }

  const saveEdit = () => {
    if (editing === null || editing.text.trim() === '') return
    void runAction(editing.id, { kind: 'edit', text: editing.text })
  }

  const multiple = items.length > 1
  const expanded = !multiple || !collapsed || interactionActive

  const renderRow = (item: DshQueuedMessage) => {
    const isEditing = editing?.id === item.id
    const rowBusy = busyId === item.id
    return (
      <li className="conversation-composer-dsh__dock-row" key={item.id}>
        {isEditing ? (
          <>
            <textarea
              aria-label={`${label}行内编辑`}
              className="conversation-composer-dsh__dock-editor"
              onChange={(event) =>
                setEditing((current) =>
                  current === null ? current : { ...current, text: event.target.value },
                )
              }
              rows={2}
              value={editing.text}
            />
            <div className="conversation-composer-dsh__dock-row-actions">
              <button
                className="conversation-composer-dsh__dock-act conversation-composer-dsh__dock-act--primary"
                disabled={editing.text.trim() === '' || busyId !== null}
                onClick={saveEdit}
                type="button"
              >
                保存
              </button>
              <button
                className="conversation-composer-dsh__dock-act"
                disabled={busyId !== null}
                onClick={() => setEditing(null)}
                type="button"
              >
                取消
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="conversation-composer-dsh__dock-text">{item.text}</p>
            <div className="conversation-composer-dsh__dock-row-actions">
              <button
                aria-label="编辑这条排队消息"
                className="conversation-composer-dsh__dock-icon"
                disabled={busyId !== null}
                onClick={() => beginEdit(item)}
                title="编辑"
                type="button"
              >
                <Pencil aria-hidden="true" />
              </button>
              <button
                aria-label="将这条消息插入当前回合"
                className="conversation-composer-dsh__dock-icon"
                disabled={!running || busyId !== null}
                onClick={() => void runAction(item.id, { kind: 'steer' })}
                title={running ? '插入当前回合(steer)' : '运行中才可插入当前回合'}
                type="button"
              >
                <SendHorizontal aria-hidden="true" />
              </button>
              <button
                aria-label="删除这条排队消息"
                className="conversation-composer-dsh__dock-icon"
                disabled={busyId !== null}
                onClick={() => void runAction(item.id, { kind: 'remove' })}
                title="删除"
                type="button"
              >
                <X aria-hidden="true" />
              </button>
              {rowBusy ? <span aria-hidden="true" className="conversation-composer-dsh__dock-busy" /> : null}
            </div>
          </>
        )}
      </li>
    )
  }

  return (
    <div
      aria-label={label}
      className={cn('conversation-composer-dsh__dock', expanded && 'conversation-composer-dsh__dock--expanded')}
      data-composer-dock=""
    >
      {multiple ? (
        <button
          className="conversation-composer-dsh__dock-header"
          onClick={() => setCollapsed((current) => !current)}
          type="button"
        >
          {expanded ? <ChevronDown aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}
          <span>
            {label} · {items.length} 条
          </span>
        </button>
      ) : (
        <span className="conversation-composer-dsh__dock-header conversation-composer-dsh__dock-header--static">
          {label}
        </span>
      )}
      {expanded ? <ul className="conversation-composer-dsh__dock-list">{items.map(renderRow)}</ul> : null}
    </div>
  )
}
