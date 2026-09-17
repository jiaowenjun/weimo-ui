import { useState } from 'react'
import { Menu } from 'lucide-react'

import { GhostIconButton } from '../../components/ghost-icon-button'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

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
          <span className="icon-preview__scene-title">普通背景</span>
          <GhostIconButtonPreviewGroup disabled={disabled} />
        </section>
      </div>
    </div>
  )
}

export const ghostIconButtonDefinition = {
  id: 'ghost-icon-button',
  summary: '透明圆形图标按钮，使用共享 hover/active 反馈 token',
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
  preview: () => <GhostIconButtonPreview />,
} satisfies ComponentDefinition
