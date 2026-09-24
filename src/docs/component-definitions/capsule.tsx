import { useLayoutEffect, useRef, useState } from 'react'
import { Hash, X } from 'lucide-react'

import { Chip } from '../../components/chip'
import { ChipButton } from '../../components/chip-button'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import { GhostIconButton } from '../../components/ghost-icon-button'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'
import { PreviewToggle, SurfaceBorderToggle } from '../preview-toggle'

function ChipTextSizeDemo() {
  return (
    <ComponentPreviewCard align="center" label="胶囊字号">
      <div aria-label="Chip 字号预览">
        <Chip content="小字号" textSize="sm" />
        <Chip content="基础字号" textSize="base" />
        <Chip content="标题字号" textSize="lg" />
      </div>
    </ComponentPreviewCard>
  )
}

function GlassChipDemo() {
  const [bordered, setBordered] = useState(true)

  return (
    <GlassPreviewCard
      action={
        <SurfaceBorderToggle bordered={bordered} onBorderedChange={setBordered} />
      }
      label="玻璃态胶囊"
    >
      <div className="icon-preview__row" aria-label="Chip 玻璃态字号预览">
        <Chip bordered={bordered} content="小字号" textSize="sm" variant="glass" />
        <Chip bordered={bordered} content="基础字号" textSize="base" variant="glass" />
        <Chip bordered={bordered} content="标题字号" textSize="lg" variant="glass" />
      </div>
    </GlassPreviewCard>
  )
}

function PrefixChipDemo() {
  return (
    <ComponentPreviewCard align="center" label="前缀胶囊">
      <div aria-label="Chip 前缀预览">
        <Chip content="写作/日记" prefix={<Hash aria-hidden="true" />} variant="default" />
        <Chip content="写作/日记" prefix={<Hash aria-hidden="true" />} variant="glass" />
      </div>
    </ComponentPreviewCard>
  )
}

function SuffixChipDemo() {
  return (
    <ComponentPreviewCard align="center" label="后缀胶囊">
      <div aria-label="Chip 后缀预览">
        <Chip
          content="可关闭标签"
          suffix={
            <GhostIconButton aria-label="移除标签" size="xs">
              <X aria-hidden="true" />
            </GhostIconButton>
          }
          variant="default"
        />
        <Chip
          content="可关闭标签"
          suffix={
            <GhostIconButton aria-label="移除标签" size="xs">
              <X aria-hidden="true" />
            </GhostIconButton>
          }
          variant="glass"
        />
      </div>
    </ComponentPreviewCard>
  )
}

function ChipButtonDemo() {
  return (
    <ComponentPreviewCard align="center" label="胶囊按钮">
      <div aria-label="ChipButton 默认态与玻璃态预览">
        <ChipButton state="default">默认态</ChipButton>
        <ChipButton state="glass">玻璃态</ChipButton>
      </div>
    </ComponentPreviewCard>
  )
}

function StateToggleChipButtonDemo() {
  const [state, setState] = useState<'default' | 'glass'>('default')

  return (
    <ComponentPreviewCard
      action={
        <PreviewToggle
          ariaLabel="切换玻璃态"
          checked={state === 'glass'}
          label={state === 'glass' ? '玻璃态' : '默认态'}
          onCheckedChange={(checked) => setState(checked ? 'glass' : 'default')}
        />
      }
      align="center"
      label="状态切换胶囊"
    >
      <div aria-label="ChipButton 状态预览">
        <ChipButton state={state}>写作/日记</ChipButton>
      </div>
    </ComponentPreviewCard>
  )
}

function WidthToggleChipButtonDemo() {
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
    <ComponentPreviewCard
      action={
        <PreviewToggle
          ariaLabel="切换长标签"
          checked={widthMode === 'long'}
          label={widthMode === 'long' ? '长标签' : '短标签'}
          onCheckedChange={(checked) => setWidthMode(checked ? 'long' : 'short')}
        />
      }
      align="center"
      label="长度切换胶囊"
    >
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
      <PrefixChipDemo />
      <SuffixChipDemo />
      <ChipButtonDemo />
      <StateToggleChipButtonDemo />
      <WidthToggleChipButtonDemo />
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
    '状态切换胶囊',
    '长度切换胶囊',
    '前缀胶囊',
    '后缀胶囊',
    '胶囊按钮',
  ],
  preview: () => <CapsuleDemo />,
} satisfies ComponentDefinition
