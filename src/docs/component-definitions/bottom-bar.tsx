import { Check, Plus } from 'lucide-react'

import { BottomBar } from '../../components/bottom-bar'
import { GlassIconButton } from '../../components/glass-icon-button'
import { GhostIconButton } from '../../components/ghost-icon-button'
import type { ComponentDefinition } from '../component-docs'

function BottomBarDemo() {
  return (
    <div className="internal-bottom-preview" aria-label="BottomBar preview">
      <div className="internal-bottom-preview__surface">
        <p>正文区域</p>
        <BottomBar
          aria-label="底部操作栏预览"
          leftSlot={<span className="internal-preview__text">2 个标签待保存</span>}
          rightSlot={
            <span className="internal-preview__actions">
              <GhostIconButton aria-label="新增" size="sm">
                <Plus />
              </GhostIconButton>
              <GlassIconButton aria-label="保存" size="sm">
                <Check />
              </GlassIconButton>
            </span>
          }
        />
      </div>
    </div>
  )
}

export const bottomBarDefinition = {
  id: 'bottom-bar',
  summary: '内部底部浮动操作栏，复用 FloatBar 的 slot 布局',
  status: 'Ready',
  props: [
    { name: 'leftSlot', type: 'ReactNode', defaultValue: '-' },
    { name: 'rightSlot', type: 'ReactNode', defaultValue: '-' },
    { name: '...divProps', type: 'ComponentPropsWithoutRef<"div">', defaultValue: '-' },
  ],
  preview: () => <BottomBarDemo />,
} satisfies ComponentDefinition
