import { useState } from 'react'
import { RotateCcw } from 'lucide-react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import { GhostIconButton } from '../../components/ghost-icon-button'
import { Slider } from '../../components/slider'
import type { ComponentDefinition } from '../component-docs'

const SLIDER_INITIAL_VALUE = 50

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function SliderDemo() {
  const [value, setValue] = useState(SLIDER_INITIAL_VALUE)

  return (
    <ComponentPreviewCard
      action={
        <GhostIconButton
          aria-label="复位滑块"
          onClick={() => setValue(SLIDER_INITIAL_VALUE)}
          size="sm"
        >
          <RotateCcw aria-hidden="true" />
        </GhostIconButton>
      }
      label="滑块"
    >
      <div className="slider-preview" aria-label="Slider 滑块预览">
        <Slider
          ariaLabel="数值"
          max={100}
          min={0}
          onValueChange={setValue}
          value={value}
        />
        <span aria-hidden="true" className="slider-preview__value">
          {value}
        </span>
      </div>
    </ComponentPreviewCard>
  )
}

export const sliderDefinition = {
  id: 'slider',
  summary: '透明原生 range 交互层 + 单一 --fill 驱动自绘轨道的受控滑块',
  status: 'Ready',
  frame: 'plain',
  searchAliases: ['Slider', 'range'],
  preview: () => <SliderDemo />,
} satisfies ComponentDefinition
