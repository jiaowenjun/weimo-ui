import { useState } from 'react'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { LabeledSwitch } from 'weimo-ui-core/components/labeled-switch'
import type { ComponentDefinition } from '../../component-docs'

// Docs definitions intentionally colocate preview components with exported page metadata.
function LabeledSwitchDemo() {
  const [enabled, setEnabled] = useState(true)

  return (
    <ComponentPreviewCard align="center" label="开关">
      <div aria-label="LabeledSwitch 状态预览">
        <LabeledSwitch
          ariaLabel="启用"
          checked={enabled}
          labelOff="已禁用"
          labelOn="已启用"
          onCheckedChange={setEnabled}
        />
      </div>
    </ComponentPreviewCard>
  )
}

export const labeledSwitchDefinition = {
  id: 'labeled-switch',
  summary: '开/关状态文案随选中态切换的 coss Switch 标题栏开关',
  status: 'Ready',
  frame: 'plain',
  searchAliases: ['LabeledSwitch', 'Switch', '开关', '切换'],
  preview: () => <LabeledSwitchDemo />,
} satisfies ComponentDefinition
