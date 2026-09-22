import { useState } from 'react'
import { Menu } from 'lucide-react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import { GhostIconButton } from '../../components/ghost-icon-button'
import { GlassIconButton } from '../../components/glass-icon-button'
import {
  ModeButton,
  type ModeButtonMode,
} from '../../components/mode-button'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

function TextButtonPreview() {
  const [disabled, setDisabled] = useState(false)

  return (
    <ComponentPreviewCard label="文本按钮">
      <div className="text-button-preview" aria-label="TextButton 状态预览">
        <TextButton
          aria-pressed={disabled}
          onClick={() => setDisabled((current) => !current)}
        >
          {disabled ? '启用按钮' : '禁用按钮'}
        </TextButton>
        <TextButton disabled={disabled}>跟随切换</TextButton>
        <TextButton disabled>禁用态</TextButton>
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
    <ComponentPreviewCard label="幽灵图标按钮">
      <div className="icon-preview-shell">
        <div className="icon-preview__controls">
          <TextButton
            aria-pressed={disabled}
            className="icon-preview__toggle"
            onClick={() => setDisabled((current) => !current)}
          >
            {disabled ? '启用按钮' : '禁用按钮'}
          </TextButton>
        </div>
        <div className="icon-preview icon-preview--plain" aria-label="GhostIconButton 普通背景预览">
          <section className="icon-preview__scene icon-preview__scene--plain">
            <GhostIconButtonPreviewGroup disabled={disabled} />
          </section>
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

const glassIconButtonPreviewScenes = [
  { id: 'light-solid' },
  { id: 'light-gradient' },
  { id: 'dark-solid' },
  { id: 'dark-gradient' },
] as const

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
    <ComponentPreviewCard label="玻璃图标按钮">
      <div className="icon-preview-shell">
        <div className="icon-preview__controls">
          <TextButton
            aria-pressed={disabled}
            className="icon-preview__toggle"
            onClick={() => setDisabled((current) => !current)}
          >
            {disabled ? '启用按钮' : '禁用按钮'}
          </TextButton>
        </div>
        <div className="icon-preview" aria-label="GlassIconButton 背景色预览">
          {glassIconButtonPreviewScenes.map((scene) => (
            <section
              className={`icon-preview__scene icon-preview__scene--${scene.id}`}
              key={scene.id}
            >
              <GlassIconButtonPreviewGroup disabled={disabled} />
            </section>
          ))}
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

function ModeButtonDemo() {
  const [mode, setMode] = useState<ModeButtonMode>('display')
  const editing = mode === 'edit'

  function toggleMode() {
    setMode((current) => (current === 'display' ? 'edit' : 'display'))
  }

  return (
    <ComponentPreviewCard label="模式按钮">
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
