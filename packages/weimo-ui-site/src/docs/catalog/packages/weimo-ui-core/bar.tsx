import { Check, Plus, Search, X } from 'lucide-react'

import { BottomBar } from 'weimo-ui-core/components/bottom-bar'
import { CardSurface } from 'weimo-ui-core/components/card-surface'
import { CapsuleButton } from 'weimo-ui-core/components/capsule-button'
import { GlassLabel } from 'weimo-ui-core/components/glass-label'
import { LiquidGlassSurface } from 'weimo-ui-core/components/liquid-glass'
import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { FloatBar } from 'weimo-ui-core/components/float-bar'
import { FrostedIconButton } from 'weimo-ui-core/components/frosted-icon-button'
import type { ComponentDefinition } from '../../component-docs'
import { GlassPreviewCard } from '../../../previews/glass-preview-card'
import { LiquidGlassTile } from '../../../previews/liquid-glass-tile'

// 玻璃标签:液态玻璃材质的标题文字胶囊(全胶囊圆角),文字色随画布 tone
// 自适应;sm 档用于工具栏栏位标题,lg 档(粗体)用于页面标题。
function GlassLabelDemo() {
  return (
    <GlassPreviewCard label="玻璃标签">
      <div aria-label="玻璃标签预览" className="liquid-glass-label-preview">
        <GlassLabel size="sm">浮动栏</GlassLabel>
        <GlassLabel size="lg">页面标题</GlassLabel>
      </div>
    </GlassPreviewCard>
  )
}

function BottomBarDemo() {
  return (
    <ComponentPreviewCard label="底部操作栏">
      <div className="internal-bottom-preview" aria-label="BottomBar preview">
        <CardSurface className="internal-bottom-preview__surface">
          <p>正文区域</p>
          <BottomBar
            aria-label="底部操作栏预览"
            leftSlot={
              <CapsuleButton
                aria-label="保存 2 个标签"
                onClick={() => {}}
                prefix={null}
                state="frosted"
              >
                2 个标签待保存
              </CapsuleButton>
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
// 图标钮/按钮组复用按钮页 .liquid-glass-icon-* 尺寸档,标题文字用 GlassLabel 组件,
// 图标与文字色随画布 tone 自适应(图标色由容器持有 data-background-tone)。
function FloatBarDemo() {
  return (
    <GlassPreviewCard label="浮动工具栏">
      <LiquidGlassTile className="liquid-glass-toolbar-preview">
        <FloatBar
          aria-label="浮动工具栏预览"
          className="internal-float-preview"
          leftSlot={<GlassLabel size="sm">浮动栏</GlassLabel>}
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
                    <span className="liquid-glass-icon-button-group__item">
                      <Check />
                    </span>
                    <span className="liquid-glass-icon-button-group__item">
                      <X />
                    </span>
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
function BarDemo() {
  return (
    <>
      <GlassLabelDemo />
      <FloatBarDemo />
      <BottomBarDemo />
    </>
  )
}

export const barDefinition = {
  id: 'bar',
  summary: '玻璃标签与浮动/底部工具栏总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: [
    'BottomBar',
    'FloatBar',
    'GlassLabel',
    '玻璃标签',
    '底部操作栏',
    '浮动工具栏',
  ],
  preview: () => <BarDemo />,
} satisfies ComponentDefinition
