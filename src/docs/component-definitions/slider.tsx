import { useState } from 'react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import { Slider } from '../../components/slider'
import type { ComponentDefinition } from '../component-docs'
import { PreviewToggle } from '../preview-toggle'

const SLIDER_INITIAL_VALUE = 50

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function SliderDemo() {
  const [value, setValue] = useState(SLIDER_INITIAL_VALUE)
  const [reset, setReset] = useState(false)

  return (
    <ComponentPreviewCard
      action={
        <PreviewToggle
          ariaLabel="滑块复位"
          checked={reset}
          label={reset ? '已复位' : '自定义'}
          onCheckedChange={setReset}
        />
      }
      label="滑块"
    >
      <div className="slider-preview" aria-label="Slider 滑块预览">
        <Slider
          ariaLabel="数值"
          max={100}
          min={0}
          onValueChange={(next) => {
            setReset(false)
            setValue(next)
          }}
          value={reset ? SLIDER_INITIAL_VALUE : value}
        />
        <span aria-hidden="true" className="slider-preview__value">
          {reset ? SLIDER_INITIAL_VALUE : value}
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
