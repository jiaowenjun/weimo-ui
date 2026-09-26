import { Hash, X } from 'lucide-react'

import { Chip } from 'weimo-ui-core/components/chip'
import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'

function ChipMaterialDemo() {
  return (
    <GlassPreviewCard label="胶囊材质">
      <div aria-label="Chip 材质预览" className="capsule-material-row">
        <Chip content="普通胶囊" prefix={<Hash aria-hidden="true" />} variant="default" />
        <Chip content="磨砂胶囊" prefix={<Hash aria-hidden="true" />} variant="glass" />
      </div>
    </GlassPreviewCard>
  )
}

function ChipSizeDemo() {
  return (
    <ComponentPreviewCard align="center" label="胶囊尺寸">
      <div aria-label="Chip 尺寸预览" className="text-button-preview">
        <Chip content="小号" textSize="sm" />
        <Chip content="基础" textSize="base" />
        <Chip content="大号" textSize="lg" />
      </div>
    </ComponentPreviewCard>
  )
}

function ChipSlotDemo() {
  return (
    <ComponentPreviewCard align="center" label="胶囊插槽">
      <div aria-label="Chip 前后缀预览" className="text-button-preview">
        <Chip content="写作/日记" prefix={<Hash aria-hidden="true" />} />
        <Chip content="可关闭标签" suffix={<X aria-hidden="true" />} variant="glass" />
      </div>
    </ComponentPreviewCard>
  )
}

function CapsuleDemo() {
  return (
    <>
      <ChipMaterialDemo />
      <ChipSizeDemo />
      <ChipSlotDemo />
    </>
  )
}

export const capsuleDefinition = {
  id: 'capsule',
  summary: '非交互胶囊的材质、字号与前后缀插槽',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'Chip',
    '胶囊',
    '标签胶囊',
    '胶囊材质',
    '胶囊尺寸',
    '胶囊前缀',
    '胶囊后缀',
  ],
  preview: () => <CapsuleDemo />,
} satisfies ComponentDefinition
