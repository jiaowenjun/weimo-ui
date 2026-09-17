import { useState } from 'react'
import { Menu } from 'lucide-react'

import { GlassIconButton } from '../../components/glass-icon-button'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

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
  )
}

export const glassIconButtonDefinition = {
  id: 'glass-icon-button',
  summary: '玻璃质感圆形图标按钮，自动感知背景并调整字色与 hover 反馈',
  status: 'Ready',
  props: [
    {
      name: '...buttonProps',
      type: 'ComponentPropsWithoutRef<"button">',
      defaultValue: '-',
    },
    { name: 'size', type: "'default' | 'sm'", defaultValue: 'default' },
    { name: 'disabled', type: 'boolean', defaultValue: 'false' },
  ],
  preview: () => <GlassIconButtonPreview />,
} satisfies ComponentDefinition
