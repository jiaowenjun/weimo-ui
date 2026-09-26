import { useLayoutEffect, useRef, useState } from 'react'
import { Hash, Plus, X } from 'lucide-react'

import { ChipButton } from '../../components/chip-button'
import { LiquidGlassSurface } from '../../components/liquid-glass'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'
import { LiquidGlassTile } from '../liquid-glass-tile'
import { PreviewToggle } from '../preview-toggle'

function ChipTextSizeDemo() {
  return (
    <ComponentPreviewCard align="center" label="胶囊字号">
      <div className="text-button-preview" aria-label="ChipButton 字号预览">
        <ChipButton prefix="" textSize="sm">小字号</ChipButton>
        <ChipButton prefix="" textSize="base">基础字号</ChipButton>
        <ChipButton prefix="" textSize="lg">标题字号</ChipButton>
      </div>
    </ComponentPreviewCard>
  )
}

function GlassChipDemo() {
  return (
    <GlassPreviewCard label="磨砂态胶囊">
      <div className="icon-preview__row" aria-label="ChipButton 磨砂态字号预览">
        <ChipButton prefix="" state="glass" textSize="sm">小字号</ChipButton>
        <ChipButton prefix="" state="glass" textSize="base">基础字号</ChipButton>
        <ChipButton prefix="" state="glass" textSize="lg">标题字号</ChipButton>
      </div>
    </GlassPreviewCard>
  )
}

// noop 点击透传给玻璃层以启用库的悬停辉光与按压缩放反馈(同液态玻璃图标按钮)。
function noopLiquidGlassChipClick() {}

// 液态玻璃胶囊:整体按钮形态,参考液态玻璃图标按钮组的「整体按钮、内部
// 独立小部件」结构——胶囊盒本身是原生 button,玻璃层与三档字号标签是按钮
// 内部的小部件;与磨砂态胶囊同节奏(玻璃层绝对居中于定尺寸按钮盒,文字色
// 随画布 tone 自适应;液态自带渐变边缘,无边框开关)。
// eslint-disable-next-line react-refresh/only-export-components
function LiquidGlassChipDemo() {
  return (
    <GlassPreviewCard label="液态玻璃胶囊">
      <LiquidGlassTile className="liquid-glass-chip-preview">
        <div aria-label="液态玻璃胶囊字号预览" className="liquid-glass-chip-row">
          <button className="liquid-glass-chip liquid-glass-chip--sm" type="button">
            <LiquidGlassSurface
              cornerRadius={999}
              onClick={noopLiquidGlassChipClick}
              padding="6px 10px"
            >
              <span className="liquid-glass-chip__label liquid-glass-chip__label--sm">小字号</span>
            </LiquidGlassSurface>
          </button>
          <button className="liquid-glass-chip liquid-glass-chip--base" type="button">
            <LiquidGlassSurface
              cornerRadius={999}
              onClick={noopLiquidGlassChipClick}
              padding="6px 10px"
            >
              <span className="liquid-glass-chip__label liquid-glass-chip__label--base">基础字号</span>
            </LiquidGlassSurface>
          </button>
          <button className="liquid-glass-chip liquid-glass-chip--lg" type="button">
            <LiquidGlassSurface
              cornerRadius={999}
              onClick={noopLiquidGlassChipClick}
              padding="6px 10px"
            >
              <span className="liquid-glass-chip__label liquid-glass-chip__label--lg">标题字号</span>
            </LiquidGlassSurface>
          </button>
        </div>
      </LiquidGlassTile>
    </GlassPreviewCard>
  )
}

function PrefixChipDemo() {
  return (
    <ComponentPreviewCard align="center" label="前缀胶囊">
      <div className="text-button-preview" aria-label="ChipButton 前缀预览">
        <ChipButton prefix={<Hash aria-hidden="true" />}>写作/日记</ChipButton>
        <ChipButton prefix={<Plus aria-hidden="true" />} state="glass">新增标签</ChipButton>
      </div>
    </ComponentPreviewCard>
  )
}

function SuffixChipDemo() {
  return (
    <ComponentPreviewCard align="center" label="后缀胶囊">
      <div className="text-button-preview" aria-label="ChipButton 后缀预览">
        <ChipButton prefix="" suffix={<X aria-hidden="true" />}>可关闭标签</ChipButton>
        <ChipButton prefix="" state="glass" suffix={<X aria-hidden="true" />}>可关闭标签</ChipButton>
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
          ariaLabel="切换磨砂态"
          checked={state === 'glass'}
          label={state === 'glass' ? '磨砂态' : '默认态'}
          onCheckedChange={(checked) => setState(checked ? 'glass' : 'default')}
        />
      }
      align="center"
      label="状态切换胶囊"
    >
      <div aria-label="ChipButton 状态预览">
        <ChipButton prefix={<Hash aria-hidden="true" />} state={state}>写作/日记</ChipButton>
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
          <ChipButton prefix={<Hash aria-hidden="true" />} state="default">{widthPreviewLabel}</ChipButton>
        </span>
        <span className="chip-button-preview__width-measure" aria-hidden="true">
          <span ref={widthMeasureRef}>
            <ChipButton prefix={<Hash aria-hidden="true" />} state="default">{widthPreviewLabel}</ChipButton>
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
      <LiquidGlassChipDemo />
      <PrefixChipDemo />
      <SuffixChipDemo />
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
    '液态玻璃胶囊',
  ],
  preview: () => <CapsuleDemo />,
} satisfies ComponentDefinition
