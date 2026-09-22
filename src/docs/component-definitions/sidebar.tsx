import { ComponentPreviewCard } from '../../components/component-preview-card'
import { SideBarDrawerPreview } from './sidebar-preview'
import type { ComponentDefinition } from '../component-docs'

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

export const sidebarDefinition = {
  id: 'sidebar',
  summary: '桌面纯色常驻侧栏，移动端磨砂抽屉',
  status: 'Preview',
  frame: 'plain',
  preview: () => (
    <ComponentPreviewCard label="侧边栏">
      <div className="sidebar-preview">
        {renderSideBarBlankPreview()}
        <SideBarDrawerPreview />
      </div>
    </ComponentPreviewCard>
  ),
} satisfies ComponentDefinition
