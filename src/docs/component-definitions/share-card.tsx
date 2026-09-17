import { ShareCard } from '../../components/share-card'
import type { ComponentDefinition } from '../component-docs'
import { mdRenderSample } from './markdown-sample'

export const shareCardDefinition = {
  id: 'share-card',
  summary: '复刻 Skyline 笔记共享页的分享纸组件',
  status: 'Ready',
  props: [
    { name: 'content', type: 'string', defaultValue: '-' },
    { name: 'tags', type: 'string[]', defaultValue: '[]' },
    { name: 'createdAt', type: 'Date', defaultValue: '-' },
    { name: 'useLunarDate', type: 'boolean', defaultValue: 'false' },
    { name: 'showTags', type: 'boolean', defaultValue: 'true' },
    { name: 'showNickname', type: 'boolean', defaultValue: 'true' },
    { name: 'showDate', type: 'boolean', defaultValue: 'true' },
    { name: 'showBrand', type: 'boolean', defaultValue: 'true' },
    { name: 'nickname', type: 'string', defaultValue: '-' },
    { name: 'brandLabel', type: 'string', defaultValue: 'weimo.ink' },
    { name: 'brandIcon', type: 'ReactNode', defaultValue: '-' },
    { name: 'font', type: "'default' | 'print'", defaultValue: "'default'" },
    { name: 'largeText', type: 'boolean', defaultValue: 'false' },
    {
      name: '...articleProps',
      type: 'Omit<ComponentPropsWithoutRef<"article">, "children">',
      defaultValue: '-',
    },
  ],
  preview: () => (
    <div className="share-card-docs-preview">
      <ShareCard
        aria-label="共享笔记预览"
        content={mdRenderSample}
        createdAt={new Date(2026, 4, 2)}
        font="print"
        largeText
        nickname="青简"
        tags={['春夜', '手记', '灵感']}
        useLunarDate
      />
    </div>
  ),
} satisfies ComponentDefinition
