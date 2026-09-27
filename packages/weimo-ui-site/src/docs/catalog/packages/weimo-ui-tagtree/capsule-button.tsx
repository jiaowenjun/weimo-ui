import { useLayoutEffect, useRef, useState } from 'react'
import { Hash, Plus, X } from 'lucide-react'

import { CapsuleButton } from 'weimo-ui-tagtree/components/capsule-button'
import { LiquidGlassSurface } from 'weimo-ui-core/components/liquid-glass'
import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import type { ComponentDefinition } from '../../component-docs'
import { GlassPreviewCard } from '../../../components/glass-preview-card'
import { LiquidGlassTile } from '../../../components/liquid-glass-tile'
import { PreviewToggle } from '../../../components/preview-toggle'

// noop 点击透传给玻璃层以启用库的悬停辉光与按压缩放反馈(同液态玻璃图标按钮)。
function noopLiquidGlassChipClick() {}

// 胶囊材质:普通(CapsuleButton 默认态)、磨砂(CapsuleButton 磨砂态)、液态玻璃
// (原生 button 包 LiquidGlassSurface,参考液态玻璃图标按钮组的「整体按钮、
// 内部独立小部件」结构)三例并列于灰度画布,拖动滑块可对比三种材质随背景
// 的表现。液态玻璃例文字长于 --sm 固定占位盒,用站点顶栏同款隐藏 sizer 撑
// 盒宽,玻璃层绝对居中覆盖其上,文字色随画布 tone 自适应。
function CapsuleMaterialDemo() {
  return (
    <GlassPreviewCard label="胶囊材质">
      <LiquidGlassTile className="liquid-glass-chip-preview">
        <div aria-label="胶囊材质预览" className="capsule-material-row">
          <CapsuleButton prefix={null} state="default">普通胶囊</CapsuleButton>
          <CapsuleButton prefix={null} state="glass">磨砂胶囊</CapsuleButton>
          <button className="liquid-glass-chip" type="button">
            <LiquidGlassSurface
              cornerRadius={999}
              onClick={noopLiquidGlassChipClick}
              padding="6px 10px"
            >
              <span className="liquid-glass-chip__label liquid-glass-chip__label--sm">液态玻璃胶囊</span>
            </LiquidGlassSurface>
            <span aria-hidden="true" className="capsule-material-row__liquid-sizer">
              液态玻璃胶囊
            </span>
          </button>
        </div>
      </LiquidGlassTile>
    </GlassPreviewCard>
  )
}

function PrefixChipDemo() {
  return (
    <ComponentPreviewCard align="center" label="胶囊前缀">
      <div className="text-button-preview" aria-label="CapsuleButton 前缀预览">
        <CapsuleButton prefix={<Hash aria-hidden="true" />}>写作/日记</CapsuleButton>
        <CapsuleButton prefix={<Plus aria-hidden="true" />} state="glass">新增标签</CapsuleButton>
      </div>
    </ComponentPreviewCard>
  )
}

function SuffixChipDemo() {
  return (
    <ComponentPreviewCard align="center" label="胶囊后缀">
      <div className="text-button-preview" aria-label="CapsuleButton 后缀预览">
        <CapsuleButton
          prefix={null}
          suffix={
            <span aria-hidden="true" className="icon-button icon-button--ghost icon-button--xs">
              <X aria-hidden="true" />
            </span>
          }
        >
          可关闭标签
        </CapsuleButton>
        <CapsuleButton
          prefix={null}
          state="glass"
          suffix={
            <span aria-hidden="true" className="icon-button icon-button--ghost icon-button--xs">
              <X aria-hidden="true" />
            </span>
          }
        >
          可关闭标签
        </CapsuleButton>
      </div>
    </ComponentPreviewCard>
  )
}

function StateToggleCapsuleButtonDemo() {
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
      label="胶囊状态切换"
    >
      <div aria-label="CapsuleButton 状态预览">
        <CapsuleButton state={state}>写作/日记</CapsuleButton>
      </div>
    </ComponentPreviewCard>
  )
}

function WidthToggleCapsuleButtonDemo() {
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
      label="胶囊长度切换"
    >
      <div
        className="capsule-button-preview__width-example"
        aria-label="CapsuleButton 宽度变化预览"
      >
        <span
          className="capsule-button-preview__width-slot"
          style={widthPreviewStyle}
        >
          <CapsuleButton state="default">{widthPreviewLabel}</CapsuleButton>
        </span>
        <span className="capsule-button-preview__width-measure" aria-hidden="true">
          <span ref={widthMeasureRef}>
            <CapsuleButton state="default">{widthPreviewLabel}</CapsuleButton>
          </span>
        </span>
      </div>
    </ComponentPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
function CapsuleButtonDemo() {
  return (
    <>
      <CapsuleMaterialDemo />
      <PrefixChipDemo />
      <SuffixChipDemo />
      <StateToggleCapsuleButtonDemo />
      <WidthToggleCapsuleButtonDemo />
    </>
  )
}

export const capsuleButtonDefinition = {
  id: 'capsule-button',
  summary: '按钮形态的交互胶囊：前后缀、磨砂状态与内容宽度切换',
  status: 'Preview',
  frame: 'plain',
  searchAliases: [
    'Chip',
    'CapsuleButton',
    // 旧名保留为搜索别名,便于按历史名称找到本页。
    'ChipButton',
    '按钮胶囊',
    '标签胶囊',
    '状态标签胶囊',
    '胶囊状态切换',
    '胶囊长度切换',
    '胶囊前缀',
    '胶囊后缀',
    '液态玻璃胶囊',
    '胶囊材质',
  ],
  preview: () => <CapsuleButtonDemo />,
} satisfies ComponentDefinition
