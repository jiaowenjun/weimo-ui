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
  preview: () => <ModeButtonDemo />,
} satisfies ComponentDefinition
