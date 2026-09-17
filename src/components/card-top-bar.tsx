import { useRef } from 'react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'

import { cn } from './lib/utils'
import { ModeButton, type ModeButtonMode } from './mode-button'
import type { ActionMenuItem } from './menu'

import './card-top-bar.css'

export type CardTopBarDisplayProps = Omit<
  ComponentPropsWithoutRef<'header'>,
  'children' | 'title'
> & {
  mode: 'display'
  createdAtText: ReactNode
  title?: ReactNode
  actionLabel?: string
  actionGroupClassName?: string
  actionPrefixSlot?: ReactNode
  actionSlot?: ReactNode
  displayMenuItems?: ActionMenuItem[]
  editActionLabel?: string
  disabled?: boolean
  onAction?: () => void
}

export type CardTopBarEditProps = Omit<
  ComponentPropsWithoutRef<'header'>,
  'children'
> & {
  mode: 'edit'
  editTitle: ReactNode
  actionSlot?: ReactNode
  cancelLabel?: string
  disabled?: boolean
  onCancel?: () => void
}

export type CardTopBarProps =
  | CardTopBarDisplayProps
  | CardTopBarEditProps

type CardTopBarFrameProps = ComponentPropsWithoutRef<'header'> & {
  mode: CardTopBarProps['mode']
  rightSlot?: ReactNode
}

function CardTopBarFrame({
  children,
  className,
  mode,
  rightSlot,
  ...props
}: CardTopBarFrameProps) {
  return (
    <header
      className={cn('weimo-card__header weimo-card-top-bar', className)}
      {...props}
      data-mode={mode}
    >
      <div className="weimo-card__header-main">{children}</div>
      {rightSlot ? <div className="weimo-card__header-action">{rightSlot}</div> : null}
    </header>
  )
}

type CardTopBarTextSlotProps = {
  displayText: ReactNode
  editTitle: ReactNode
  mode: CardTopBarProps['mode']
}

function CardTopBarTextSlot({
  displayText,
  editTitle,
  mode,
}: CardTopBarTextSlotProps) {
  const displayActive = mode === 'display'

  return (
    <span className="weimo-card-top-bar__slot">
      <span
        aria-hidden={!displayActive}
        className="weimo-card-top-bar__slot-layer"
        data-active={displayActive ? 'true' : undefined}
      >
        {displayText}
      </span>
      <span
        aria-hidden={displayActive}
        className="weimo-card-top-bar__slot-layer"
        data-active={displayActive ? undefined : 'true'}
      >
        <span className={cn('weimo-card__time weimo-card-top-bar__edit-title')}>
          {editTitle}
        </span>
      </span>
    </span>
  )
}

export function CardTopBar(props: CardTopBarProps) {
  const displayTextRef = useRef<ReactNode>(null)
  const editTitleRef = useRef<ReactNode>(null)

  if (props.mode === 'display') {
    const {
      actionLabel = '更多操作',
      actionGroupClassName,
      actionPrefixSlot,
      actionSlot,
      className,
      createdAtText,
      disabled,
      displayMenuItems,
      editActionLabel = '编辑',
      mode,
      onAction,
      title,
      ...headerProps
    } = props
    displayTextRef.current = title !== undefined ? (
      <span className="weimo-card__title">{title}</span>
    ) : (
      <time className="weimo-card__time">{createdAtText}</time>
    )
    function handleActionModeChange(nextMode: ModeButtonMode) {
      if (nextMode !== 'edit' || disabled) return

      onAction?.()
    }

    const defaultActionSlot = onAction ? (
      <ModeButton
        buttonProps={{
          className: 'weimo-card__header-icon-button',
          size: 'sm',
        }}
        disabled={disabled}
        displayLabel={actionLabel}
        displayMenuItems={displayMenuItems}
        editLabel="取消"
        editMenuItemLabel={editActionLabel}
        menuLabel={actionLabel}
        menuCloseTiming="after-mode-change"
        mode={mode}
        onModeChange={handleActionModeChange}
      />
    ) : null
    const resolvedActionSlot =
      actionSlot ??
      (actionPrefixSlot ? (
        <div className={cn('weimo-card-top-bar__actions', actionGroupClassName)}>
          {actionPrefixSlot}
          {defaultActionSlot}
        </div>
      ) : defaultActionSlot)

    return (
      <CardTopBarFrame
        {...headerProps}
        className={className}
        mode={mode}
        rightSlot={resolvedActionSlot}
      >
        <CardTopBarTextSlot
          displayText={displayTextRef.current}
          editTitle={editTitleRef.current}
          mode={mode}
        />
      </CardTopBarFrame>
    )
  }

  const {
    actionSlot,
    cancelLabel = '取消',
    className,
    disabled,
    editTitle,
    mode,
    onCancel,
    ...headerProps
  } = props
  editTitleRef.current = editTitle
  function handleActionModeChange(nextMode: ModeButtonMode) {
    if (nextMode !== 'display' || disabled) return

    onCancel?.()
  }

  return (
    <CardTopBarFrame
      {...headerProps}
      className={className}
      mode={mode}
      rightSlot={
        actionSlot ?? (
          <ModeButton
            buttonProps={{
              className: 'weimo-card__header-icon-button',
              size: 'sm',
            }}
            disabled={disabled}
            displayLabel="更多操作"
            editLabel={cancelLabel}
            editMenuItemLabel="编辑"
            menuLabel="更多操作"
            mode={mode}
            onModeChange={handleActionModeChange}
          />
        )
      }
    >
      <CardTopBarTextSlot
        displayText={displayTextRef.current}
        editTitle={editTitleRef.current}
        mode={mode}
      />
    </CardTopBarFrame>
  )
}
