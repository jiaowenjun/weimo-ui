import { X } from 'lucide-react'
import type { ReactNode } from 'react'

import { BottomBar } from './bottom-bar'
import {
  Dialog,
  DialogClose,
  DialogPopup,
  DialogTitle,
  type DialogPopupProps,
  type DialogProps,
} from './coss/dialog'
import { FloatBar } from './float-bar'
import { FrostedIconButton } from './frosted-icon-button'
import { cn } from './lib/utils'

import './action-dialog.css'

export type ActionDialogProps = DialogProps & {
  bottomBarClassName?: string
  bottomBarLabel?: string
  bottomBarLeftSlot?: ReactNode
  bottomBarRightSlot?: ReactNode
  children: ReactNode
  className?: string
  closeLabel?: string
  floatBarClassName?: string
  popupProps?: Omit<DialogPopupProps, 'children' | 'className'>
  showCloseButton?: boolean
  title: ReactNode
  titleClassName?: string
  toolbarLabel?: string
  toolbarRightSlot?: ReactNode
}

export function ActionDialog({
  bottomBarClassName,
  bottomBarLabel = '对话框底部操作栏',
  bottomBarLeftSlot,
  bottomBarRightSlot,
  children,
  className,
  closeLabel = '关闭对话框',
  floatBarClassName,
  popupProps,
  showCloseButton = true,
  title,
  titleClassName,
  toolbarLabel = '对话框工具栏',
  toolbarRightSlot,
  ...dialogProps
}: ActionDialogProps) {
  const showBottomBar = Boolean(bottomBarLeftSlot || bottomBarRightSlot)

  return (
    <Dialog {...dialogProps}>
      <DialogPopup
        {...popupProps}
        className={cn('action-dialog', className)}
      >
        <FloatBar
          aria-label={toolbarLabel}
          className={cn('action-dialog__bar', floatBarClassName)}
          centerSlot={
            <DialogTitle
              className={cn('action-dialog__title', titleClassName)}
            >
              {title}
            </DialogTitle>
          }
          rightSlot={
            <div className="action-dialog__actions">
              {toolbarRightSlot}
              {showCloseButton ? (
                <DialogClose
                  aria-label={closeLabel}
                  render={<FrostedIconButton />}
                  type="button"
                >
                  <X />
                </DialogClose>
              ) : null}
            </div>
          }
        />
        {children}
        {showBottomBar ? (
          <BottomBar
            aria-label={bottomBarLabel}
            className={cn('action-dialog__bottom-bar', bottomBarClassName)}
            leftSlot={bottomBarLeftSlot}
            rightSlot={bottomBarRightSlot}
          />
        ) : null}
      </DialogPopup>
    </Dialog>
  )
}
