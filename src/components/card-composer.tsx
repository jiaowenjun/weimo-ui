import { X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'

import { Card, type CardProps } from './card'
import { ComposerShell } from './composer-shell'
import { GhostIconButton } from './ghost-icon-button'

export type CardComposerRenderCard = (props: CardProps) => ReactNode

export type CardComposerProps = CardProps & {
  clientId: string
  isClosing?: boolean
  onExitAnimationEnd?: () => void
  onViewTransitionEnd?: () => void
  renderCard?: CardComposerRenderCard
}

type CardComposerAutoFocusState = {
  clientId: string
  ready: boolean
}

export function CardComposer({
  clientId,
  disabled,
  editBehavior,
  isClosing = false,
  labels,
  onCancel,
  onExitAnimationEnd,
  onViewTransitionEnd,
  renderCard,
  ...cardProps
}: CardComposerProps) {
  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const [autoFocusState, setAutoFocusState] =
    useState<CardComposerAutoFocusState>(() => ({
      clientId,
      ready: false,
    }))
  const initialEditAutoFocus =
    !isClosing &&
    autoFocusState.clientId === clientId && autoFocusState.ready

  useEffect(() => {
    let cancelled = false
    let frame = 0

    function allowInitialEditAutoFocus() {
      if (cancelled) return

      setAutoFocusState({
        clientId,
        ready: true,
      })
    }

    frame = window.requestAnimationFrame(() => {
      const wrapper = wrapperRef.current
      if (!wrapper) {
        allowInitialEditAutoFocus()
        return
      }

      const animations = wrapper.getAnimations()
      if (animations.length === 0) {
        allowInitialEditAutoFocus()
        return
      }

      void Promise.allSettled(animations.map((animation) => animation.finished)).then(
        allowInitialEditAutoFocus,
      )
    })

    return () => {
      cancelled = true
      window.cancelAnimationFrame(frame)
    }
  }, [clientId])

  function blurComposerEditor() {
    const activeElement = document.activeElement
    if (!(activeElement instanceof HTMLElement)) return
    if (!wrapperRef.current?.contains(activeElement)) return

    activeElement.blur()
  }

  function handleComposerClose() {
    if (isClosing) return

    blurComposerEditor()
    const externalCancel = editBehavior?.onCancel ?? onCancel
    externalCancel?.()
  }

  const composerEditActionSlot = (
    <GhostIconButton
      aria-label={labels?.cancel ?? '取消'}
      className="weimo-card__header-icon-button"
      disabled={disabled || isClosing}
      onClick={handleComposerClose}
      size="sm"
    >
      <X />
    </GhostIconButton>
  )

  const composerCardProps: CardProps = {
    ...cardProps,
    disabled: disabled || isClosing,
    labels: {
      ...labels,
      editTitle: labels?.editTitle ?? '新建笔记',
    },
    editBehavior: {
      ...editBehavior,
      actionSlot: editBehavior?.actionSlot ?? composerEditActionSlot,
      onCancel: handleComposerClose,
    },
    initialEditAutoFocus,
    onCancel,
  }
  const ComposerCard = renderCard ?? Card

  return (
    <ComposerShell
      isClosing={isClosing}
      onExitAnimationEnd={onExitAnimationEnd}
      onViewTransitionEnd={onViewTransitionEnd}
      ref={wrapperRef}
    >
      <ComposerCard {...composerCardProps} />
    </ComposerShell>
  )
}
