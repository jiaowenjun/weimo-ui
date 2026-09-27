import { Hash, X } from 'lucide-react'

import { Chip } from 'weimo-ui-core/components/chip'
import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { GhostIconButton } from 'weimo-ui-core/components/ghost-icon-button'
import type { ComponentDefinition } from '../../component-docs'
import { GlassPreviewCard } from '../../../components/glass-preview-card'

function ChipMaterialDemo() {
  return (
    <GlassPreviewCard label="胶囊材质">
      <div aria-label="Chip 材质预览" className="capsule-material-row">
        <Chip content="普通胶囊" prefix={<Hash aria-hidden="true" />} variant="default" />
        <Chip content="磨砂胶囊" prefix={<Hash aria-hidden="true" />} variant="frosted" />
        <Chip content="液态玻璃胶囊" prefix={<Hash aria-hidden="true" />} variant="liquid-glass" />
      </div>
    </GlassPreviewCard>
  )
}

function ChipSlotDemo() {
  return (
    <ComponentPreviewCard align="center" label="胶囊插槽">
      <div aria-label="Chip 前后缀预览" className="text-button-preview">
        <Chip content="写作/日记" prefix={<Hash aria-hidden="true" />} />
        <Chip
          content="可关闭标签"
          suffix={
            <GhostIconButton aria-label="移除标签" size="xs">
              <X aria-hidden="true" />
            </GhostIconButton>
          }
          variant="frosted"
        />
      </div>
    </ComponentPreviewCard>
  )
}

function CapsuleDemo() {
  return (
    <>
      <ChipMaterialDemo />
      <ChipSlotDemo />
    </>
  )
}

export const capsuleDefinition = {
  id: 'capsule',
  summary: '非交互胶囊的材质与前后缀插槽',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'Chip',
    '胶囊',
    '标签胶囊',
    '胶囊材质',
    '胶囊前缀',
    '胶囊后缀',
    '液态玻璃胶囊',
  ],
  preview: () => <CapsuleDemo />,
} satisfies ComponentDefinition
