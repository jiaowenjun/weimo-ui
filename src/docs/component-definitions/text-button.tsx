import { useState } from 'react'

import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

function TextButtonPreview() {
  const [disabled, setDisabled] = useState(false)

  return (
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
  )
}

export const textButtonDefinition = {
  id: 'text-button',
  summary: '文本操作按钮，封装普通边框、hover/active 与 disabled token',
  status: 'Ready',
  props: [
    { name: '...buttonProps', type: 'ComponentPropsWithoutRef<"button">', defaultValue: '-' },
    { name: 'disabled', type: 'boolean', defaultValue: 'false' },
  ],
  preview: () => <TextButtonPreview />,
} satisfies ComponentDefinition
