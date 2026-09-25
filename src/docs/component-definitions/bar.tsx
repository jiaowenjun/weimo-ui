import { Check, Plus, Search, X } from 'lucide-react'

import { BottomBar } from '../../components/bottom-bar'
import { CardSurface } from '../../components/card-surface'
import { Chip } from '../../components/chip'
import { LiquidGlassSurface } from '../../components/liquid-glass'
import { ComponentPreviewCard } from '../../components/component-preview-card'
import { FloatBar } from '../../components/float-bar'
import { FrostedIconButton } from '../../components/frosted-icon-button'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'
import { LiquidGlassTile } from '../liquid-glass-tile'

function BottomBarDemo() {
  return (
    <ComponentPreviewCard label="底部操作栏">
      <div className="internal-bottom-preview" aria-label="BottomBar preview">
        <CardSurface className="internal-bottom-preview__surface">
          <p>正文区域</p>
          <BottomBar
            aria-label="底部操作栏预览"
            leftSlot={
              <Chip bordered={false} content="2 个标签待保存" variant="glass" />
            }
            rightSlot={
              <span className="internal-preview__actions">
                <FrostedIconButton aria-label="新增" size="sm">
                  <Plus />
                </FrostedIconButton>
                <FrostedIconButton aria-label="保存" size="sm">
                  <Check />
                </FrostedIconButton>
              </span>
            }
          />
        </CardSurface>
      </div>
    </ComponentPreviewCard>
  )
}

// 浮动工具栏示例改用液态玻璃按钮与液态玻璃胶囊文字(底部/顶部工具栏保持磨砂):
// 图标钮/按钮组复用按钮页 .liquid-glass-icon-* 尺寸档,胶囊复用 .liquid-glass-chip 档,
// 图标与文字色随画布 tone 自适应(容器持有 data-background-tone)。
// eslint-disable-next-line react-refresh/only-export-components
function FloatBarDemo() {
  return (
    <GlassPreviewCard label="浮动工具栏">
      <LiquidGlassTile className="liquid-glass-toolbar-preview">
        <FloatBar
          aria-label="浮动工具栏预览"
          className="internal-float-preview"
          leftSlot={
            <span className="liquid-glass-chip liquid-glass-chip--sm">
              <LiquidGlassSurface cornerRadius={999} padding="6px 10px">
                <span className="liquid-glass-chip__label liquid-glass-chip__label--sm">浮动栏</span>
              </LiquidGlassSurface>
            </span>
          }
          rightSlot={
            <span className="internal-preview__actions">
              <button
                aria-label="搜索"
                className="liquid-glass-icon-button liquid-glass-icon-button--sm"
                type="button"
              >
                <LiquidGlassSurface cornerRadius={999} onClick={() => {}} padding="6px">
                  <Search />
                </LiquidGlassSurface>
              </button>
              <button
                aria-label="确认与关闭"
                className="liquid-glass-icon-button-group liquid-glass-icon-button-group--sm"
                type="button"
              >
                <LiquidGlassSurface cornerRadius={999} onClick={() => {}} padding="6px">
                  <span className="liquid-glass-icon-button-group__row">
                    <Check />
                    <X />
                  </span>
                </LiquidGlassSurface>
              </button>
            </span>
          }
        />
      </LiquidGlassTile>
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
