import { BaseCard } from '../../components/base-card'
import type { ComponentDefinition } from '../component-docs'

// Docs definitions intentionally colocate preview components with exported page metadata.
// eslint-disable-next-line react-refresh/only-export-components
function BaseCardDemo() {
  return (
    <BaseCard
      aria-label="BaseCard 基础卡片预览"
      className="base-card-docs-preview"
    >
      <p className="base-card-docs-preview__title">卡片标题</p>
      <p className="base-card-docs-preview__body">
        基础卡片在卡片材质上提供与笔记卡片一致的圆角与内边距,不包含顶栏、正文、标签等任何业务结构。
      </p>
      <p className="base-card-docs-preview__note">
        内容区的 DEBUG 虚线边框用于观察卡片布局,注释掉 base-card.css 中的
        .base-card::before 规则即可隐藏。
      </p>
    </BaseCard>
  )
}

export const baseCardDefinition = {
  id: 'base-card',
  summary:
    '卡片材质上的最小卡片壳层:与 Card 一致的圆角与内边距,内容区带临时 DEBUG 虚线边框',
  status: 'Preview',
  frame: 'plain',
  searchAliases: ['BaseCard', '卡片壳层'],
  preview: () => <BaseCardDemo />,
} satisfies ComponentDefinition
