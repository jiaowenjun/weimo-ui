import { Menu, Search } from 'lucide-react'

import { ComponentPreviewCard } from '../../components/component-preview-card'
import { GlassIconButton } from '../../components/glass-icon-button'
import { GhostIconButton } from '../../components/ghost-icon-button'
import { TopBar } from '../../components/top-bar'
import type { ComponentDefinition } from '../component-docs'

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
  const Button = ghost ? GhostIconButton : GlassIconButton

  return (
    <Button aria-label="搜索">
      <Search />
    </Button>
  )
}

export const topBarDefinition = {
  id: 'top-bar',
  summary: '响应式顶部工具栏，承载调用方提供的操作',
  status: 'Preview',
  frame: 'plain',
  preview: () => (
    <ComponentPreviewCard label="顶部工具栏">
      <TopBar
        className="top-bar-preview"
        leftSlot={renderTopBarSidebarButton()}
        rightSlot={renderTopBarSearchButton()}
      />
    </ComponentPreviewCard>
  ),
} satisfies ComponentDefinition
