import { Check } from 'lucide-react'
import { useState } from 'react'

import { ActionDialog } from '../../components/action-dialog'
import { DialogPanel } from '../../components/coss/dialog'
import { GlassIconButton } from '../../components/glass-icon-button'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

function ActionDialogDemo({ defaultOpen = false }: { defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="internal-dialog-preview">
      <TextButton onClick={() => setOpen(true)} type="button">
        打开内部对话框
      </TextButton>
      <ActionDialog
        bottomBarRightSlot={
          <GlassIconButton aria-label="保存">
            <Check />
          </GlassIconButton>
        }
        onOpenChange={setOpen}
        open={open}
        title="内部操作"
      >
        <DialogPanel className="internal-dialog-preview__panel">
          <p>用于组合顶部 FloatBar、内容面板和可选底部操作栏。</p>
        </DialogPanel>
      </ActionDialog>
    </div>
  )
}

export const actionDialogDefinition = {
  id: 'action-dialog',
  summary: '内部操作对话框骨架，组合 FloatBar 标题栏、右侧工具按钮、关闭按钮和可选 BottomBar',
  status: 'Ready',
  props: [
    { name: 'open', type: 'boolean', defaultValue: '-' },
    { name: 'onOpenChange', type: '(open: boolean) => void', defaultValue: '-' },
    { name: 'title', type: 'ReactNode', defaultValue: '-' },
    { name: 'children', type: 'ReactNode', defaultValue: '-' },
    { name: 'toolbarRightSlot', type: 'ReactNode', defaultValue: '-' },
    { name: 'showCloseButton', type: 'boolean', defaultValue: 'true' },
    { name: 'bottomBarLeftSlot', type: 'ReactNode', defaultValue: '-' },
    { name: 'bottomBarRightSlot', type: 'ReactNode', defaultValue: '-' },
    { name: 'popupProps', type: 'Omit<DialogPopupProps, "children" | "className">', defaultValue: '-' },
  ],
  preview: () => <ActionDialogDemo />,
} satisfies ComponentDefinition
