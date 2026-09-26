import { useEffect, useRef, useState, type MouseEvent } from 'react'
import { Ellipsis, Pencil, X } from 'lucide-react'

import { GhostIconButton, type GhostIconButtonProps } from './ghost-icon-button'
import { ActionMenu, type ActionMenuItem } from './menu'
import { cn } from './lib/utils'

import './mode-button.css'

export type ModeButtonMode = 'display' | 'edit'
export type ModeButtonMenuCloseTiming = 'before-mode-change' | 'after-mode-change'

export interface ModeButtonProps {
  mode: ModeButtonMode
  onModeChange: (mode: ModeButtonMode) => void
  disabled?: boolean
  className?: string
  buttonProps?: Omit<GhostIconButtonProps, 'children' | 'onClick' | 'aria-label'>
  menuCloseTiming?: ModeButtonMenuCloseTiming
  displayMenuItems?: ActionMenuItem[]
  displayLabel?: string
  editLabel?: string
  menuLabel?: string
  editMenuItemLabel?: string
}

export function ModeButton({
  mode,
  onModeChange,
  disabled,
  className,
  buttonProps,
  displayMenuItems = [],
  menuCloseTiming = 'before-mode-change',
  displayLabel = '打开操作菜单',
  editLabel = '退出编辑态',
  menuLabel = '操作菜单',
  editMenuItemLabel = '编辑',
}: ModeButtonProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pendingModeChangeRef = useRef<ModeButtonMode | null>(null)
  const {
    className: buttonClassName,
    disabled: buttonPropsDisabled,
    ...restButtonProps
  } = buttonProps ?? {}
  const buttonDisabled = disabled ?? buttonPropsDisabled ?? false
  const menuOpenForMode = mode === 'display' && menuOpen

  function handleOpenChange(open: boolean) {
    if (!open && pendingModeChangeRef.current === 'edit' && mode === 'display') return

    setMenuOpen(mode === 'display' ? open : false)
  }

  function handleEditSelect() {
    if (menuCloseTiming === 'after-mode-change') {
      pendingModeChangeRef.current = 'edit'
      onModeChange('edit')
      return
    }

    setMenuOpen(false)
    onModeChange('edit')
  }

  function handleButtonClick(event: MouseEvent<HTMLButtonElement>) {
    if (mode !== 'edit') return

    event.preventDefault()
    setMenuOpen(false)
    onModeChange('display')
  }

  useEffect(() => {
    if (pendingModeChangeRef.current === null) return
    if (mode === 'display') return

    pendingModeChangeRef.current = null
    setMenuOpen(false)
  }, [mode])

  const menuItems: ActionMenuItem[] = [
    {
      key: 'edit',
      label: editMenuItemLabel,
      icon: <Pencil aria-hidden="true" />,
      disabled: buttonDisabled,
      onSelect: handleEditSelect,
      closeOnClick: menuCloseTiming !== 'after-mode-change',
    },
    ...displayMenuItems,
  ]

  return (
    <ActionMenu
      ariaLabel={menuLabel}
      items={menuItems}
      rootProps={{
        open: menuOpenForMode,
        onOpenChange: handleOpenChange,
      }}
      triggerProps={{
        render: (
          <GhostIconButton
            aria-label={mode === 'display' ? displayLabel : editLabel}
            className={cn('mode-button', className, buttonClassName)}
            data-mode={mode}
            disabled={buttonDisabled}
            {...restButtonProps}
            onClick={handleButtonClick}
          >
            <span className="mode-button__icon-stack" aria-hidden="true">
              <span
                className="mode-button__icon-layer mode-button__icon-layer--display"
                data-active={mode === 'display' ? 'true' : undefined}
              >
                <Ellipsis />
              </span>
              <span
                className="mode-button__icon-layer mode-button__icon-layer--edit"
                data-active={mode === 'edit' ? 'true' : undefined}
              >
                <X />
              </span>
            </span>
          </GhostIconButton>
        ),
      }}
    />
  )
}
