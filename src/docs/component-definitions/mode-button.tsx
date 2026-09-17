import { useState } from 'react'

import {
  ModeButton,
  type ModeButtonMode,
} from '../../components/mode-button'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

function ModeButtonDemo() {
  const [mode, setMode] = useState<ModeButtonMode>('display')
  const editing = mode === 'edit'

  function toggleMode() {
    setMode((current) => (current === 'display' ? 'edit' : 'display'))
  }

  return (
    <div
      className="internal-mode-button-preview"
      aria-label="ModeButton preview"
    >
      <ModeButton
        mode={mode}
        onModeChange={setMode}
        buttonProps={{ size: 'sm' }}
      />
      <TextButton
        className="internal-mode-button-preview__toggle"
        onClick={toggleMode}
      >
        {editing ? '切换到展示态' : '切换到编辑态'}
      </TextButton>
    </div>
  )
}

export const modeButtonDefinition = {
  id: 'mode-button',
  summary: '内部模式图标按钮，统一菜单进入编辑态与关闭编辑态',
  status: 'Ready',
  props: [
    { name: 'mode', type: '"display" | "edit"', defaultValue: '-' },
    {
      name: 'onModeChange',
      type: '(mode: "display" | "edit") => void',
      defaultValue: '-',
    },
    { name: 'disabled', type: 'boolean', defaultValue: 'false' },
    { name: 'className', type: 'string', defaultValue: '-' },
    {
      name: 'buttonProps',
      type: 'Omit<GhostIconButtonProps, "children" | "onClick" | "aria-label">',
      defaultValue: '-',
    },
    {
      name: 'menuCloseTiming',
      type: '"before-mode-change" | "after-mode-change"',
      defaultValue: 'before-mode-change',
    },
    { name: 'displayMenuItems', type: 'ActionMenuItem[]', defaultValue: '[]' },
    { name: 'displayLabel', type: 'string', defaultValue: '打开操作菜单' },
    { name: 'editLabel', type: 'string', defaultValue: '退出编辑态' },
    { name: 'menuLabel', type: 'string', defaultValue: '操作菜单' },
    { name: 'editMenuItemLabel', type: 'string', defaultValue: '编辑' },
  ],
  preview: () => <ModeButtonDemo />,
} satisfies ComponentDefinition
