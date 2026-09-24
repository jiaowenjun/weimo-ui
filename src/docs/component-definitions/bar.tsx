import { Check, Plus, Search, X } from 'lucide-react'

import { BottomBar } from '../../components/bottom-bar'
import { Chip } from '../../components/chip'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import { FloatBar } from '../../components/float-bar'
import { GlassIconButton } from '../../components/glass-icon-button'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'

function BottomBarDemo() {
  return (
    <ComponentPreviewCard label="底部操作栏">
      <div className="internal-bottom-preview" aria-label="BottomBar preview">
        <div className="internal-bottom-preview__surface">
          <p>正文区域</p>
          <BottomBar
            aria-label="底部操作栏预览"
            leftSlot={
              <Chip bordered={false} content="2 个标签待保存" variant="glass" />
            }
            rightSlot={
              <span className="internal-preview__actions">
                <GlassIconButton aria-label="新增" size="sm">
                  <Plus />
                </GlassIconButton>
                <GlassIconButton aria-label="保存" size="sm">
                  <Check />
                </GlassIconButton>
              </span>
            }
          />
        </div>
      </div>
    </ComponentPreviewCard>
  )
}

function FloatBarDemo() {
  return (
    <GlassPreviewCard label="浮动工具栏">
      <FloatBar
        aria-label="浮动工具栏预览"
        className="internal-float-preview"
        leftSlot={
          <Chip bordered={false} content="浮动栏" variant="glass" />
        }
        rightSlot={
          <span className="internal-preview__actions">
            <GlassIconButton aria-label="搜索" size="sm">
              <Search />
            </GlassIconButton>
            <GlassIconButton aria-label="确认" size="sm">
              <Check />
            </GlassIconButton>
            <GlassIconButton aria-label="关闭" size="sm">
              <X />
            </GlassIconButton>
          </span>
        }
      />
    </GlassPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function BarDemo() {
  return (
    <>
      <FloatBarDemo />
      <BottomBarDemo />
    </>
  )
}

export const barDefinition = {
  id: 'bar',
  summary: '浮动工具栏与底部操作栏总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'BottomBar',
    'FloatBar',
    '底部操作栏',
    '浮动工具栏',
  ],
  preview: () => <BarDemo />,
} satisfies ComponentDefinition
