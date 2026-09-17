import { Hash, X } from 'lucide-react'

import { Chip } from '../../components/chip'
import type { ComponentDefinition } from '../component-docs'

function ChipDemo() {
  return (
    <div className="internal-chip-preview">
      <div className="internal-chip-preview__row" aria-label="Chip 变体预览">
        <Chip content="写作/日记" prefix={<Hash aria-hidden="true" />} variant="default" />
        <Chip content="玻璃态" prefix={<Hash aria-hidden="true" />} variant="glass" />
      </div>
      <div className="internal-chip-preview__row" aria-label="Chip 字号预览">
        <Chip content="小字号" textSize="sm" />
        <Chip content="基础字号" textSize="base" />
      </div>
      <div className="internal-chip-preview__row" aria-label="Chip slot 预览">
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
  )
}

export const chipDefinition = {
  id: 'chip',
  summary: '内部共享标签胶囊，支持 prefix、content、suffix 三段 slot 和默认/玻璃两种外观',
  status: 'Preview',
  preview: () => <ChipDemo />,
} satisfies ComponentDefinition
