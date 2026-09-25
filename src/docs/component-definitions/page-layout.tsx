import { Menu, Search } from 'lucide-react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import { LiquidGlassSurface } from '../../components/liquid-glass'
import { TopBar } from '../../components/top-bar'
import type { ComponentDefinition } from '../component-docs'
import { GlassPreviewCard } from '../glass-preview-card'
import { LiquidGlassTile } from '../liquid-glass-tile'

import { SideBarDrawerPreview } from './sidebar-preview'

function renderSideBarBlankPreview({
  tone = 'default',
}: { tone?: 'compact' | 'default' } = {}) {
  return (
    <div
      aria-label="空白常驻侧边栏预览"
      className="sidebar-preview__panel weimo-sidebar weimo-sidebar--normal"
      data-preview-tone={tone}
      role="img"
    >
      <strong className="sidebar-preview__title">常驻侧边栏</strong>
    </div>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
function SideBarDemo() {
  return (
    <>
      <ComponentPreviewCard label="常驻侧边栏">
        <div className="sidebar-preview">{renderSideBarBlankPreview()}</div>
      </ComponentPreviewCard>
      <ComponentPreviewCard label="抽屉侧边栏">
        <div className="sidebar-preview">
          <SideBarDrawerPreview />
        </div>
      </ComponentPreviewCard>
    </>
  )
}

function renderTopBarSidebarButton() {
  return (
    <button aria-label="打开侧边栏" className="liquid-glass-icon-button" type="button">
      <LiquidGlassSurface cornerRadius={999} onClick={() => {}} padding="12px">
        <Menu />
      </LiquidGlassSurface>
    </button>
  )
}

function renderTopBarSearchButton() {
  return (
    <button aria-label="搜索" className="liquid-glass-icon-button" type="button">
      <LiquidGlassSurface cornerRadius={999} onClick={() => {}} padding="12px">
        <Search />
      </LiquidGlassSurface>
    </button>
  )
}

// 顶部工具栏示例同样改走液态玻璃(标题胶囊/按钮与浮动工具栏同规则):
// 标题胶囊复用 .liquid-glass-chip lg 档,字重沿用 .top-bar-preview__title 的 600。
// eslint-disable-next-line react-refresh/only-export-components
function TopBarDemo() {
  return (
    <GlassPreviewCard label="顶部工具栏">
      <LiquidGlassTile className="liquid-glass-toolbar-preview">
        <TopBar
          className="top-bar-preview"
          leftSlot={
            <>
              {renderTopBarSidebarButton()}
              <span className="liquid-glass-chip liquid-glass-chip--lg">
                <LiquidGlassSurface cornerRadius={999} padding="6px 10px">
                  <span className="liquid-glass-chip__label liquid-glass-chip__label--lg top-bar-preview__title">
                    页面标题
                  </span>
                </LiquidGlassSurface>
              </span>
            </>
          }
          rightSlot={renderTopBarSearchButton()}
        />
      </LiquidGlassTile>
    </GlassPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function PageLayoutDemo() {
  return (
    <>
      <SideBarDemo />
      <TopBarDemo />
    </>
  )
}

export const pageLayoutDefinition = {
  id: 'page-layout',
  summary: '侧边栏与顶部工具栏总览',
  status: 'Ready',
  frame: 'plain',
  searchAliases: ['SideBar', 'TopBar', '侧边栏', '顶部工具栏'],
  preview: () => <PageLayoutDemo />,
} satisfies ComponentDefinition
