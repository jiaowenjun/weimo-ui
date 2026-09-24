import { useState } from 'react'
import { Ellipsis, Menu, Share } from 'lucide-react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import { GhostIconButton } from '../../components/ghost-icon-button'
import { GlassIconButton } from '../../components/glass-icon-button'
import {
  GlassIconButtonGroup,
  GlassIconGroupButton,
} from '../../components/glass-icon-button-group'
import {
  ModeButton,
  type ModeButtonMode,
} from '../../components/mode-button'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'
import { PreviewToggle } from '../preview-toggle'

function TextButtonPreview() {
  const [disabled, setDisabled] = useState(false)

  return (
    <ComponentPreviewCard
      action={
        <PreviewToggle
          ariaLabel="启用"
          checked={!disabled}
          label={disabled ? '禁用' : '启用'}
          onCheckedChange={(checked) => setDisabled(!checked)}
        />
      }
      align="center"
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
      <GhostIconButton aria-label="极小号菜单" disabled={disabled} size="xs">
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
        <PreviewToggle
          ariaLabel="启用"
          checked={!disabled}
          label={disabled ? '禁用' : '启用'}
          onCheckedChange={(checked) => setDisabled(!checked)}
        />
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
        <PreviewToggle
          ariaLabel="启用"
          checked={!disabled}
          label={disabled ? '禁用' : '启用'}
          onCheckedChange={(checked) => setDisabled(!checked)}
        />
      }
      label="玻璃图标按钮"
    >
      <GlassIconButtonPreviewGroup disabled={disabled} />
    </GlassPreviewCard>
  )
}

function GlassIconButtonGroupPreviewGroup({ disabled }: { disabled: boolean }) {
  return (
    <div className="icon-preview__row" aria-label="GlassIconButtonGroup 玻璃按钮组预览">
      <GlassIconButtonGroup aria-label="玻璃图标按钮组">
        <GlassIconGroupButton aria-label="分享" disabled={disabled}>
          <Share />
        </GlassIconGroupButton>
        <GlassIconGroupButton aria-label="更多" disabled={disabled}>
          <Ellipsis />
        </GlassIconGroupButton>
      </GlassIconButtonGroup>
      <GlassIconButtonGroup aria-label="小号玻璃图标按钮组">
        <GlassIconGroupButton aria-label="小号分享" disabled={disabled} size="sm">
          <Share />
        </GlassIconGroupButton>
        <GlassIconGroupButton aria-label="小号更多" disabled={disabled} size="sm">
          <Ellipsis />
        </GlassIconGroupButton>
      </GlassIconButtonGroup>
    </div>
  )
}

function GlassIconButtonGroupPreview() {
  const [disabled, setDisabled] = useState(false)

  return (
    <GlassPreviewCard
      action={
        <PreviewToggle
          ariaLabel="启用"
          checked={!disabled}
          label={disabled ? '禁用' : '启用'}
          onCheckedChange={(checked) => setDisabled(!checked)}
        />
      }
      label="玻璃图标按钮组"
    >
      <GlassIconButtonGroupPreviewGroup disabled={disabled} />
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
        <PreviewToggle
          ariaLabel="切换编辑态"
          checked={editing}
          label={editing ? '编辑态' : '默认态'}
          onCheckedChange={toggleMode}
        />
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
      <GlassIconButtonGroupPreview />
      <ModeButtonDemo />
    </>
  )
}

export const buttonDefinition = {
  id: 'button',
  summary: '文本按钮、幽灵/玻璃图标按钮、玻璃图标按钮组与模式按钮的按钮总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'TextButton',
    'GhostIconButton',
    'GlassIconButton',
    'GlassIconButtonGroup',
    'ModeButton',
    '文本按钮',
    '幽灵图标按钮',
    '玻璃图标按钮',
    '玻璃图标按钮组',
    '模式按钮',
  ],
  preview: () => <ButtonDemo />,
} satisfies ComponentDefinition
