import { useState } from 'react'
import { Ellipsis, Menu, Share } from 'lucide-react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import { GhostIconButton } from '../../components/ghost-icon-button'
import { FrostedIconButton } from '../../components/frosted-icon-button'
import {
  FrostedIconButtonGroup,
  FrostedIconGroupButton,
} from '../../components/frosted-icon-button-group'
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

function FrostedIconButtonPreviewGroup({ disabled }: { disabled: boolean }) {
  return (
    <div className="icon-preview__row" aria-label="FrostedIconButton 磨砂外观预览">
      <FrostedIconButton aria-label="菜单" disabled={disabled}>
        <Menu />
      </FrostedIconButton>
      <FrostedIconButton aria-label="小号菜单" disabled={disabled} size="sm">
        <Menu />
      </FrostedIconButton>
      <FrostedIconButton aria-label="带边框菜单" bordered disabled={disabled}>
        <Menu />
      </FrostedIconButton>
      <FrostedIconButton aria-label="小号带边框菜单" bordered disabled={disabled} size="sm">
        <Menu />
      </FrostedIconButton>
    </div>
  )
}

function FrostedIconButtonPreview() {
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
      label="磨砂图标按钮"
    >
      <FrostedIconButtonPreviewGroup disabled={disabled} />
    </GlassPreviewCard>
  )
}

function FrostedIconButtonGroupPreviewGroup({ disabled }: { disabled: boolean }) {
  return (
    <div className="icon-preview__row" aria-label="FrostedIconButtonGroup 磨砂按钮组预览">
      <FrostedIconButtonGroup aria-label="磨砂图标按钮组">
        <FrostedIconGroupButton aria-label="分享" disabled={disabled}>
          <Share />
        </FrostedIconGroupButton>
        <FrostedIconGroupButton aria-label="更多" disabled={disabled}>
          <Ellipsis />
        </FrostedIconGroupButton>
      </FrostedIconButtonGroup>
      <FrostedIconButtonGroup aria-label="小号磨砂图标按钮组">
        <FrostedIconGroupButton aria-label="小号分享" disabled={disabled} size="sm">
          <Share />
        </FrostedIconGroupButton>
        <FrostedIconGroupButton aria-label="小号更多" disabled={disabled} size="sm">
          <Ellipsis />
        </FrostedIconGroupButton>
      </FrostedIconButtonGroup>
      <FrostedIconButtonGroup aria-label="带边框磨砂图标按钮组" bordered>
        <FrostedIconGroupButton aria-label="带边框分享" disabled={disabled}>
          <Share />
        </FrostedIconGroupButton>
        <FrostedIconGroupButton aria-label="带边框更多" disabled={disabled}>
          <Ellipsis />
        </FrostedIconGroupButton>
      </FrostedIconButtonGroup>
    </div>
  )
}

function FrostedIconButtonGroupPreview() {
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
      label="磨砂图标按钮组"
    >
      <FrostedIconButtonGroupPreviewGroup disabled={disabled} />
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
      <FrostedIconButtonPreview />
      <FrostedIconButtonGroupPreview />
      <ModeButtonDemo />
    </>
  )
}

export const buttonDefinition = {
  id: 'button',
  summary: '文本按钮、幽灵/磨砂图标按钮、磨砂图标按钮组与模式按钮的按钮总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'TextButton',
    'GhostIconButton',
    'FrostedIconButton',
    'FrostedIconButtonGroup',
    'ModeButton',
    '文本按钮',
    '幽灵图标按钮',
    '磨砂图标按钮',
    '磨砂图标按钮组',
    '模式按钮',
  ],
  preview: () => <ButtonDemo />,
} satisfies ComponentDefinition
