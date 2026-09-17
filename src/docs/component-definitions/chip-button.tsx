import { useLayoutEffect, useRef, useState } from 'react'

import { ChipButton } from '../../components/chip-button'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

function ChipButtonDemo() {
  const [state, setState] = useState<'default' | 'glass'>('default')
  const [widthMode, setWidthMode] = useState<'short' | 'long'>('short')
  const widthMeasureRef = useRef<HTMLSpanElement | null>(null)
  const [widthPreviewSize, setWidthPreviewSize] = useState<number | null>(null)
  const widthPreviewLabel = widthMode === 'short' ? '短标签' : '观察宽度变化的长标签'
  const widthPreviewStyle = widthPreviewSize === null
    ? undefined
    : { inlineSize: `${widthPreviewSize}px` }

  useLayoutEffect(() => {
    const element = widthMeasureRef.current
    if (!element) return

    const nextSize = element.getBoundingClientRect().width
    setWidthPreviewSize((currentSize) =>
      currentSize === nextSize ? currentSize : nextSize,
    )
  }, [widthPreviewLabel])

  return (
    <div className="chip-button-preview">
      <div className="chip-button-preview__panel">
        <div className="chip-button-preview__row" aria-label="ChipButton 状态预览">
          <ChipButton state={state}>写作/日记</ChipButton>
          <ChipButton state="default">默认态</ChipButton>
          <ChipButton state="glass">玻璃态</ChipButton>
        </div>
        <div
          className="chip-button-preview__width-example"
          aria-label="ChipButton 宽度变化预览"
        >
          <span
            className="chip-button-preview__width-slot"
            style={widthPreviewStyle}
          >
            <ChipButton state="default">{widthPreviewLabel}</ChipButton>
          </span>
          <span className="chip-button-preview__width-measure" aria-hidden="true">
            <span ref={widthMeasureRef}>
              <ChipButton state="default">{widthPreviewLabel}</ChipButton>
            </span>
          </span>
        </div>
        <div className="chip-button-preview__controls">
          <TextButton
            onClick={() =>
              setState((currentState) =>
                currentState === 'default' ? 'glass' : 'default',
              )
            }
          >
            {state === 'default' ? '切换到玻璃态' : '切换到默认态'}
          </TextButton>
          <TextButton
            onClick={() =>
              setWidthMode((currentMode) =>
                currentMode === 'short' ? 'long' : 'short',
              )
            }
          >
            {widthMode === 'short' ? '切换到长标签' : '切换到短标签'}
          </TextButton>
        </div>
      </div>
    </div>
  )
}

export const chipButtonDefinition = {
  id: 'chip-button',
  summary: '内部状态化标签胶囊，可在默认态和玻璃态之间平滑过渡',
  status: 'Preview',
  preview: () => <ChipButtonDemo />,
} satisfies ComponentDefinition
