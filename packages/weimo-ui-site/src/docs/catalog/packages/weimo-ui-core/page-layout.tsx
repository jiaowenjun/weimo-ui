import { Menu, Search } from 'lucide-react'

import { ComponentPreviewCard } from 'weimo-ui-core/components/component-preview-card'
import { FrostedLabel } from 'weimo-ui-core/components/frosted-label'
import { FrostedIconButton } from 'weimo-ui-core/components/frosted-icon-button'
import { TopBar } from 'weimo-ui-core/components/top-bar'
import type { ComponentDefinition } from '../../component-docs'
import { GlassPreviewCard } from '../../../previews/glass-preview-card'

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
    <FrostedIconButton aria-label="打开侧边栏">
      <Menu />
    </FrostedIconButton>
  )
}

function renderTopBarSearchButton() {
  return (
    <FrostedIconButton aria-label="搜索">
      <Search />
    </FrostedIconButton>
  )
}

// 顶部工具栏示例:标题胶囊与图标钮均为磨砂材质(与浮动/底部工具栏同
// 规则,图标钮用默认尺寸档),组件各自采样画布 tone 自适应。
function TopBarDemo() {
  return (
    <GlassPreviewCard label="顶部工具栏">
      <div className="frosted-toolbar-preview">
        <TopBar
          className="top-bar-preview"
          leftSlot={
            <>
              {renderTopBarSidebarButton()}
              <FrostedLabel size="lg">页面标题</FrostedLabel>
            </>
          }
          rightSlot={renderTopBarSearchButton()}
        />
      </div>
    </GlassPreviewCard>
  )
}

// Docs definitions intentionally colocate preview components with exported page metadata.
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
