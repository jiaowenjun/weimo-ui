import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'

import {
  mergePromptHistory,
  navigatePromptHistory,
} from './conversation-composer-model'

export interface UseComposerTextOptions {
  value?: string
  defaultValue?: string
  onChange?: (value: string) => void
  /** 外部历史(旧→新);本地已受理的提交自动追记合并。 */
  promptHistory?: readonly string[]
}

/**
 * composer 文本态收口:受控/非受控统一、textarea 自动增高、↑/↓ 历史导航。
 *
 * 历史浏览期间用户任何手动编辑(非导航写入)都会退出历史态;进入历史态那一刻的
 * 草稿被暂存,↓ 翻出最新一条后还原,与常见终端/聊天客户端行为一致。
 */
export function useComposerText({
  defaultValue,
  onChange,
  promptHistory,
  value,
}: UseComposerTextOptions) {
  const isControlled = value !== undefined
  const [internalText, setInternalText] = useState(defaultValue ?? '')
  const text = isControlled ? value : internalText

  const textRef = useRef(text)
  textRef.current = text

  const textareaRef = useRef<HTMLTextAreaElement | null>(null)
  const [historyIndex, setHistoryIndex] = useState<number | null>(null)
  const historyIndexRef = useRef<number | null>(null)
  const draftBeforeHistoryRef = useRef('')
  const [localHistory, setLocalHistory] = useState<string[]>([])

  const historyEntries = useMemo(
    () => mergePromptHistory(promptHistory ?? [], localHistory),
    [promptHistory, localHistory],
  )

  const writeText = useCallback(
    (next: string) => {
      if (!isControlled) {
        setInternalText(next)
      }
      onChange?.(next)
    },
    [isControlled, onChange],
  )

  const exitHistoryBrowsing = useCallback(() => {
    historyIndexRef.current = null
    draftBeforeHistoryRef.current = ''
    setHistoryIndex(null)
  }, [])

  const setText = useCallback(
    (next: string) => {
      // 手动编辑(含外部 setValue)不属于历史浏览,统一退出历史态。
      exitHistoryBrowsing()
      writeText(next)
    },
    [exitHistoryBrowsing, writeText],
  )

  /**
   * ↑/↓ 历史导航。direction=up 时 allowed 由视图层判定
   * (空草稿或光标在起始位才进入历史),down 仅在历史态内生效。
   */
  const navigateHistory = useCallback(
    (direction: 'up' | 'down', allowed: boolean) => {
      if (direction === 'up' && !allowed) {
        return
      }
      const move = navigatePromptHistory(
        historyEntries,
        historyIndexRef.current,
        direction,
        draftBeforeHistoryRef.current,
      )
      if (!move) {
        return
      }
      if (historyIndexRef.current === null) {
        draftBeforeHistoryRef.current = textRef.current
      }
      historyIndexRef.current = move.index
      setHistoryIndex(move.index)
      writeText(move.text)
    },
    [historyEntries, writeText],
  )

  /** 提交被受理后的收口:追记历史、退出浏览态、清空输入。 */
  const resetAfterSubmit = useCallback(() => {
    const submitted = textRef.current
    setLocalHistory((entries) => [...entries, submitted])
    exitHistoryBrowsing()
    writeText('')
  }, [exitHistoryBrowsing, writeText])

  // 自动增高:高度贴内容,行数超过 CSS max-height 后由滚动接管。
  // 宽度变化(容器收缩引起折行变化)经 ResizeObserver 一并重算。
  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) {
      return
    }
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useLayoutEffect(() => {
    resizeTextarea()
  }, [resizeTextarea, text])

  useLayoutEffect(() => {
    const el = textareaRef.current
    if (!el || typeof ResizeObserver === 'undefined') {
      return
    }
    const observer = new ResizeObserver(resizeTextarea)
    observer.observe(el)
    return () => observer.disconnect()
  }, [resizeTextarea])

  return {
    text,
    setText,
    textareaRef,
    historyEntries,
    historyIndex,
    navigateHistory,
    resetAfterSubmit,
  }
}
