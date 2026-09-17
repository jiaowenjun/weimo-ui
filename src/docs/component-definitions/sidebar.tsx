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
  props: [
    { name: 'open', type: 'boolean', defaultValue: 'false' },
    { name: 'onClose', type: '() => void', defaultValue: '-' },
    { name: 'showCloseButton', type: 'boolean', defaultValue: 'false' },
    { name: 'closeButtonLabel', type: 'string', defaultValue: '关闭侧边栏' },
    { name: 'drawerAction', type: 'ReactNode', defaultValue: '-' },
    { name: 'ariaLabel', type: 'string', defaultValue: '侧边栏' },
    { name: 'children', type: 'ReactNode', defaultValue: '-' },
    { name: 'className', type: 'string', defaultValue: '-' },
    {
      name: '...panelProps',
      type: 'Omit<ComponentPropsWithoutRef<"div">, "aria-label" | "children" | "className" | "id">',
      defaultValue: '-',
    },
  ],
  preview: () => (
    <div className="sidebar-preview">
      {renderSideBarBlankPreview()}
      <SideBarDrawerPreview />
    </div>
  ),
} satisfies ComponentDefinition
