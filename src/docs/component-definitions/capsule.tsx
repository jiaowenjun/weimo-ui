import { useLayoutEffect, useRef, useState } from 'react'
import { Hash, X } from 'lucide-react'

import { Chip } from '../../components/chip'
import { ChipButton } from '../../components/chip-button'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import { TextButton } from '../../components/text-button'
import type { ComponentDefinition } from '../component-docs'

function ChipTextSizeDemo() {
  return (
    <ComponentPreviewCard label="胶囊字号">
      <div className="internal-chip-preview">
        <div className="internal-chip-preview__row" aria-label="Chip 字号预览">
          <Chip content="小字号" textSize="sm" />
          <Chip content="基础字号" textSize="base" />
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

function GlassChipDemo() {
  return (
    <ComponentPreviewCard label="玻璃态胶囊">
      <div className="internal-chip-preview">
        <div className="internal-chip-preview__row" aria-label="Chip 玻璃态预览">
          <Chip content="玻璃态" prefix={<Hash aria-hidden="true" />} variant="glass" />
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

function ChipDemo() {
  return (
    <ComponentPreviewCard label="标签胶囊">
      <div className="internal-chip-preview">
        <div className="internal-chip-preview__row" aria-label="Chip 默认变体预览">
          <Chip content="写作/日记" prefix={<Hash aria-hidden="true" />} variant="default" />
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

function ClosableChipDemo() {
  return (
    <ComponentPreviewCard label="可关闭胶囊">
      <div className="internal-chip-preview">
        <div className="internal-chip-preview__row" aria-label="Chip 可关闭预览">
          <Chip
            content="可关闭标签"
            prefix={<Hash aria-hidden="true" />}
            suffix={
              <button className="internal-chip-preview__action" type="button">
                <X aria-hidden="true" />
              </button>
            }
            variant="glass"
          />
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

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
    <ComponentPreviewCard label="状态标签胶囊">
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
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function CapsuleDemo() {
  return (
    <>
      <ChipTextSizeDemo />
      <GlassChipDemo />
      <ChipDemo />
      <ClosableChipDemo />
      <ChipButtonDemo />
    </>
  )
}

export const capsuleDefinition = {
  id: 'capsule',
  summary: '标签胶囊与状态化标签胶囊的胶囊总览',
  status: 'Preview',
  frame: 'plain',
  searchAliases: [
    'Chip',
    'ChipButton',
    '标签胶囊',
    '状态标签胶囊',
  ],
  preview: () => <CapsuleDemo />,
} satisfies ComponentDefinition
