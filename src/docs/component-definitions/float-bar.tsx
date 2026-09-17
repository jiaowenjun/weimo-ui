import { Check, Search, X } from 'lucide-react'

import { FloatBar } from '../../components/float-bar'
import { GlassIconButton } from '../../components/glass-icon-button'
import { GhostIconButton } from '../../components/ghost-icon-button'
import type { ComponentDefinition } from '../component-docs'

function FloatBarDemo() {
  return (
    <div className="internal-float-preview" aria-label="FloatBar preview">
      <FloatBar
        aria-label="浮动工具栏预览"
        leftSlot={<span className="internal-preview__text"># 写作</span>}
        centerSlot={<span className="internal-preview__title">编辑标签</span>}
        rightSlot={
          <span className="internal-preview__actions">
            <GhostIconButton aria-label="搜索" size="sm">
              <Search />
            </GhostIconButton>
            <GlassIconButton aria-label="确认" size="sm">
              <Check />
            </GlassIconButton>
            <GhostIconButton aria-label="关闭" size="sm">
              <X />
            </GhostIconButton>
          </span>
        }
      />
    </div>
  )
}

export const floatBarDefinition = {
  id: 'float-bar',
  summary: '内部浮动工具栏布局，提供左中右 slot 和默认 toolbar 语义',
  status: 'Ready',
  preview: () => <FloatBarDemo />,
} satisfies ComponentDefinition
