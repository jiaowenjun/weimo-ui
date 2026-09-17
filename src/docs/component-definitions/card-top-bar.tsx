import { useState } from 'react'

import { CardTopBar } from '../../components/card-top-bar'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

function CardTopBarDemo() {
  const [mode, setMode] = useState<'display' | 'edit'>('display')
  const editing = mode === 'edit'

  function enterEdit() {
    setMode('edit')
  }

  function exitEdit() {
    setMode('display')
  }

  return (
    <div className="internal-card-top-bar-preview" aria-label="CardTopBar preview">
      <div className="internal-card-top-bar-preview__surface">
        {editing ? (
          <CardTopBar
            mode="edit"
            editTitle="编辑笔记"
            onCancel={exitEdit}
          />
        ) : (
          <CardTopBar
            mode="display"
            createdAtText="今天 14:06"
            onAction={enterEdit}
          />
        )}
        <TextButton
          className="internal-card-top-bar-preview__toggle"
          onClick={() => {
            setMode((current) => (current === 'display' ? 'edit' : 'display'))
          }}
        >
          {editing ? '切换到展示态' : '切换到编辑态'}
        </TextButton>
      </div>
    </div>
  )
}

export const cardTopBarDefinition = {
  id: 'card-top-bar',
  summary: '内部卡片顶部栏，统一展示态与 Card 编辑态',
  status: 'Ready',
  preview: () => <CardTopBarDemo />,
} satisfies ComponentDefinition
