import { useState } from 'react'
import { Menu } from 'lucide-react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import { Switch } from '../../components/coss/switch'
import { GhostIconButton } from '../../components/ghost-icon-button'
import { GlassIconButton } from '../../components/glass-icon-button'
import {
  ModeButton,
  type ModeButtonMode,
} from '../../components/mode-button'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'

function TextButtonPreview() {
  const [disabled, setDisabled] = useState(false)

  return (
    <ComponentPreviewCard
      action={
        <span className="preview-toggle">
          <span className="preview-toggle__label">
            {disabled ? '禁用' : '启用'}
          </span>
          <Switch
            aria-label="启用"
            checked={!disabled}
            onCheckedChange={(checked) => setDisabled(!checked)}
          />
        </span>
      }
      label="文本按钮"
    >
      <div className="text-button-preview" aria-label="TextButton 状态预览">
        <TextButton disabled={disabled}>文本按钮</TextButton>
      </div>
    </ComponentPreviewCard>
  )
}

function GhostIconButtonPreviewGroup({ disabled }: { disabled: boolean }) {
  return (
    <div className="icon-preview__row" aria-label="GhostIconButton 幽灵外观预览">
      <GhostIconButton aria-label="菜单" disabled={disabled}>
        <Menu />
      </GhostIconButton>
      <GhostIconButton aria-label="小号菜单" disabled={disabled} size="sm">
        <Menu />
      </GhostIconButton>
    </div>
  )
}

function GhostIconButtonPreview() {
  const [disabled, setDisabled] = useState(false)

  return (
    <ComponentPreviewCard
      action={
        <span className="preview-toggle">
          <span className="preview-toggle__label">
            {disabled ? '禁用' : '启用'}
          </span>
          <Switch
            aria-label="启用"
            checked={!disabled}
            onCheckedChange={(checked) => setDisabled(!checked)}
          />
        </span>
      }
      label="幽灵图标按钮"
    >
      <div className="icon-button-preview" aria-label="GhostIconButton 普通背景预览">
        <GhostIconButtonPreviewGroup disabled={disabled} />
      </div>
    </ComponentPreviewCard>
  )
}

function GlassIconButtonPreviewGroup({ disabled }: { disabled: boolean }) {
  return (
    <div className="icon-preview__row" aria-label="GlassIconButton 玻璃外观预览">
      <GlassIconButton aria-label="菜单" disabled={disabled}>
        <Menu />
      </GlassIconButton>
      <GlassIconButton aria-label="小号菜单" disabled={disabled} size="sm">
        <Menu />
      </GlassIconButton>
    </div>
  )
}

function GlassIconButtonPreview() {
  const [disabled, setDisabled] = useState(false)

  return (
    <GlassPreviewCard
      action={
        <span className="preview-toggle">
          <span className="preview-toggle__label">
            {disabled ? '禁用' : '启用'}
          </span>
          <Switch
            aria-label="启用"
            checked={!disabled}
            onCheckedChange={(checked) => setDisabled(!checked)}
          />
        </span>
      }
      label="玻璃图标按钮"
    >
      <GlassIconButtonPreviewGroup disabled={disabled} />
    </GlassPreviewCard>
  )
}

function ModeButtonDemo() {
  const [mode, setMode] = useState<ModeButtonMode>('display')
  const editing = mode === 'edit'

  function toggleMode(checked: boolean) {
    setMode(checked ? 'edit' : 'display')
  }

  return (
    <ComponentPreviewCard
      action={
        <span className="preview-toggle">
          <span className="preview-toggle__label">
            {editing ? '编辑态' : '默认态'}
          </span>
          <Switch
            aria-label="切换编辑态"
            checked={editing}
            onCheckedChange={toggleMode}
          />
        </span>
      }
      label="模式按钮"
    >
      <div className="icon-button-preview" aria-label="ModeButton preview">
        <ModeButton
          mode={mode}
          onModeChange={setMode}
          buttonProps={{ size: 'sm' }}
        />
      </div>
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function ButtonDemo() {
  return (
    <>
      <TextButtonPreview />
      <GhostIconButtonPreview />
      <GlassIconButtonPreview />
      <ModeButtonDemo />
    </>
  )
}

export const buttonDefinition = {
  id: 'button',
  summary: '文本按钮、幽灵/玻璃图标按钮与模式按钮的按钮总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'TextButton',
    'GhostIconButton',
    'GlassIconButton',
    'ModeButton',
    '文本按钮',
    '幽灵图标按钮',
    '玻璃图标按钮',
    '模式按钮',
  ],
  preview: () => <ButtonDemo />,
} satisfies ComponentDefinition
