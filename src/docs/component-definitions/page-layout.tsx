import { Menu, Search } from 'lucide-react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import { GlassIconButton } from '../../components/glass-icon-button'
import { GhostIconButton } from '../../components/ghost-icon-button'
import { TopBar } from '../../components/top-bar'
import type { ComponentDefinition } from '../component-docs'

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
    <ComponentPreviewCard label="侧边栏">
      <div className="sidebar-preview">
        {renderSideBarBlankPreview()}
        <SideBarDrawerPreview />
      </div>
    </ComponentPreviewCard>
  )
}

function renderTopBarSidebarButton({
  ghost = false,
}: { ghost?: boolean } = {}) {
  const Button = ghost ? GhostIconButton : GlassIconButton

  return (
    <Button aria-label="打开侧边栏">
      <Menu />
    </Button>
  )
}

function renderTopBarSearchButton({
  ghost = false,
}: { ghost?: boolean } = {}) {
  const Button = ghost ? GlassIconButton : GhostIconButton

  return (
    <Button aria-label="搜索">
      <Search />
    </Button>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
function TopBarDemo() {
  return (
    <ComponentPreviewCard label="顶部工具栏">
      <TopBar
        className="top-bar-preview"
        leftSlot={renderTopBarSidebarButton()}
        rightSlot={renderTopBarSearchButton()}
      />
    </ComponentPreviewCard>
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
